"use client";
import { SmilePlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import IconPicker from "~/_components/notes/icon-picker";
import Navbar from "~/_components/notes/navbar";
import { Skeleton } from "~/_components/ui/skeleton";
import { useNoteDetail, useNoteUpdate } from "~/atoms/notes";
import { useDocumentTitle, useEmojiAsFavicon } from "~/hooks/common/use-head";
import { cn } from "~/lib/utils";

export default function page() {
  const params = useParams();
  const { data } = useNoteDetail({
    params: {
      id: params.noteId as string,
    },
  });

  useDocumentTitle(data?.payload?.title);
  useEmojiAsFavicon(data?.payload?.icon);

  const { mutateAsync: updateNoteAsync } = useNoteUpdate();

  const handleIconChange = async (icon: string) => {
    try {
      await updateNoteAsync({
        body: {
          icon,
        },
        params: {
          id: params.noteId as string,
        },
      });
    } catch (error) {
      console.error("Failed to update icon:", error);
    }
  };

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const editableRef = useRef<HTMLHeadingElement>(null);

  const handleTitleDoubleClick = () => {
    setIsEditing(true);
  };

  // Focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Select all text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleTitleSave = async () => {
    if (!editableRef.current) return;

    let newTitle = editableRef.current.textContent || "";

    if (newTitle.trim() === "") {
      newTitle = "Untitled";
      if (editableRef.current) {
        editableRef.current.textContent = newTitle;
      }
    }

    try {
      await updateNoteAsync({
        body: {
          title: newTitle,
        },
        params: {
          id: data?.payload?.id!,
        },
      });
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error("Failed to update title");
    } finally {
      setIsEditing(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      // Restore original content
      if (editableRef.current) {
        editableRef.current.textContent = data?.payload?.title || "";
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto flex flex-col items-center pt-4">
        <div className="relative aspect-video max-h-[25vh] w-full overflow-hidden rounded-xl" />

        <div className="w-full max-w-3xl -translate-y-7">
          <span className="flex items-center gap-2">
            <IconPicker onChange={(icon) => handleIconChange(icon as string)}>
              {data?.payload.icon ? (
                <p className="text-6xl transition hover:opacity-75">
                  {data?.payload?.icon}
                </p>
              ) : (
                <SmilePlus
                  size={70}
                  className="mr-4 transition hover:opacity-75"
                />
              )}
            </IconPicker>
            {!data ? (
              <Skeleton className="h-8 w-72" />
            ) : (
              <h1
                ref={editableRef}
                contentEditable={isEditing}
                onDoubleClick={handleTitleDoubleClick}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                suppressContentEditableWarning={true}
                className={cn("text-3xl font-semibold outline-none", {
                  "border-b border-gray-300 px-1": isEditing,
                })}
              >
                {data?.payload?.title}
              </h1>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
