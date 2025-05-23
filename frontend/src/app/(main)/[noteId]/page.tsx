"use client";
import { SmilePlus, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import IconPicker from "~/_components/notes/icon-picker";
import Navbar from "~/_components/notes/navbar";
import { Button } from "~/_components/ui/button";
import { Skeleton } from "~/_components/ui/skeleton";
import { useNoteDetail, useNoteUpdate } from "~/atoms/notes";
import { useDocumentTitle, useEmojiAsFavicon } from "~/hooks/common/use-head";
import { cn } from "~/lib/utils";

const Editor = dynamic(() => import("~/_components/blocks/editor"), {
  ssr: false,
  loading: () => (
    <div className="space-y-2 pt-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  ),
});

export default function page() {
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const { data, isFetching: isNoteLoading } = useNoteDetail({
    params: {
      id: params.noteId as string,
    },
  });

  useDocumentTitle(data?.payload?.title);
  useEmojiAsFavicon(data?.payload?.icon, "/favicon.ico");

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
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

        <div className="relative w-full max-w-3xl px-14">
          <div className="group/header relative">
            <div className="border-border mb-2 flex w-fit divide-x overflow-hidden rounded-lg border opacity-0 group-hover/header:opacity-100">
              {!data?.payload?.icon && (
                <IconPicker
                  onChange={(icon) => handleIconChange(icon as string)}
                  className="flex items-center gap-2 p-2"
                  asChild
                >
                  <Button
                    variant={"ghost"}
                    className="rounded-none hover:scale-100"
                  >
                    <SmilePlus />
                    <p> Add Icon</p>
                  </Button>
                </IconPicker>
              )}
              {/* <Button
                variant={"ghost"}
                className="rounded-none hover:scale-100"
              >
                <ImagePlus />
                <p>Add Cover Image</p>
              </Button> */}
            </div>
            {data?.payload?.icon && (
              <div className="group/icon absolute -top-8 right-8 transition hover:scale-105">
                <IconPicker
                  onChange={(icon) => handleIconChange(icon as string)}
                  className="flex items-center gap-2 p-2"
                  asChild
                >
                  <div className="bg-accent group text-accent-foreground flex size-16 cursor-pointer items-center justify-center rounded-full transition-all duration-200 group-hover/header:opacity-100">
                    <p className="text-3xl transition group-hover:opacity-60">
                      {data?.payload?.icon}
                    </p>
                  </div>
                </IconPicker>
                <Button
                  size={"icon"}
                  variant={"destructive"}
                  className="absolute top-0.5 right-0.5 size-4 p-2 text-white opacity-0 transition-all duration-200 group-hover/icon:opacity-100"
                  onClick={() => handleIconChange("")}
                >
                  <X />
                </Button>
              </div>
            )}
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
                className={cn("text-6xl font-semibold outline-none", {
                  "border-b border-gray-300 px-1": isEditing,
                })}
              >
                {data?.payload?.title}
              </h1>
            )}
          </div>

          {isNoteLoading ? (
            <div className="space-y-2 pt-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : isMounted ? (
            <Editor editable />
          ) : (
            <div className="space-y-2 pt-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
