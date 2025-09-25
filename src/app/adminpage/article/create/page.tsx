"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { articleService, uploadService, categoryService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories({limit: 99});
        setCategories(res.data);
      } catch (err) {
        console.error("Gagal mengambil kategori", err);
        toast.error("Gagal mengambil kategori");
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (!selectedFile) return;

    try {
      setUploading(true);
      const uploadRes = await uploadService.uploadFile(selectedFile);
      setImageUrl(uploadRes.imageUrl);
    } catch (err) {
      console.error("Gagal upload file", err);
      toast.error("Gagal meng-upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !content || !imageUrl) {
      toast.error("Semua field harus diisi dan file harus di-upload!");
      return;
    }

    setLoading(true);
    try {
      await articleService.createArticle({ title, content, categoryId, imageUrl });
      toast.success("Artikel berhasil dibuat!");
      router.push("/adminpage/article");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat artikel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mt-6 p-6">
      <h1 className="text-xl font-bold mb-4">Buat Artikel Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Judul Artikel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Select
          onValueChange={(value) => setCategoryId(value)}
          value={categoryId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter((cat) => cat.id) // pastikan id tidak kosong
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>


        <textarea
          placeholder="Deskripsi Artikel"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border rounded p-2 w-full"
          rows={5}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        {uploading && <p>Uploading file...</p>}

        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Menyimpan..." : "Buat Artikel"}
        </Button>
      </form>
    </Card>
  );
}
