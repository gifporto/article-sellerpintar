"use client";

import { useRouter } from "next/navigation";
import { categoryService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema validasi
const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CreateCategoryPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await categoryService.createCategory(values);
      toast.success("Kategori berhasil dibuat");
      router.push("/adminpage/category");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat kategori");
    }
  };

  return (
    <Card className="max-w-md mt-6 p-6">
      <h1 className="text-xl font-bold mb-4">Tambah Kategori</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input placeholder="Nama kategori" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Card>
  );
}
