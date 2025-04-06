"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useRef } from "react";
import { debounce } from "lodash";
import { useBlocks } from "~/hooks/common/use-blocks";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import type { GetDetailNoteResponse } from "~/api/notes";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

type Props = {
  onChange?: (value: string) => void;
  editable?: boolean;
};

export default function Editor({ editable = true, onChange }: Props) {
  const queryClient = useQueryClient();
  const note = queryClient.getQueryData<GetDetailNoteResponse>([
    QUERY_KEY_NOTES.NOTES_DETAIL,
  ]);

  const editor = useCreateBlockNote();
  const contentChangedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { blocks, loading, saving, saveContent } = useBlocks({
    noteId: note?.payload?.id!,
    editor,
    autosave: false, // We'll handle saving manually to avoid loops
  });

  // Initialize editor with blocks when they're loaded
  useEffect(() => {
    if (!loading && blocks.length > 0 && editor) {
      console.log("Setting initial blocks in editor:", blocks.length);
      // This should now be handled in the useBlocks hook, but we double-check here
      // to ensure it's working properly
    }
  }, [blocks, loading, editor]);

  // Handle editor changes with proper debouncing
  const handleEditorChange = debounce(() => {
    if (!editor || !contentChangedRef.current) return;

    contentChangedRef.current = false;
    console.log("Saving content after editor change");

    if (onChange) {
      const serializedContent = JSON.stringify(editor.document);
      onChange(serializedContent);
    }

    saveContent();
  }, 1000);

  return (
    <BlockNoteView
      onChange={() => {
        contentChangedRef.current = true;

        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Schedule a new save
        handleEditorChange();
      }}
      className="-mx-14 pt-5"
      editor={editor}
      editable={editable}
      theme={{
        light: {
          colors: {
            editor: {
              background: "#fff",
              text: "#0a0a0a",
            },
          },
        },
        dark: {
          colors: {
            editor: {
              background: "#0a0a0a",
              text: "#fff",
            },
          },
        },
      }}
    />
  );
}
