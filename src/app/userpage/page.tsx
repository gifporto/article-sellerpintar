// app/main/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Clock, Zap, FolderOpen, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="space-y-20">
      {/* Hero Section */}
      <section
        className="w-full bg-cover bg-center p-10 rounded-2xl text-white flex flex-col items-center justify-center h-80 text-center"
        style={{ backgroundImage: "url('/bg-dummy.jpg')" }}
      >
        <h1 className="md:text-4xl text-xl font-bold max-w-2xl">
          Temukan Artikel Bermanfaat & Terkini untuk Wawasan Lebih Luas
        </h1>
        <p className="mt-4 max-w-2xl md:text-lg text-sm text-gray-200">
          Dapatkan informasi terbaru, ringkas, dan terpercaya yang membantu Anda
          tetap up-to-date dan produktif.
        </p>
        <Button onClick={() => router.push(`/userpage/article}`)} size="lg" variant="secondary" className="mt-6">
          Baca Artikel Sekarang
        </Button>
      </section>

      {/* Tentang Website */}
      <section className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Tentang Kami</h2>
        <p className="text-gray-600">
          Kami hadir untuk menyajikan artikel terbaik yang membantu Anda
          memperluas wawasan, tetap relevan dengan tren terkini, dan lebih
          produktif setiap hari.
        </p>
      </section>

      {/* Nilai Tambah / Keunggulan */}
      <section className="container mx-auto px-4">
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
      <section className="container mx-auto px-4">
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
              <img src={item.img} alt={item.title} className="w-full object-cover" />
              <CardHeader>
                <CardTitle className="my-4">{item.title}</CardTitle>
              </CardHeader>
            </div>
          ))}
        </div>
      </section>

      {/* Testimoni */}
      <section className="container mx-auto px-4">
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
      </section>

      {/* CTA Akhir */}
      <section className="text-center py-12 bg-gray-50 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Mulai membaca & perluas wawasan Anda sekarang juga!
        </h2>
        <Button onClick={() => router.push(`/userpage/article}`)} size="lg">Jelajahi Artikel</Button>
      </section>
    </main>
  );
}
