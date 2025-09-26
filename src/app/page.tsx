"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, Menu, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Clock, Zap, FolderOpen, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("section1");

  const menuItems = [
    { title: "Hero", href: "section1" },
    { title: "Keunggulan", href: "section2" },
    { title: "Kategori", href: "section3" },
  ];

  const AUTH_LINKS = {
    login: "/auth/login",
    register: "/auth/register",
  };


  // Navbar transparan -> putih saat scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const section = document.getElementById("section1");
    section?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Intersection observer untuk aktif menu
  useEffect(() => {
    const sections = menuItems.map((item) =>
      document.getElementById(item.href)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 } // muncul 50% di layar baru dianggap aktif
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section!);
      });
    };
  }, []);

  // Fungsi scroll smooth
  const handleScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled ? "bg-white shadow-md" : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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
                <button
                  onClick={() => handleScroll(item.href)}
                  className={`px-3 py-1 rounded-md  transition ${activeSection === item.href
                    ? "font-bold"
                    : "text-gray-500 font-medium hover:bg-gray-100"
                    }`}
                >
                  {item.title}
                </button>
              </NavigationMenuItem>
            ))}
          </NavigationMenu>

          {/* Auth Buttons (desktop) */}
          <div className="hidden md:flex gap-3">
            <Button variant="outline" onClick={() => router.push(AUTH_LINKS.login)}>
              Login
            </Button>
            <Button onClick={() => router.push(AUTH_LINKS.register)}>
              Register
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  handleScroll(item.href);
                  setMobileOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === item.href
                  ? "font-bold"
                  : "text-gray-500 font-medium hover:bg-gray-100"
                  }`}
              >
                {item.title}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  router.push(AUTH_LINKS.login);
                  setMobileOpen(false);
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  router.push(AUTH_LINKS.register);
                  setMobileOpen(false);
                }}
              >
                Register
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 bg-gray-100">
        <div className="max-w-7xl w-full mx-auto px-4">

          {/* Hero Section */}
          <section id="section1" className="flex flex-col gap-16 pt-24">
            <div
              className="w-full bg-cover bg-center p-10 rounded-2xl text-white flex flex-col items-center justify-center h-80 text-center"
              style={{ backgroundImage: "url('/bg-dummy.jpg')" }}
            >
              <h1 className="md:text-4xl text-xl font-bold max-w-2xl">
                Temukan Artikel Bermanfaat & Terkini untuk Wawasan Lebih Luas
              </h1>
              <p className="mt-4 max-w-2xl md:text-lg text-sm text-gray-200">
                Dapatkan informasi terbaru, ringkas, dan terpercaya yang membantu
                Anda tetap up-to-date dan produktif.
              </p>
              <Button
                onClick={() => router.push(`/userpage/article`)}
                size="lg"
                variant="secondary"
                className="mt-6"
              >
                Baca Artikel Sekarang
              </Button>
            </div>

            <div
              className="container mx-auto px-4 text-center max-w-3xl"
            >
              <h2 className="text-2xl font-bold mb-4">Tentang Kami</h2>
              <p className="text-gray-600">
                Kami hadir untuk menyajikan artikel terbaik yang membantu Anda
                memperluas wawasan, tetap relevan dengan tren terkini, dan lebih
                produktif setiap hari.
              </p>
            </div>
          </section>


          {/* Nilai Tambah / Keunggulan */}
          <section id="section2" className="container mx-auto px-4 pt-24">
            <h2 className="text-2xl font-bold text-center mb-8">
              Kenapa Memilih Kami?
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <BookOpen className="mx-auto w-10 h-10 text-black" />
                  <CardTitle>Konten Berkualitas</CardTitle>
                </CardHeader>
                <CardContent>
                  Artikel ditulis oleh penulis berpengalaman dengan riset mendalam.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Clock className="mx-auto w-10 h-10 text-black" />
                  <CardTitle>Update Terkini</CardTitle>
                </CardHeader>
                <CardContent>
                  Topik selalu diperbarui sesuai tren dan kebutuhan pembaca.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Zap className="mx-auto w-10 h-10 text-black" />
                  <CardTitle>Efektif & Ringkas</CardTitle>
                </CardHeader>
                <CardContent>
                  Bahasa mudah dipahami, hemat waktu, tetap penuh insight.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <FolderOpen className="mx-auto w-10 h-10 text-black" />
                  <CardTitle>Kategori Lengkap</CardTitle>
                </CardHeader>
                <CardContent>
                  Teknologi, kesehatan, lifestyle, hingga pengembangan diri.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Globe className="mx-auto w-10 h-10 text-black" />
                  <CardTitle>Gratis & Mudah Diakses</CardTitle>
                </CardHeader>
                <CardContent>
                  Artikel dapat diakses kapan saja, tanpa biaya tambahan.
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Kategori Populer */}
          <section id="section3" className="container mx-auto px-4 flex flex-col gap-16 pt-24 ">
            <h2 className="text-2xl font-bold text-center mb-8">
              Kategori Populer
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Teknologi", img: "/bg-dummy.jpg" },
                { title: "Kesehatan", img: "/bg-dummy.jpg" },
                { title: "Gaya Hidup", img: "/bg-dummy.jpg" },
                { title: "Pengembangan Diri", img: "/bg-dummy.jpg" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full object-cover"
                  />
                  <CardHeader>
                    <CardTitle className="my-4">{item.title}</CardTitle>
                  </CardHeader>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-center mb-8">Apa Kata Pembaca?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Andi",
                    role: "Mahasiswa",
                    text: "Artikel di sini sangat membantu saya memahami teknologi terbaru dengan cepat.",
                  },
                  {
                    name: "Rina",
                    role: "Karyawan",
                    text: "Ringkas dan padat, cocok dibaca saat istirahat singkat.",
                  },
                  {
                    name: "Budi",
                    role: "Freelancer",
                    text: "Membantu saya tetap produktif dan up-to-date dengan tren.",
                  },
                ].map((testi, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6 space-y-4">
                      <p className="italic">"{testi.text}"</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {testi.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">– {testi.name}</p>
                          <p className="text-sm text-gray-500">{testi.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Akhir */}
          <section className="text-center py-12 bg-gray-50 rounded-xlpt-24">
            <h2 className="text-2xl font-bold mb-4">
              Mulai membaca & perluas wawasan Anda sekarang juga!
            </h2>
            <Button onClick={() => router.push(`/userpage/article`)} size="lg">Jelajahi Artikel</Button>
          </section>
        </div>
      </main>
    </>
  );
}
