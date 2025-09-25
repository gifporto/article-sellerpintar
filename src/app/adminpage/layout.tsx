"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { authService } from "@/lib/api";
import { Button } from "@/components/ui/button";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [user, setUser] = useState<{ username: string; role: string }>({ username: "", role: "" });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    authService.profile()
      .then((data) => {
        setUser({ username: data.username, role: data.role }); // ambil username & role
        if (data.role !== "Admin") router.replace("/auth/login"); // akses hanya admin
      })
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  };

  const menuItems = [
    { label: "Dashboard", href: "/adminpage" },
    { label: "Article", href: "/adminpage/article" },
    { label: "Category", href: "/adminpage/category" },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar side="left" collapsible="offcanvas">
          <SidebarHeader className="my-4 mx-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </SidebarHeader>

          <SidebarContent className="mx-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={pathname === item.href ? "bg-gray-200 font-semibold" : ""}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="flex flex-col gap-2 mx-4">
            <div className="flex gap-2 items-center">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                {user.username ? user.username[0].toUpperCase() : "U"}
              </div>

              {/* Username & role */}
              <div>
                <h1 className="text-sm font-medium">{user.username}</h1>
                <h2 className="text-xs text-gray-500">{user.role}</h2>
              </div>
            </div>

            <Button variant="outline" className="w-full cursor-pointer" onClick={handleLogout}>
              Logout
            </Button>
          </SidebarFooter>

        </Sidebar>

        <SidebarTrigger className="absolute top-4 left-4 md:hidden" />
      </div>
      <main className="flex-1 bg-gray-100 p-6 w-full">{children}</main>
    </SidebarProvider>
  );
}
