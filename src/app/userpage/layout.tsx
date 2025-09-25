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
import { LogOut, ChevronDown } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false); // dropdown
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

    authService.profile()
      .then((data) => setUsername(data.username))
      .catch(() => router.replace("/auth/login"));
  }, [router]);

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
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-mdbg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl w-full mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">MyApp</div>

          {/* NavigationMenu */}
          <NavigationMenu className="flex space-x-4 list-none">
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  href={item.href}
                  className={`px-3 py-1 rounded-md hover:bg-gray-100 ${pathname === item.href ? "bg-gray-200 font-semibold" : "text-gray-700"
                    }`}
                >
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>


          {/* Profile dropdown */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 rounded-md hover:bg-gray-100 px-2 py-1">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{username}</span>
                  <span className="text-xs text-gray-500">{role}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 pt-24">
        <div className="max-w-7xl w-full mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
