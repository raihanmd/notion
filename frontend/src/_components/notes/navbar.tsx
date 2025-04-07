"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import type { GetDetailNoteResponse } from "~/api/notes";
import { SidebarTrigger } from "../ui/sidebar";
import { useNoteUpdate } from "~/atoms/notes";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import { cn } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Copy, Link, LockKeyhole, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function Navbar() {
  const queryClient = useQueryClient();
  const [openSharePolicy, setOpenSharePolicy] = useState<boolean>(false);
  const [selectedSharePolicy, setSelectedSharePolicy] =
    useState<string>("PRIVATE");
  const linkInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpdateSharePolicy = async () => {
    try {
      await updateNoteAsync({
        body: {
          share_policy: selectedSharePolicy,
        },
        params: {
          id: note?.payload?.id!,
        },
      });
      toast.success(
        `Share policy updated to ${sharePolicyMap[selectedSharePolicy]}`,
      );
      setOpenSharePolicy(false);
    } catch (error) {
      console.error("Failed to update share policy:", error);
      toast.error("Failed to update share policy");
    }
  };

  const copyLinkToClipboard = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      navigator.clipboard.writeText(linkInputRef.current.value);
      toast.success("Link copied to clipboard");
    }
  };

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

  useEffect(() => {
    if (note?.payload?.share_policy) {
      setSelectedSharePolicy(note.payload.share_policy);
    }
  }, [note?.payload?.share_policy]);

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
      if (editableRef.current) {
        editableRef.current.textContent = note?.payload?.title || "";
      }
    }
  };

  const getShareableLink = () => {
    if (!note?.payload?.id) return "";
    return `${window.location.origin}/${note.payload.id}`;
  };

  return (
    <>
      <div className="flex items-center justify-between">
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
        <Button
          variant={"outline"}
          className="rounded-full"
          iconPlacement="left"
          icon={
            sharePolicyIcon[
              note?.payload?.share_policy || "PRIVATE"
            ] as React.ElementType
          }
          onClick={() => setOpenSharePolicy(true)}
        >
          {sharePolicyMap[note?.payload?.share_policy || "PRIVATE"]}
        </Button>
      </div>

      <AlertDialog open={openSharePolicy} onOpenChange={setOpenSharePolicy}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="truncate">
              Share "{note?.payload?.icon} {note?.payload?.title}"
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  ref={linkInputRef}
                  value={getShareableLink()}
                  readOnly
                  disabled={selectedSharePolicy !== "SHARE_WITH_LINK"}
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={copyLinkToClipboard}
                disabled={selectedSharePolicy !== "SHARE_WITH_LINK"}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">General access</h4>
            <RadioGroup
              value={selectedSharePolicy}
              onValueChange={setSelectedSharePolicy}
              className="space-y-3"
            >
              <div
                className={cn(
                  "flex items-center space-x-3 rounded-md border p-3",
                  selectedSharePolicy === "PRIVATE"
                    ? "border-primary"
                    : "border-border",
                )}
              >
                <RadioGroupItem value="PRIVATE" id="private" />
                <Label
                  htmlFor="private"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <LockKeyhole className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Private</p>
                    <p className="text-muted-foreground text-xs">
                      Only you can access
                    </p>
                  </div>
                </Label>
              </div>

              <div
                className={cn(
                  "flex items-center space-x-3 rounded-md border p-3",
                  selectedSharePolicy === "SHARE_WITH_LINK"
                    ? "border-primary"
                    : "border-border",
                )}
              >
                <RadioGroupItem value="SHARE_WITH_LINK" id="restricted" />
                <Label
                  htmlFor="restricted"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Restricted</p>
                    <p className="text-muted-foreground text-xs">
                      Only people with access can open with the link
                    </p>
                  </div>
                </Label>
              </div>

              {/* <div
                className={cn(
                  "flex items-center space-x-3 rounded-md border p-3",
                  selectedSharePolicy === "TEAM"
                    ? "border-primary"
                    : "border-border",
                )}
              >
                <RadioGroupItem value="TEAM" id="team" />
                <Label
                  htmlFor="team"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Team</p>
                    <p className="text-muted-foreground text-xs">
                      Everyone in your team can access
                    </p>
                  </div>
                </Label>
              </div> */}
            </RadioGroup>
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleUpdateSharePolicy}>
              {isUpdatePending ? "Saving..." : "Save"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const sharePolicyIcon: Record<string, React.ElementType> = {
  SHARE_WITH_LINK: Link,
  PRIVATE: LockKeyhole,
  TEAM: Users,
};

const sharePolicyMap: Record<string, string> = {
  SHARE_WITH_LINK: "Restricted",
  PRIVATE: "Private",
  TEAM: "Team",
};
