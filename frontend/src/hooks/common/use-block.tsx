"use client";

import { useState, useEffect } from "react";
import { BlockNoteEditor, type Block } from "@blocknote/core";
import { useQueryClient } from "@tanstack/react-query";
import type { GetDetailNoteResponse } from "~/api/notes";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import {
  convertFromBlockNoteFormat,
  convertToBlockNoteFormat,
} from "~/lib/block";
import {
  useBlockCreate,
  useBlockDelete,
  useBlockReorder,
  useBlockUpdate,
} from "~/atoms/blocks";
import type { TBlockItem } from "~/api/blocks";

interface UseBlocksOptions {
  noteId: string;
  editor: BlockNoteEditor | null;
}

export function useBlocks({ noteId, editor }: UseBlocksOptions) {
  const { mutateAsync: createBlock } = useBlockCreate();
  const { mutateAsync: updateBlock } = useBlockUpdate();
  const { mutateAsync: deleteBlock } = useBlockDelete();
  const { mutateAsync: reorderBlock } = useBlockReorder();

  const queryClient = useQueryClient();
  const note = queryClient.getQueryData<GetDetailNoteResponse>([
    QUERY_KEY_NOTES.NOTES_DETAIL,
  ])?.payload;

  const [blocks, setBlocks] = useState<Block[]>(
    convertToBlockNoteFormat(note?.blocks || []),
  );

  useEffect(() => {
    if (note?.blocks) {
      editor?.replaceBlocks(editor?.document, blocks);
    }
  }, [note, editor]);

  const handleEditorChange = async () => {
    if (!editor) return;

    try {
      const currentBlocks = editor.document.slice(0, -1);
      const newBlocks = convertFromBlockNoteFormat(currentBlocks);

      const existingBlockMap = new Map(blocks.map((b) => [b.id, b]));

      const blocksToCreate = newBlocks.filter(
        (b) => !b?.id || !existingBlockMap.has(b.id),
      );

      const blocksToUpdate = newBlocks.filter((b) => {
        if (!b?.id || !existingBlockMap.has(b.id)) return false;

        const existing = existingBlockMap.get(b.id);

        return (
          JSON.stringify(existing?.content) !== b.content ||
          existing?.type !== b.type ||
          JSON.stringify(existing?.props) !== b.props
        );
      });

      const reorderedBlocks = newBlocks.filter((b, newIndex) => {
        if (!b?.id || !existingBlockMap.has(b.id)) return false;

        const prevIndex = blocks.findIndex((blk) => blk.id === b.id);
        return prevIndex !== newIndex;
      });

      const newBlockIds = new Set(newBlocks.map((b) => b.id).filter(Boolean));
      const blocksToDelete = blocks
        .filter((b) => b?.id && !newBlockIds.has(b.id))
        .map((b) => b.id!);

      const createdBlocks: TBlockItem[] = [];

      for (const block of blocksToCreate) {
        const createdBlock = await createBlock({
          ...block,
          position: +block.position!,
          note_id: noteId,
        });

        createdBlocks.push(createdBlock.payload);
      }

      setBlocks((prev) => [
        ...prev,
        ...convertToBlockNoteFormat(createdBlocks),
      ]);

      const updatedBlocks: Block[] = [];

      for (const block of blocksToUpdate) {
        await updateBlock({
          body: {
            ...block,
            position: +block.position!,
            note_id: noteId,
          },
          params: {
            id: block.id!,
          },
        });

        updatedBlocks.push(convertToBlockNoteFormat([block])[0]);
      }

      setBlocks((prev) => {
        const blockMap = new Map(prev.map((b) => [b.id, b]));

        for (const updated of updatedBlocks) {
          blockMap.set(updated.id!, updated);
        }

        return Array.from(blockMap.values());
      });

      for (const id of blocksToDelete) {
        await deleteBlock({
          id,
        });
      }

      setBlocks((prev) => prev.filter((b) => !blocksToDelete.includes(b.id!)));

      if (reorderedBlocks.length > 0) {
        const reorderPayload = reorderedBlocks.map((block) => ({
          id: block.id!,
          position: +block.position!,
          parentId: block.parent_id || null,
        }));

        await reorderBlock(reorderPayload);

        setBlocks((prev) => {
          const blockMap = new Map(prev.map((b) => [b.id, b]));
          for (const block of reorderedBlocks) {
            blockMap.set(block.id!, convertToBlockNoteFormat([block])[0]);
          }
          return Array.from(blockMap.values());
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
