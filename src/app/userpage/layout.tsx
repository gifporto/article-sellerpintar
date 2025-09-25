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
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { authService } from "@/lib/api";
import { LogOut, ChevronDown, GalleryVerticalEnd, Menu, X } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // <-- state scroll
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");
    const roleCookie = Cookies.get("role");

    if (!token || roleCookie !== "User") {
      router.replace("/auth/login");
      return;
    }

    setRole(roleCookie || "");

    authService
      .profile()
      .then((data) => setUsername(data.username))
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/auth/login");
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
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          scrolled ? "bg-white shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex gap-2 items-center">
            <GalleryVerticalEnd />
            <div>
              <h1 className="text-xl font-bold">Article</h1>
              <p className="text-xs text-gray-500">SellerPintar</p>
            </div>
          </div>

          {/* Desktop menu */}
          <NavigationMenu className="hidden md:flex space-x-4 list-none">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  href={item.href}
                  className={`px-3 py-1 rounded-md hover:bg-gray-100 ${
                    (item.href === "/userpage" && pathname === "/userpage") ||
                    (item.href === "/userpage/article" &&
                      pathname.startsWith("/userpage/article"))
                      ? "font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>

          {/* Profile + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 rounded-md hover:bg-gray-100 px-2 py-1">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-medium">{username}</span>
                    <span className="text-xs text-gray-500">{role}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      open ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                  <div className="flex items-center space-x-2 rounded-md">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-sm font-medium">{username}</span>
                      <span className="text-xs text-gray-500">{role}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md ${
                  (item.href === "/userpage" && pathname === "/userpage") ||
                  (item.href === "/userpage/article" &&
                    pathname.startsWith("/userpage/article"))
                    ? "bg-gray-200 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.title}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 pt-24">
        <div className="max-w-7xl w-full mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
