import { CirclePlus, Notebook } from "lucide-react";
import { Button } from "~/_components/ui/button";
import { auth } from "~/server/auth";

export default async function Page() {
  const user = await auth();

  console.log(user);

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col items-center justify-center gap-5">
      <Notebook className="size-32 -rotate-12" />
      <h3>You don&apos;t have any notes.</h3>
      <Button icon={CirclePlus} iconPlacement="left">
        Create a note
      </Button>
    </div>
  );
}
