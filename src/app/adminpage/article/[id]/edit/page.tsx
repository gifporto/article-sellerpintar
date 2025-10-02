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

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, UploadCloud } from "lucide-react";
import dummyData from "@/data/dummyData.json";
import { Editor } from "@/components/blocks/editor-x/editor";
import { SerializedEditorState } from "lexical";
import Link from "next/link";

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

export const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Hello World 🚀",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

function safeParseContent(
  value: string | undefined,
  fallback: SerializedEditorState
): SerializedEditorState {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as SerializedEditorState;
  } catch {
    return {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: value,
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    } as unknown as SerializedEditorState;
  }
}

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const articleId = Array.isArray(id) ? id[0] : id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
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

  if (fetching) return <LoadingSpinner />;

  return (
    <Card className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Artikel</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {/* Thumbnail */}
        <div>
          <label className="text-gray-900 text-sm font-medium">Thumbnail</label>
          <div>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              id="thumbnailInput"
              onChange={handleFileChange}
            />

            {!imageUrl ? (
              <Card className="md:w-60 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col gap-2 items-center justify-center cursor-pointer transition">
                <label
                  htmlFor="thumbnailInput"
                  className="flex flex-col items-center justify-center cursor-pointer h-40"
                >
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-500 underline text-sm mt-2">
                    Click to select files
                  </p>
                  <p className="text-gray-500 text-sm">
                    Suport File Type : jpg or png
                  </p>
                </label>
              </Card>
            ) : (
              <Card className="md:w-60 w-full rounded-lg p-4 flex flex-col gap-2 items-center justify-center cursor-pointer transition">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-30 object-cover rounded"
                />

                {/* Teks aksi */}
                <div className="flex gap-4 mt-2 text-sm">
                  <label
                    htmlFor="thumbnailInput"
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Ganti
                  </label>
                  <button
                    type="button"
                    onClick={() => setValue("imageUrl", "", { shouldValidate: true })}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            )}

            {uploading && (
              <p className="mt-2 text-sm text-gray-500">Uploading...</p>
            )}
          </div>
          {errors.imageUrl && (
            <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-gray-900 text-sm font-medium">Title</label>
          <Input placeholder="Judul Artikel" {...register("title")} />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-gray-900 text-sm font-medium">Category</label>
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
          <label className="text-gray-900 text-sm font-medium">Content</label>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <Editor
                editorSerializedState={safeParseContent(field.value, initialValue)}
                onSerializedChange={(value) => field.onChange(JSON.stringify(value))}
              />
            )}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        {/* Submit + Extra Buttons */}
        <div className="flex md:flex-row flex-col gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            className="md:w-fit w-full"
            onClick={() => router.push("/adminpage/article")}
          >
            Cancel
          </Button>

          <Link href={`/article/${articleId}`}>
            <Button type="button" variant="secondary" className="md:w-fit w-full">
              Preview
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            className="md:w-fit w-full"
          >
            {isSubmitting ? "Menyimpan..." : "Update Artikel"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
