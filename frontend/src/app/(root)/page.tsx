"use client";

import { Button } from "~/_components/ui/button";
import { handleSignOut } from "./action";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1>Hello World</h1>
      <form action={handleSignOut}>
        <Button type="submit">Sign Out</Button>
      </form>
    </main>
  );
}
