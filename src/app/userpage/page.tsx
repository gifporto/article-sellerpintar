"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { authService, categoryService } from "@/lib/api";
import dummyData from "@/data/dummyData.json";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    // Ambil data user
    authService
      .profile()
      .then((data) => setUsername(data.username))
      .catch(() => setUsername("UserDummy"));

    // Ambil semua kategori tanpa limit
     categoryService
    .getCategories({ limit: 1000 })
    .then((res) => setCategories(res.data))
    .catch(() => {
      setCategories(dummyData.categories);
      toast.warning("Gagal mengambil kategori dari server, menggunakan dummy data");
    })
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero / Banner */}
      <section
        className="w-full bg-cover bg-center p-4 rounded-2xl text-white h-44 flex flex-col"
        style={{ backgroundImage: "url('/bg-dummy.jpg')" }}
      >
        <p>Selamat Datang,</p>
        <h1 className="text-2xl font-bold text-white">{username}</h1>
      </section>

      {/* Dashboard Kategori */}
      <section className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Kategori</h2>
        {loading ? (
          <LoadingSpinner/>
        ) : categories.length === 0 ? (
          <p>Belum ada kategori</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="md:h-40 h-24 items-center flex justify-center bg-gray-100 rounded-lg text-center font-medium text-white"
                style={{
                  backgroundImage: `url('https://picsum.photos/400/300?random=${index}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="bg-black/40 p-4 w-full h-full flex items-center justify-center rounded-lg">
                  {category.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
