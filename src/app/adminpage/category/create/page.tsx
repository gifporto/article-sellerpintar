"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoryService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama kategori harus diisi");

    setLoading(true);
    try {
      await categoryService.createCategory({ name });
      toast.success("Kategori berhasil dibuat");
      router.push("/adminpage/category");
    } catch (error) {
      toast.error("Gagal membuat kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6 p-6">
      <h1 className="text-xl font-bold mb-4">Tambah Kategori</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nama kategori"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Card>
  );
}
