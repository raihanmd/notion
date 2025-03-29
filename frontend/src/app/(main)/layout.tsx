import { type PropsWithChildren } from "react";
import { AppSidebar } from "~/_components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/_components/ui/sidebar";

type Props = PropsWithChildren;

export default function layout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="p-2">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
