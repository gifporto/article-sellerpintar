"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import Cookies from "js-cookie";
import { AppSidebar } from "@/components/app-sidebar";
import dummyData from "@/data/dummyData.json";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [username, setUsername] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; avatar: string }>({
    name: "",
    role: "",
    avatar: "/default-avatar.png",
  });

  // Dummy fallback jika profile API gagal
  const DUMMY_PROFILE = {
    username: "UserDummy",
    role: "User",
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

  const initial = username ? username.charAt(0).toUpperCase() : "U";

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate breadcrumb
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return (
      <BreadcrumbItem key={href}>
        {isLast ? (
          <BreadcrumbPage>{label}</BreadcrumbPage>
        ) : (
          <>
            <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
            <ChevronRight size={16} />
          </>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className={`flex border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) h-16 shrink-0 items-center gap-2 px-4 duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 md:hidden flex" />
            <Separator orientation="vertical" className="mr-2 md:hidden flex data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
            <button onClick={() => router.push(`/adminpage/profile`)} className="flex items-center gap-2 cursor-pointer py-1 md:right-1/2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-200">{initial}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-black text-sm font-medium">{user.name}</span>
              </div>
            </button>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-100 p-6 w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
