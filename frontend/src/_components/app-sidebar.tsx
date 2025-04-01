"use client";

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
import { useNotesList } from "~/atoms/notes";

export function AppSidebar() {
  const [{ data, isLoading }] = useNotesList();

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <Link href={"/"} className="py-5 text-center font-bold">
          Notion
        </Link>
      </SidebarHeader>
      <SidebarContent>
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
                      <SidebarMenuButton asChild>
                        <Link prefetch href={item.id}>
                          {item.icon && <span>{item.icon}</span>}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
