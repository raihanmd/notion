import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { BlockNoteEditor, type Block } from "@blocknote/core";
import { debounce } from "lodash";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import type { GetDetailNoteResponse } from "~/api/notes";
import { env } from "~/env";
import { axiosInstance } from "~/lib/axios-instance";

interface BlockData {
  id?: string;
  noteId: string;
  parentId?: string | null;
  type: Block["type"];
  content: string;
  position: number;
}

interface ReorderBlockData {
  id: string;
  position: number;
  parentId?: string | null;
}

interface UseBlocksOptions {
  noteId: string;
  editor: BlockNoteEditor | null;
  autosave?: boolean;
  autosaveDelay?: number;
}

export function useBlocks({
  noteId,
  editor,
  autosave = true,
  autosaveDelay = 1000,
}: UseBlocksOptions) {
  const { data: session } = useSession();
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const contentChangedRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Initialize socket connection
  const initSocket = useCallback(() => {
    if (!session?.user) return;

    socketRef.current = io(`${env.NEXT_PUBLIC_API_URL}/blocks`, {
      auth: { user: session.user },
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to blocks WebSocket server");
      socketRef.current?.emit("joinNote", { noteId });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from blocks WebSocket server");
    });

    socketRef.current.on("blockChanged", handleRemoteBlockChange);

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveNote", { noteId });
        socketRef.current.disconnect();
      }
    };
  }, [session, noteId]);

  // Load blocks on mount
  useEffect(() => {
    fetchBlocks();
    const cleanup = initSocket();

    return () => {
      cleanup?.();
    };
  }, [noteId, session]);

  // Setup autosave when editor changes
  useEffect(() => {
    if (!editor || !autosave) return;

    const debouncedSave = debounce(() => {
      if (contentChangedRef.current) {
        saveContent();
      }
    }, autosaveDelay);

    const handleEditorChange = () => {
      contentChangedRef.current = true;
      debouncedSave();
    };

    // Connect to editor content change event
    const unsubscribe = editor.onChange(handleEditorChange);

    return () => {
      debouncedSave.cancel();
      unsubscribe?.();
    };
  }, [editor, autosave, autosaveDelay]);

  // Fetch blocks from API
  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const note = queryClient.getQueryData<GetDetailNoteResponse>([
        QUERY_KEY_NOTES.NOTES_DETAIL,
      ]);

      const fetchedBlocks = note?.payload?.blocks || [];
      setBlocks(fetchedBlocks);

      // Update editor content if editor exists and this is the initial load
      if (editor && isInitialLoadRef.current && fetchedBlocks.length > 0) {
        const blocknoteBlocks = convertToBlockNoteFormat(fetchedBlocks);
        editor.replaceBlocks(editor.topLevelBlocks, blocknoteBlocks);
        isInitialLoadRef.current = false;
      }
    } catch (err) {
      console.error("Error fetching blocks:", err);
      setError("Failed to load blocks");
    } finally {
      setLoading(false);
    }
  };

  // Save content to API
  const saveContent = async () => {
    if (!editor) return;

    try {
      setSaving(true);

      // Get current blocks from editor
      const currentBlocks = editor.document;

      // Convert to our format
      const blocksToSave = convertFromBlockNoteFormat(currentBlocks);
      console.log("Saving blocks:", blocksToSave.length);

      // Compare with existing blocks to determine which ones to update/create/delete
      const existingBlockIds = new Set(blocks.map((b) => b.id));
      const updatedBlockIds = new Set(
        blocksToSave
          .filter((b) => b.id && existingBlockIds.has(b.id))
          .map((b) => b.id),
      );

      // Blocks to create (id exists but not in existing blocks or no id at all)
      const blocksToCreate = blocksToSave.filter(
        (b) => !b.id || !existingBlockIds.has(b.id),
      );

      // Blocks to update (has id and content/order changed)
      const blocksToUpdate = blocksToSave.filter((b) => {
        if (!b.id || !existingBlockIds.has(b.id)) return false;
        const existing = blocks.find((eb) => eb.id === b.id);
        if (!existing) return false;

        return (
          existing.content !== b.content ||
          existing.position !== b.position ||
          existing.parentId !== b.parentId
        );
      });

      // Blocks to delete (exists in DB but not in editor)
      const blocksToDelete = blocks
        .filter((b) => b.id && !updatedBlockIds.has(b.id))
        .map((b) => b.id);

      // Process creates
      for (const block of blocksToCreate) {
        const created = await createBlock({
          ...block,
          noteId,
        });

        // Emit via socket
        emitBlockChange("create", created);
      }

      // Process updates
      for (const block of blocksToUpdate) {
        const updated = await updateBlock(block as BlockData & { id: string });

        // Emit via socket
        emitBlockChange("update", updated);
      }

      // Process deletes
      for (const id of blocksToDelete) {
        await deleteBlock(id!);

        // Emit via socket
        emitBlockChange("delete", { id });
      }

      // Update local blocks state with saved data
      const updatedBlocks = [
        ...blocksToSave.map((block) => ({
          ...block,
          noteId, // Ensure noteId is set
        })),
      ];

      setBlocks(updatedBlocks);
      contentChangedRef.current = false;
      setLastSaved(new Date());
    } catch (err) {
      console.error("Error saving blocks:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Create a new block
  const createBlock = async (data: Omit<BlockData, "id">) => {
    try {
      const response = await axiosInstance({
        method: "post",
        url: "/v1/blocks",
        data,
      });
      return response.data;
    } catch (err) {
      console.error("Error creating block:", err);
      throw err;
    }
  };

  // Update a block
  const updateBlock = async (data: Partial<BlockData> & { id: string }) => {
    if (!data.id) return;
    try {
      const response = await axiosInstance({
        method: "put",
        url: `/v1/blocks/${data.id}`,
        data,
      });
      return response.data;
    } catch (err) {
      console.error("Error updating block:", err);
      throw err;
    }
  };

  // Delete a block
  const deleteBlock = async (id: string) => {
    try {
      const response = await axiosInstance({
        method: "delete",
        url: `/v1/blocks/${id}`,
      });
      return response.data;
    } catch (err) {
      console.error("Error deleting block:", err);
      throw err;
    }
  };

  // Reorder blocks
  const reorderBlocks = async (blocks: ReorderBlockData[]) => {
    try {
      const response = await axiosInstance({
        method: "put",
        url: `/v1/blocks/reorder`,
        data: { blocks },
      });

      // Emit via socket
      emitBlockChange("reorder", { blocks });

      return response.data;
    } catch (err) {
      console.error("Error reordering blocks:", err);
      throw err;
    }
  };

  // Handle remote block changes received via WebSocket
  const handleRemoteBlockChange = (data: any) => {
    // Skip if this change was initiated by the current user
    if (data.userId === session?.user?.id) return;

    console.log("Received remote block change:", data);

    switch (data.action) {
      case "create":
        // Add new block to local state
        setBlocks((prev) => [...prev, data.block]);
        break;

      case "update":
        // Update block in local state
        setBlocks((prev) =>
          prev.map((b) => (b.id === data.block.id ? data.block : b)),
        );
        break;

      case "delete":
        // Remove block from local state
        setBlocks((prev) => prev.filter((b) => b.id !== data.block.id));
        break;

      case "reorder":
        // Update order of blocks
        fetchBlocks();
        break;
    }

    // Update editor content if needed
    if (editor) {
      // For simple updates, we could apply the changes directly
      // For more complex changes, refetch all blocks
      fetchBlocks();
    }
  };

  // Emit block change via socket
  const emitBlockChange = (action: string, data: any) => {
    if (!socketRef.current || !session?.user?.id) return;

    console.log("Emitting block change:", action, data);

    socketRef.current.emit("blockChange", {
      action,
      userId: session.user.id,
      noteId,
      block: data,
    });
  };

  // Convert from BlockNote format to our API format
  const convertFromBlockNoteFormat = (blocks: any[]): BlockData[] => {
    const result: BlockData[] = [];

    // Process top-level blocks
    blocks.forEach((block, index) => {
      // Convert content to string
      const content = JSON.stringify(block.content);

      // Add to result
      result.push({
        id: block.id,
        noteId,
        type: block.type,
        content,
        position: index,
        parentId: null,
      });

      // Process children if any
      if (block.children && block.children.length > 0) {
        processChildren(block.children, block.id, result);
      }
    });

    return result;
  };

  // Helper function to process children blocks
  const processChildren = (
    children: any[],
    parentId: string,
    result: BlockData[],
  ) => {
    children.forEach((child, index) => {
      // Convert content to string
      const content = JSON.stringify(child.content);

      // Add to result
      result.push({
        id: child.id,
        noteId,
        type: child.type,
        content,
        position: index,
        parentId: parentId,
      });

      // Process children if any
      if (child.children && child.children.length > 0) {
        processChildren(child.children, child.id, result);
      }
    });
  };

  // Convert from our API format to BlockNote format
  const convertToBlockNoteFormat = (blocks: BlockData[]) => {
    // First, organize blocks by parent
    const blocksByParent = new Map<string | null, BlockData[]>();

    blocks.forEach((block) => {
      const parentId = block.parentId || null;
      if (!blocksByParent.has(parentId)) {
        blocksByParent.set(parentId, []);
      }
      blocksByParent.get(parentId)!.push(block);
    });

    // Then build the tree starting from the top level (null parent)
    const buildTree = (parentId: string | null): any[] => {
      const children = blocksByParent.get(parentId) || [];

      // Sort by order index
      children.sort((a, b) => a.position - b.position);

      return children.map((block) => {
        let parsedContent;
        try {
          parsedContent = JSON.parse(block.content);
        } catch (e) {
          console.error("Failed to parse block content:", block.content);
          parsedContent = [];
        }

        const blockChildren = buildTree(block.id!);

        return {
          id: String(block.id),
          type: block.type,
          content: parsedContent,
          children: blockChildren,
        };
      });
    };

    return buildTree(null);
  };

  // Force save (manual save)
  const forceSave = () => {
    contentChangedRef.current = true;
    saveContent();
  };

  return {
    blocks,
    loading,
    saving,
    error,
    lastSaved,

    // Methods
    fetchBlocks,
    saveContent: forceSave,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
}
