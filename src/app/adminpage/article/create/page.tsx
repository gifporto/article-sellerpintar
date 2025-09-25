"use client";

import { useEffect, useState } from "react";
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
import { UploadCloud } from "lucide-react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Category {
  id: string;
  name: string;
}

// Schema validasi
const articleSchema = z.object({
  title: z.string().min(1, "Judul artikel wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  content: z.string().min(1, "Deskripsi artikel wajib diisi"),
  imageUrl: z.string().min(1, "Gambar wajib di-upload"),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      content: "",
      imageUrl: "",
    },
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories({ limit: 99 });
        setCategories(res.data);
      } catch (err) {
        console.error("Gagal mengambil kategori", err);
        toast.error("Gagal mengambil kategori");
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setUploading(true);
      const uploadRes = await uploadService.uploadFile(selectedFile);
      setValue("imageUrl", uploadRes.imageUrl, { shouldValidate: true });
    } catch (err) {
      console.error("Gagal upload file", err);
      toast.error("Gagal meng-upload file.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ArticleFormValues) => {
    try {
      await articleService.createArticle(values);
      toast.success("Artikel berhasil dibuat!");
      router.push("/adminpage/article");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat artikel.");
    }
  };

  return (
    <Card className="max-w-md mt-6 p-6">
      <h1 className="text-xl font-bold mb-4">Buat Artikel Baru</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <Input placeholder="Judul Artikel" {...register("title")} />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <textarea
            placeholder="Deskripsi Artikel"
            {...register("content")}
            className="border rounded-lg p-2 w-full"
            rows={5}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        {/* Upload */}
        <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition">
          <label className="w-full text-center flex flex-col items-center justify-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {!imageUrl ? (
              <p className="text-gray-500">
                Klik atau seret file ke sini untuk upload
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded"
                />
                <p className="text-gray-500 mt-2 text-center">
                  Klik atau seret file ke sini untuk ubah file
                </p>
              </div>

            )}
            <div className="flex items-center gap-2">
              <UploadCloud className="w-10 h-10 text-gray-400" />
              <p className="text-gray-500 font-semibold text-sm">Upload file</p>
            </div>
          </label>
          {uploading && (
            <p className="mt-2 text-sm text-gray-500">Uploading...</p>
          )}
        </div>
        {errors.imageUrl && (
          <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
        )}

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting || uploading} className="w-full">
          {isSubmitting ? "Menyimpan..." : "Buat Artikel"}
        </Button>
      </form>
    </Card>
  );
}
