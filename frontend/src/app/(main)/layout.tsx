import { type PropsWithChildren } from "react";
import { AppSidebar } from "~/_components/app-sidebar";
import { SidebarProvider } from "~/_components/ui/sidebar";

type Props = PropsWithChildren;

export default function layout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="size-full min-h-[100dvh] p-2 pt-5">{children}</main>
    </SidebarProvider>
  );
}
