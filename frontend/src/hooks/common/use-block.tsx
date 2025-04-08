"use client";
import { useEffect, useRef } from "react";
import { BlockNoteEditor, type Block } from "@blocknote/core";
import {
  convertFromBlockNoteFormat,
  convertToBlockNoteFormat,
} from "~/lib/block";
import { io, type Socket } from "socket.io-client";
import { env } from "~/env";
import { useBlocksAtom } from "~/atoms/blocks";

interface UseBlocksOptions {
  noteId: string;
  editor: BlockNoteEditor | null;
}

export function useBlocks({ noteId, editor }: UseBlocksOptions) {
  const [blocks, setBlocks] = useBlocksAtom(noteId);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${env.NEXT_PUBLIC_API_URL}/blocks`, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WS", socket.id);
      socket.emit("joinNote", { noteId });
    });

    socket.emit("joinNote", { noteId });

    socket.on("joinedNote", (data) => {
      setBlocks(convertToBlockNoteFormat(data.blocks || []));
    });

    socket.on("blocksCreated", (newBlocks) => {
      setBlocks((prev) => [...prev, ...convertToBlockNoteFormat(newBlocks)]);
    });

    socket.on("blocksUpdated", (incomingBlocks) => {
      const updatedBlocks = convertToBlockNoteFormat(incomingBlocks);

      setBlocks((prevBlocks) => {
        const updated = prevBlocks.map((block) => {
          const match = updatedBlocks.find((b) => b.id === block.id);
          return match ? { ...block, ...match } : block;
        });

        return updated;
      });
    });

    socket.on("blocksDeleted", (ids) => {
      setBlocks((prev) => prev.filter((b) => !ids.includes(b.id!)));
    });

    socket.on("blocksReordered", (reordered) => {
      const reorderedMap = new Map(
        convertToBlockNoteFormat(reordered).map((b) => [b.id, b]),
      );

      setBlocks(() => {
        const newOrder: Block[] = [];
        for (const { id } of reordered) {
          const block = reorderedMap.get(id!);
          if (block) newOrder.push(block);
        }
        return newOrder;
      });
    });

    socket.on("userJoined", ({ userId }) => {
      console.log("User joined:", userId);
    });

    socket.on("userLeft", ({ userId }) => {
      console.log("User left:", userId);
    });

    return () => {
      socket.emit("leaveNote", { noteId });
      socket.disconnect();
    };
  }, [noteId]);

  useEffect(() => {
    if (editor && blocks) {
      editor.replaceBlocks(editor.document, blocks);
    }
  }, [editor, blocks]);

  useEffect(() => {
    return () => {
      setBlocks([]);
    };
  }, [noteId]);

  const handleEditorChange = async () => {
    if (!editor) return;

    try {
      const currentBlocks = editor.document.slice(0, -1);
      const newBlocks = convertFromBlockNoteFormat(currentBlocks);

      const existingBlockMap = new Map(blocks.map((b) => [b.id, b]));

      const blocksToCreate = newBlocks
        .filter((b) => !b?.id || !existingBlockMap.has(b.id))
        .map((b) => ({
          ...b,
          note_id: noteId,
        }));

      const blocksToUpdate = newBlocks
        .filter((b) => {
          if (!b?.id || !existingBlockMap.has(b.id)) return false;

          const existing = existingBlockMap.get(b.id);

          return (
            JSON.stringify(existing?.content) !== b.content ||
            existing?.type !== b.type ||
            JSON.stringify(existing?.props) !== b.props
          );
        })
        .map((b) => ({
          ...b,
          note_id: noteId,
        }));

      const reorderedBlocks = newBlocks
        .filter((b, newIndex) => {
          if (!b?.id || !existingBlockMap.has(b.id)) return false;

          const prevIndex = blocks.findIndex((blk) => blk.id === b.id);
          return prevIndex !== newIndex;
        })
        .map((b) => ({
          ...b,
          note_id: noteId,
        }));

      const newBlockIds = new Set(newBlocks.map((b) => b.id).filter(Boolean));
      const blocksToDelete = blocks
        .filter((b) => b?.id && !newBlockIds.has(b.id))
        .map((b) => b.id!);

      if (blocksToCreate.length > 0) {
        socketRef.current?.emit("createManyBlocks", {
          noteId,
          blocks: blocksToCreate,
        });
      }

      if (blocksToUpdate.length > 0) {
        socketRef.current?.emit("updateManyBlocks", {
          noteId,
          blocks: blocksToUpdate,
        });
      }

      if (blocksToDelete.length > 0) {
        socketRef.current?.emit("deleteManyBlocks", {
          noteId,
          blocks: blocksToDelete,
        });
      }

      if (reorderedBlocks.length > 0) {
        socketRef.current?.emit("reorderBlocks", {
          noteId,
          blocks: reorderedBlocks,
        });
      }
    } catch (err) {
      console.error("Error saving blocks:", err);
    }
  };

  return {
    handleEditorChange,
  };
}
