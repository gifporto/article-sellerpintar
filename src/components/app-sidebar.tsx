"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { NavUser } from "./nav-user";
import { VersionSwitcher } from "@/components/version-switcher";
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
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import dummyData from "@/data/dummyData.json"; 

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Home",
      url: "#",
      items: [{ title: "Dashboard", url: "/adminpage" }],
    },
    {
      title: "Master",
      url: "#",
      items: [
        { title: "Artikel", url: "/adminpage/article" },
        { title: "Kategori", url: "/adminpage/category" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; avatar: string }>({
    name: "",
    role: "",
    avatar: "/default-avatar.png",
  });

  const isActive = (path: string, url: string) => {
    // kalau persis cocok
    if (path === url) return true;

    // kalau URL artikel, aktifkan juga untuk detailnya
    if (url === "/adminpage/article" && path.startsWith("/adminpage/article")) {
      return true;
    }

    // kalau URL kategori, aktifkan juga untuk detailnya
    if (url === "/adminpage/category" && path.startsWith("/adminpage/category")) {
      return true;
    }

    // default
    return false;
  };


 useEffect(() => {
  const token = Cookies.get("token");
  if (!token) {
    router.replace("/auth/login");
    return;
  }

  authService
    .profile()
    .then((data) => {
      if (data.role !== "Admin") {
        router.replace("/auth/login");
        return;
      }
      setUser({
        name: data.username,
        role: data.role || "",
        avatar: data.avatar || "/default-avatar.png",
      });
    })
    .catch(() => {
      // fallback dummy
      const dummyAdmin = dummyData.users.find(u => u.role === "Admin");
      setUser({
        name: dummyAdmin?.username || "AdminDummy",
        role: dummyAdmin?.role || "Admin",
        avatar: "",
      });
      // opsional: tampilkan toast agar user tahu
      console.warn("API gagal, menggunakan data dummy untuk admin");
    });
}, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
    toast.success(
      "Anda berhasil Logout"
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(pathname, item.url)}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>


                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onLogout={handleLogout} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
