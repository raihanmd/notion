"use server";

import { cookies } from "next/headers";
import { signOut } from "~/server/auth";

export const logout = async () => {
  (await cookies()).delete("token");
  await signOut({
    redirectTo: "/auth/login",
  });
};
