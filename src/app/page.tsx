// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button"; // import Button shadcn

export default function LandingPage() {
  return (
    <section
      className="w-full h-screen bg-cover bg-center relative flex items-center justify-center"
      style={{ backgroundImage: "url('/bg-dummy.jpg')" }}
    >
      {/* Overlay gelap supaya teks terbaca */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Konten tengah */}
      <div className="relative text-centerpx-4">
        <h1 className="text-4xl  text-white md:text-6xl font-bold mb-6">
          Selamat Datang
        </h1>
        <div className="flex justify-center gap-4">
          <Link href="/auth/login">
            <Button variant="outline" className="cursor-pointer">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="default" className="cursor-pointer">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
