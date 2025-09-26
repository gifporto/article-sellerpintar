"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService, categoryService, uploadService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud } from "lucide-react";
import dummyData from "@/data/dummyData.json";

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

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const articleId = Array.isArray(id) ? id[0] : id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [previewData, setPreviewData] = useState<ArticleFormValues | null>(null);

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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getCategories({ limit: 99 });
        setCategories(result.data);
      } catch (err) {
        setCategories(dummyData.categories);
        toast.error("Gagal mengambil kategori dari server, menggunakan data dummy");
      }
    };
    fetchCategories();
  }, []);

  // Fetch article data
  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      setFetching(true);
      try {
        const res = await articleService.getArticleById(articleId);
        setValue("title", res.title);
        setValue("categoryId", res.category.id);
        setValue("content", res.content);
        setValue("imageUrl", res.imageUrl || "");
      } catch (err) {
        // fallback dummy
        const articleDummy = dummyData.articles.find(a => a.id === articleId) || dummyData.articles[0];
        setValue("title", articleDummy.title);
        setValue("categoryId", articleDummy.category.id);
        setValue("content", articleDummy.content);
        setValue("imageUrl", articleDummy.imageUrl);
        toast.error("Gagal mengambil artikel dari server, menggunakan data dummy");
      } finally {
        setFetching(false);
      }
    };

    fetchArticle();
  }, [articleId, setValue]);

  // Upload file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(selectedFile);
      setValue("imageUrl", res.imageUrl, { shouldValidate: true });
    } catch (err) {
      console.error(err);
      toast.error("Gagal meng-upload file");
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (values: ArticleFormValues) => {
    setPreviewData(values);
  };

  const onConfirmUpdate = async () => {
    if (!previewData) return;
    try {
      await articleService.updateArticle(articleId!, previewData);
      toast.success("Artikel berhasil diperbaharui");
      router.push("/adminpage/article");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbaharui artikel");
    }
  };

  const onSubmit = async (values: ArticleFormValues) => {
    try {
      await articleService.updateArticle(articleId!, values);
      toast.success("Artikel berhasil diperbaharui");
      router.push("/adminpage/article");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbaharui artikel");
    }
  };

  if (fetching) return <LoadingSpinner/>;

  return (
    <Card className="max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Artikel</h1>
      <form onSubmit={handleSubmit(handlePreview)} className="flex flex-col gap-3">
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
            className="border rounded p-2 w-full"
            rows={5}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

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

        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full"
            >
              {isSubmitting ? "Menyimpan..." : "Update Artikel"}
            </Button>
          </DialogTrigger>

          {previewData && (
            <DialogContent className="w-1/2 max-w-[50vw]">
              <DialogHeader>
                <DialogTitle>Preview Artikel</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3">
                    <p><strong>Judul:</strong> {previewData.title}</p>
                    <p>
                      <strong>Kategori:</strong>{" "}
                      {categories.find((c) => c.id === previewData.categoryId)?.name}
                    </p>
                    <p><strong>Deskripsi:</strong> {previewData.content}</p>
                    <div>
                      <strong>Gambar:</strong>
                      <img
                        src={previewData.imageUrl}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded mt-2"
                      />
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewData(null)}>
                  Batal
                </Button>
                <Button onClick={onConfirmUpdate}>Yakin Simpan</Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </form>
    </Card>
  );
}
