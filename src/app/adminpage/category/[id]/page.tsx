"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { categoryService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategory = async () => {
    try {
      const result = await categoryService.getCategories();
      const cat = result.data.find((c: Category) => c.id === categoryId);
      if (!cat) {
        toast.error("Kategori tidak ditemukan");
        return router.push("/category");
      }
      setCategory(cat);
      setName(cat.name);
    } catch (error) {
      toast.error("Gagal mengambil data kategori");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) return toast.error("Nama kategori harus diisi");

    setLoading(true);
    try {
      await categoryService.updateCategory(categoryId, { name });
      toast.success("Kategori berhasil diperbarui");
      router.push("/adminpage/category");
    } catch (error) {
      toast.error("Gagal memperbarui kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  if (!category) return null;

  return (
    <Card className="max-w-md mx-auto mt-6 p-6">
      <h1 className="text-xl font-bold mb-4">Detail Kategori</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID:</label>
          <p className="text-gray-700">{category.id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dibuat:</label>
          <p className="text-gray-700">
            {new Date(category.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Diperbarui:</label>
          <p className="text-gray-700">
            {new Date(category.updatedAt).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nama Kategori:</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/adminpage/category")}>
            Kembali
          </Button>
        </div>
      </div>
    </Card>
  );
}
