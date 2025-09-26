"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { categoryService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dummyData from "@/data/dummyData.json";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// Schema validasi
const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<CategoryFormValues>({
      resolver: zodResolver(categorySchema),
      defaultValues: { name: "" },
    });


  const fetchCategory = async () => {
    setFetching(true);
    try {
      const result = await categoryService.getCategories();
      const cat = result.data.find((c: Category) => c.id === categoryId);
      if (!cat) {
        toast.error("Kategori tidak ditemukan, menggunakan dummy data");
        // fallback dummy
        const dummyCat = dummyData.categories.find((c: any) => c.id === categoryId);
        if (dummyCat) {
          const catWithDates: Category = {
            ...dummyCat,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCategory(catWithDates);
          setValue("name", catWithDates.name);
        } else {
          return router.push("/adminpage/category");
        }
        return;
      }
      setCategory(cat);
      setValue("name", cat.name);
    } catch (error) {
      toast.warning("Gagal mengambil data kategori dari server, menggunakan dummy data");
      // fallback dummy
      const dummyCat = dummyData.categories.find((c: any) => c.id === categoryId);
      if (dummyCat) {
        const catWithDates: Category = {
          ...dummyCat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCategory(catWithDates);
        setValue("name", catWithDates.name);
      } else {
        return router.push("/adminpage/category");
      }
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);
    try {
      await categoryService.updateCategory(categoryId, values);
      toast.success("Kategori berhasil diperbarui");
      router.push("/adminpage/category");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui kategori");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const formattedDate = date
      .toLocaleDateString("id-ID", options)
      .replace(".", ""); // biar "Sept." jadi "Sept"

    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Ganti titik ":" pada jam dengan "."
    return `${formattedDate}, ${formattedTime.replace(":", ".")}`;
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId, setValue]);

  if (fetching) return <LoadingSpinner size={12} />;

  if (!category) return null;

  return (
    <Card className="max-w-md p-6">
      <h1 className="text-xl font-bold mb-4">Detail Kategori</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID:</label>
          <p className="text-gray-700">{category.id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dibuat:</label>
          <p className="text-gray-700">{formatDateTime(category.createdAt)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Diperbarui:</label>
          <p className="text-gray-700">{formatDateTime(category.updatedAt)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nama Kategori:</label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="flex space-x-2">
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? (
              <div className="flex items-center space-x-2">
                <span>Menyimpan...</span>
              </div>
            ) : (
              "Simpan"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/adminpage/category")}
          >
            Kembali
          </Button>
        </div>
      </form>
    </Card>
  );
}
