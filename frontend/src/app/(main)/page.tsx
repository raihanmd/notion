"use client";
import {
  CirclePlus,
  Notebook,
  Star,
  FileText,
  Plus,
  Loader,
  Search,
} from "lucide-react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/_components/ui/button";
import { useNoteCreate, useNotesList } from "~/atoms/notes";
import { WavingEmoji } from "~/_components/ui/waing-emoji";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Input } from "~/_components/ui/input";
import debounce from "lodash/debounce";
import { useChangeUrlParams } from "~/hooks/common/use-change-url-params";
import type { TQueryParamsNotes } from "~/validation/notes";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { mutateAsync, isPending } = useNoteCreate();
  const { changeUrlParams } = useChangeUrlParams();

  const handleCreateNote = async () => {
    const res = await mutateAsync({ title: "Untitled", content: "" });
    router.push(`/${res.payload.id}`);
  };

  const params: TQueryParamsNotes = {
    search: searchParams.get("search") || "",
  };

  const { data, isFetching, refetch, isFetched } = useNotesList({ params });

  const handleSearch = debounce((search: string) => {
    changeUrlParams({
      newParams: { search },
      withPrevSearchParams: true,
    });
  }, 300);

  useEffect(() => {
    if (!isFetched) return;
    refetch();
  }, [isFetched, searchParams, refetch]);

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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-semibold">
          <WavingEmoji /> Hello, {session?.user?.name || "there"}
        </h1>
        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search..."
            className="bg-muted/50 border-none pl-8"
            isLoading={isFetching}
            defaultValue={params.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
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
                dayjs.extend(relativeTime);
                return (
                  <div
                    key={note.id}
                    className="group border-border hover:border-foreground/20 hover:bg-accent/50 flex cursor-pointer items-start rounded-lg border p-4 transition-all"
                    onClick={() => router.push(`/${note.id}`)}
                  >
                    <div className="mt-0.5 mr-3">
                      {note?.icon ? (
                        <span className="text-2xl">{note.icon}</span>
                      ) : (
                        <FileText className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground truncate font-medium">
                        {note.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Last edited {dayjs(note.updated_at).fromNow()}
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
      ) : isFetching ? (
        <div className="flex min-h-[calc(100dvh-10.5rem)] items-center justify-center text-center">
          <Loader className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <div className="relative mb-4">
            <Notebook className="text-muted-foreground h-32 w-32 -rotate-12" />
          </div>
          <h3 className="text-muted-foreground text-xl font-medium">
            Notes not found
          </h3>
          <p className="text-muted-foreground max-w-md text-center">
            Create your note to get started with organizing your thoughts and
            ideas.
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
