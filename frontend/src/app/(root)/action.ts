"use server";
import { signOut } from "~/server/auth";

export async function handleSignOut() {
  await signOut({
    redirect: true,
    redirectTo: "/auth/login",
  });
}
