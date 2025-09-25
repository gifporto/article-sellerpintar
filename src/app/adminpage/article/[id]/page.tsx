"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService, categoryService, uploadService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
}

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const articleId = Array.isArray(id) ? id[0] : id;

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Ambil kategori
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getCategories();
        setCategories(result.data);
      } catch (err) {
        console.error("Gagal mengambil kategori", err);
      }
    };
    fetchCategories();
  }, []);

  // Ambil data artikel
  useEffect(() => {
    if (!articleId) return;
    const fetchArticle = async () => {
      try {
        const res = await articleService.getArticleById(articleId);
        setTitle(res.title);
        setCategoryId(res.category.id);
        setContent(res.content);
        setImageUrl(res.imageUrl || "");
      } catch (err) {
        console.error("Gagal mengambil artikel", err);
      }
    };
    fetchArticle();
  }, [articleId]);

  // Upload gambar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (!selectedFile) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(selectedFile);
      setImageUrl(res.imageUrl);
    } catch (err) {
      console.error("Gagal upload file", err);
      toast.error("Gagal meng-upload file");
    } finally {
      setUploading(false);
    }
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !content || !imageUrl) {
      toast.error("Semua field harus diisi dan file harus di-upload!");
      return;
    }

    setLoading(true);
    try {
      await articleService.updateArticle(articleId!, { title, categoryId, content, imageUrl });
      toast.success("Artikel berhasil diperbaharui");
      router.push("/adminpage/article");
    } catch (err) {
      console.error(err);
      toast.error("Gagal Memperbaharui Artikel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mt-6 p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Artikel</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          placeholder="Judul Artikel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="border rounded p-2"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Deskripsi Artikel"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border rounded p-2"
          rows={5}
          required
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 w-64" />}
        {uploading && <p>Uploading file...</p>}
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Menyimpan..." : "Update Artikel"}
        </Button>
      </form>
    </Card>
  );
}
