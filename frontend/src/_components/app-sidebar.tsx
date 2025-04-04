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
  useCreateNote,
  useDeleteNote,
  useNotesListSidebar,
  useUpdateNote,
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
import { Input } from "./ui/input";
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

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { mutateAsync: updateNoteAsync, isPending: isUpdatePending } =
    useUpdateNote();
  const { mutateAsync: deleteNoteAsync, isPending: isDeletePending } =
    useDeleteNote();
  const { data, isLoading } = useNotesListSidebar();
  const { mutateAsync, isPending } = useCreateNote();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleCreateNote = async () => {
    const res = await mutateAsync({ title: "Untitled", content: "" });
    router.push(`/${res.payload.id}`);
  };

  const handleTitleDoubleClick = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleTitleSave = async (id: string) => {
    if (editingTitle.trim() === "") {
      setEditingTitle("Untitled");
    }

    try {
      await updateNoteAsync({
        body: {
          title: editingTitle,
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

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

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
                {isLoading
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
                            {editingId === item.id ? (
                              <Input
                                ref={inputRef}
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onBlur={() => handleTitleSave(item.id)}
                                onKeyDown={(e) =>
                                  handleTitleKeyDown(e, item.id)
                                }
                                className="h-6 px-1 py-0 text-sm"
                                autoFocus
                              />
                            ) : (
                              <Link
                                prefetch
                                href={item.id}
                                className="flex-1 truncate"
                                onDoubleClick={() =>
                                  handleTitleDoubleClick(item.id, item.title)
                                }
                              >
                                <div className="flex items-center">
                                  {item.icon && (
                                    <span className="mr-2">{item.icon}</span>
                                  )}
                                  <span className="truncate">{item.title}</span>
                                </div>
                              </Link>
                            )}
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
                                    handleTitleDoubleClick(item.id, item.title)
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
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
