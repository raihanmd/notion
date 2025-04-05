"use client";
import { CirclePlus, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import {
  useNoteCreate,
  useNoteDelete,
  useNotesListSidebar,
  useNoteUpdate,
} from "~/atoms/notes";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { mutateAsync: updateNoteAsync, isPending: isUpdatePending } =
    useNoteUpdate();
  const { mutateAsync: deleteNoteAsync, isPending: isDeletePending } =
    useNoteDelete();
  const { data, isLoading } = useNotesListSidebar();
  const { mutateAsync, isPending } = useNoteCreate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Map of refs for each editable title
  const editableRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const handleCreateNote = async () => {
    const res = await mutateAsync({ title: "Untitled", content: "" });
    router.push(`/${res.payload.id}`);
  };

  const handleTitleDoubleClick = (id: string) => {
    setEditingId(id);
  };

  const handleTitleSave = async (id: string) => {
    const editableElement = editableRefs.current.get(id);
    if (!editableElement) return;

    let newTitle = editableElement.textContent || "";

    if (newTitle.trim() === "") {
      newTitle = "Untitled";
      editableElement.textContent = newTitle;
    }

    try {
      await updateNoteAsync({
        body: {
          title: newTitle,
        },
        params: {
          id,
        },
      });
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error("Failed to update title");
    } finally {
      setEditingId(null);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      // Reset to original title
      const item = data?.payload?.find((note) => note.id === id);
      if (item && editableRefs.current.get(id)) {
        const editableElement = editableRefs.current.get(id);
        if (editableElement) {
          editableElement.textContent = item.title;
        }
      }
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNoteAsync({ id: noteToDelete });

      if (pathname === `/${noteToDelete}`) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    } finally {
      setNoteToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Set up focus and selection when editing starts
  useEffect(() => {
    if (editingId) {
      const editableElement = editableRefs.current.get(editingId);
      if (editableElement) {
        editableElement.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editableElement);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [editingId]);

  // Store the ref for each editable element
  const setEditableRef = (id: string, element: HTMLSpanElement | null) => {
    if (element) {
      editableRefs.current.set(id, element);
    }
  };

  return (
    <>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <Link href={"/"} className="py-5 text-center font-bold">
            Notion
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenuButton
                onClick={handleCreateNote}
                disabled={isPending}
                className="items-center"
                variant={"outline"}
              >
                <CirclePlus className="h-4 w-4" />
                <span className="text-sm">New note</span>
              </SidebarMenuButton>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Your notes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {!data || isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="bg-muted h-8 w-full rounded-md"
                      />
                    ))
                  : data?.payload?.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === `/${item.id}`}
                          className="group/item"
                        >
                          <div className="flex w-full justify-between">
                            <Link
                              prefetch
                              href={item.id}
                              className="flex-1 truncate"
                              onClick={(e) => {
                                // Prevent navigation when editing
                                if (editingId === item.id) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <div className="flex items-center">
                                {item?.icon && (
                                  <span className="mr-2">{item.icon}</span>
                                )}
                                <span
                                  className={cn({
                                    truncate: editingId !== item.id,
                                    "border-b border-gray-300 px-1 outline-none":
                                      editingId === item.id,
                                  })}
                                  ref={(el) => setEditableRef(item.id, el)}
                                  contentEditable={editingId === item.id}
                                  suppressContentEditableWarning={true}
                                  onBlur={() => handleTitleSave(item.id)}
                                  onKeyDown={(e) =>
                                    handleTitleKeyDown(e, item.id)
                                  }
                                  onDoubleClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTitleDoubleClick(item.id);
                                  }}
                                >
                                  {item.title}
                                </span>
                              </div>
                            </Link>

                            <DropdownMenu modal>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.preventDefault()}
                              >
                                <Button
                                  variant={"ghost"}
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/item:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  disabled={
                                    isDeletePending ||
                                    isUpdatePending ||
                                    isPending
                                  }
                                  onClick={() =>
                                    handleTitleDoubleClick(item.id)
                                  }
                                >
                                  <Pencil className="size-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={
                                    isDeletePending ||
                                    isUpdatePending ||
                                    isPending
                                  }
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setNoteToDelete(item.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="text-destructive size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant={"destructive"} onClick={handleDeleteNote}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
