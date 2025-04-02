"use client";
import { CirclePlus, Notebook, Star, FileText, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/_components/ui/button";
import { useCreateNote, useNotesList } from "~/atoms/notes";
import { useState } from "react";
import { WavingEmoji } from "~/_components/ui/waing-emoji";
import dayjs from "dayjs";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [{ data, isFetching }] = useNotesList();
  const { mutateAsync, isPending } = useCreateNote();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNote = async () => {
    const res = await mutateAsync({ title: "Untitled", content: "" });
    router.push(`/${res.payload.id}`);
  };

  // const quickAccess = [
  //   {
  //     id: "recent1",
  //     title: "Meeting Notes",
  //     icon: FileText,
  //     date: "Edited 2h ago",
  //   },
  //   {
  //     id: "recent2",
  //     title: "Project Ideas",
  //     icon: FileText,
  //     date: "Edited yesterday",
  //   },
  // ];

  return (
    <div className="bg-background min-h-[calc(100dvh-3rem)] overflow-auto p-6">
      {/* Header with greeting and search */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-semibold">
          <WavingEmoji /> Hello, {session?.user?.name || "there"}
        </h1>
        {/* <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search..."
            className="bg-muted/50 border-none pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
      </div>

      {/* Main content */}
      {data?.payload && data.payload.length > 0 ? (
        <div className="space-y-8">
          {/* Quick access section */}
          {/* <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-medium">
                <Clock className="text-muted-foreground h-5 w-5" />
                Quick Access
              </h2>
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickAccess.map((item) => (
                <div
                  key={item.id}
                  className="group border-border hover:border-foreground/20 hover:bg-accent/50 flex cursor-pointer items-start rounded-lg border p-4 transition-all"
                  onClick={() => router.push(`/${item.id}`)}
                >
                  <div className="mt-0.5 mr-3">
                    <item.icon className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground truncate font-medium">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.date}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div
                className="border-border hover:border-foreground/20 flex cursor-pointer items-center justify-center rounded-lg border border-dashed p-4 transition-all"
                onClick={handleCreateNote}
              >
                <Plus className="text-muted-foreground mr-2 h-5 w-5" />
                <span className="text-muted-foreground">New note</span>
              </div>
            </div>
          </section> */}

          {/* Recent notes section */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-medium">
                <FileText className="text-muted-foreground h-5 w-5" />
                Recent Notes
              </h2>
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.payload.map((note) => {
                const lastUpdatedHour = dayjs().diff(
                  dayjs(note.updated_at),
                  "h",
                );
                return (
                  <div
                    key={note.id}
                    className="group border-border hover:border-foreground/20 hover:bg-accent/50 flex cursor-pointer items-start rounded-lg border p-4 transition-all"
                    onClick={() => router.push(`/${note.id}`)}
                  >
                    <div className="mt-0.5 mr-3">
                      <FileText className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground truncate font-medium">
                        {note.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Last edited{" "}
                        {lastUpdatedHour > 0
                          ? lastUpdatedHour > 24
                            ? "yesterday"
                            : `${lastUpdatedHour}h ago`
                          : "recently"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-5 py-20">
          <div className="relative">
            <Notebook className="text-muted-foreground h-32 w-32 -rotate-12" />
          </div>
          <h3 className="text-muted-foreground text-xl font-medium">
            You don&apos;t have any notes yet
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-center">
            Create your first note to get started with organizing your thoughts
            and ideas.
          </p>
          <Button
            disabled={isPending}
            onClick={handleCreateNote}
            className="gap-2"
          >
            <CirclePlus className="h-5 w-5" />
            Create a note
          </Button>
        </div>
      )}

      {/* Floating action button for mobile */}
      <Button
        onClick={handleCreateNote}
        disabled={isPending}
        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
