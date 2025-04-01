"use client";

import { CirclePlus, Notebook } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/_components/ui/button";
import { useCreateNote } from "~/atoms/notes";

export default function Page() {
  const ruoter = useRouter();
  const { mutateAsync, isPending } = useCreateNote();

  const handleCreateNote = async () => {
    const res = await mutateAsync({ title: "Untitled", content: "" });
    console.log(res);

    if (res?.payload?.id) {
      ruoter.push(`/${res.payload.id}`);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col items-center justify-center gap-5">
      <Notebook className="size-32 -rotate-12" />
      <h3>You don&apos;t have any notes.</h3>
      <Button
        disabled={isPending}
        onClick={handleCreateNote}
        icon={CirclePlus}
        iconPlacement="left"
      >
        Create a note
      </Button>
    </div>
  );
}
