"use client";

import React, { useRef, useState, useEffect } from "react";
import type { GetDetailNoteResponse } from "~/api/notes";
import { SidebarTrigger } from "../ui/sidebar";
import { useNoteUpdate } from "~/atoms/notes";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import { cn } from "~/lib/utils";

export default function Navbar() {
  const queryClient = useQueryClient();

  const note = queryClient.getQueryData<GetDetailNoteResponse>([
    QUERY_KEY_NOTES.NOTES_DETAIL,
  ]);

  const { mutateAsync: updateNoteAsync, isPending: isUpdatePending } =
    useNoteUpdate();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const editableRef = useRef<HTMLParagraphElement>(null);

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
          id: note?.payload?.id!,
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
        editableRef.current.textContent = note?.payload?.title || "";
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <SidebarTrigger />
      {!note || isUpdatePending ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p
          ref={editableRef}
          contentEditable={isEditing}
          onDoubleClick={handleTitleDoubleClick}
          onBlur={handleTitleSave}
          onKeyDown={handleTitleKeyDown}
          suppressContentEditableWarning={true}
          className={cn("text-lg outline-none", {
            "border-b border-gray-300 px-1": isEditing,
          })}
        >
          {note?.payload?.title}
        </p>
      )}
    </div>
  );
}
