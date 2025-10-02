"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Home, FileText, Tag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import dummyData from "@/data/dummyData.json";

const iconMap: Record<string, React.ReactNode> = {
  "Dashboard": <Home className="w-4 h-4 mr-2" />,
  "Artikel": <FileText className="w-4 h-4 mr-2" />,
  "Kategori": <Tag className="w-4 h-4 mr-2" />,
  "Logout": <LogOut className="w-4 h-4 mr-2" />,
};

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
        { title: "Logout", url: "#" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
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


  // useEffect(() => {
  //   const token = Cookies.get("token");
  //   if (!token) {
  //     router.replace("/auth/login");
  //     return;
  //   }

  //   authService
  //     .profile()
  //     .then((data) => {
  //       if (data.role !== "Admin") {
  //         router.replace("/auth/login");
  //         return;
  //       }
  //       setUser({
  //         name: data.username,
  //         role: data.role || "",
  //         avatar: data.avatar || "/default-avatar.png",
  //       });
  //     })
  //     .catch(() => {
  //       // fallback dummy
  //       const dummyAdmin = dummyData.users.find(u => u.role === "Admin");
  //       setUser({
  //         name: dummyAdmin?.username || "AdminDummy",
  //         role: dummyAdmin?.role || "Admin",
  //         avatar: "",
  //       });
  //       // opsional: tampilkan toast agar user tahu
  //       console.warn("API gagal, menggunakan data dummy untuk admin");
  //     });
  // }, [router]);

  const handleLogoutConfirm = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    setLogoutDialogOpen(false);
    router.push("/auth/login");
    toast.success("Anda berhasil Logout");
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="w-full flex items-center">
          <img src="/assets/logo-frame.svg" className="w-40 p-4" alt="" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.title === "Logout" ? (
                      <SidebarMenuButton asChild>
                        <button
                          className="flex items-center w-full text-left"
                          onClick={() => setLogoutDialogOpen(true)}
                        >
                          {iconMap[item.title]}
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive(pathname, item.url)}>
                        <a href={item.url} className="flex items-center">
                          {iconMap[item.title]}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* <SidebarFooter>
        <NavUser user={user} onLogout={handleLogout} />
      </SidebarFooter> */}

      <SidebarRail />

      {/* AlertDialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleLogoutConfirm}>
              Logout
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Sidebar>
  );
}
