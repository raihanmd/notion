"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { debounce } from "lodash";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useBlocks } from "~/hooks/common/use-block";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";

type Props = {
  onChange?: (value: string) => void;
  editable?: boolean;
};

export default function Editor({ editable = true }: Props) {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote();
  const params = useParams();
  const noteId = params?.noteId as string;

  const { handleEditorChange } = useBlocks({
    noteId,
    editor,
  });

  const onEditorChange = debounce(() => {
    handleEditorChange();
  }, 1000);

  return (
    <div className="relative">
      <BlockNoteView
        onChange={onEditorChange}
        className="-mx-14 pt-5"
        editor={editor}
        editable={editable}
        theme={{
          colors: {
            editor: {
              background: resolvedTheme === "dark" ? "#0a0a0a" : "#fff",
              text: resolvedTheme === "dark" ? "#fff" : "#0a0a0a",
            },
          },
        }}
      />
    </div>
  );
}
