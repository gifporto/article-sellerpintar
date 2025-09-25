"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { authService } from "@/lib/api";
import { AppSidebar } from "@/components/app-sidebar";
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
import { ArrowRight, ChevronRight } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [user, setUser] = useState<{ username: string; role: string }>({ username: "", role: "" });
  const [scrolled, setScrolled] = useState(false);
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
        setUser({ username: data.username, role: data.role });
        if (data.role !== "Admin") router.replace("/auth/login");
      })
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  };

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
            <ChevronRight size={16}/>
          </>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className={`fixed w-full z-50 flex h-16 shrink-0 items-center gap-2 px-4 transition-colors duration-300 ${scrolled ? 'bg-white shadow-md' : ''}`}>
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 bg-gray-100 p-6 pt-24 w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
