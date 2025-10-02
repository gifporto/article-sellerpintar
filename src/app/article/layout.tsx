"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api";
import { LogOut, ChevronDown, GalleryVerticalEnd, Menu, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
}

export default function ArticleDetailLayout({ children }: Props) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // <-- state scroll
  const router = useRouter();
  const pathname = usePathname();
  const isUserPage = pathname === "/userpage";

  useEffect(() => {
    const token = Cookies.get("token");
    const roleCookie = Cookies.get("role");

    if (!token || roleCookie !== "Admin") {
      router.replace("/auth/login");
      return;
    }

    setRole(roleCookie || "");


    // Dummy fallback jika profile API gagal
    const DUMMY_PROFILE = {
      username: "UserDummy",
      role: "User",
    };

    authService
      .profile()
      .then((data) => setUsername(data.username))
      .catch(() => {
        // fallback ke dummy profile
        setUsername(DUMMY_PROFILE.username);
        setRole(DUMMY_PROFILE.role);

        // Opsional: tampilkan toast agar user tahu
        toast.warning(
          "Sedang menggunakan data backup karena server tidak merespon"
        );
      });
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // ganti 50 sesuai kebutuhan
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/auth/login");
    toast.success(
      "Anda berhasil Logout"
    );
  };

  const initial = username ? username.charAt(0).toUpperCase() : "U";
  const menuItems = [
    { title: "Home", href: "/userpage" },
    { title: "Artikel", href: "/userpage/article" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 
    ${isUserPage
            ? scrolled
              ? "bg-white shadow-md text-black"
              : "md:bg-transparent bg-white text-black"
            : "bg-white shadow-md text-black"
          }`}
      >
        <div className="max-w-7xl w-full mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex gap-2 items-center ">
            <GalleryVerticalEnd className={`${isUserPage ? scrolled ? "text-black" : "md:text-white text-black" : "text-black"}`} />
            <div>
              <h1 className={`text-xl font-bold ${isUserPage ? scrolled ? "text-black" : "md:text-white text-black" : "text-black"}`}>Logoipsum</h1>
            </div>
          </div>

          {/* Profile + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer py-1">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-200">{initial}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className={`text-sm font-medium ${isUserPage ? scrolled ? "text-black" : "md:text-white text-black" : "text-black"}`}>{username}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => router.push(`/userpage/profile`)}
                  className="flex items-center gap-2"
                >
                  <span>My Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                  <Button
                    variant="default"
                    onClick={() => {
                      Cookies.remove("token");
                      Cookies.remove("role");
                      setLogoutDialogOpen(false);
                      router.push("/auth/login");
                      toast.success("Anda berhasil Logout");
                    }}
                  >
                    Logout
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

      </nav>

      {/* Main content */}
      <main className="flex-1">
        <div className="w-full mx-auto mb-25">{children}</div>
      </main>

      <footer>
        <div className="bg-primary flex md:flex-row flex-col gap-2 items-center justify-center h-25">
          {/* Logo */}
          <div className="flex gap-2 items-center">
            <img src="/assets/logo-article.svg" alt="" />
            <div>
              <h1 className="text-xl font-bold text-">Logoipsum</h1>
            </div>
          </div>
          <span className="text-white">
            © 2025 Blog genzet. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
