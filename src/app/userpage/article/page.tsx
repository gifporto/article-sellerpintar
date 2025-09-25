"use client";

import { useEffect, useState } from "react";
import { articleService, categoryService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function LandingPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // jumlah artikel per halaman
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);


  const router = useRouter();

  const fetchArticles = async (page: number, category?: string) => {
    setLoading(true);
    try {
      const res = await articleService.getArticles(page, limit, undefined, category);
      setArticles(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Gagal mengambil artikel", err);
      toast.error("Gagal mengambil artikel");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories({ limit: 99 });
      setCategories(res.data);
    } catch (err) {
      console.error("Gagal mengambil kategori", err);
      toast.error("Gagal mengambil kategori");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(page, selectedCategory);
  }, [page, selectedCategory]);


  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Articles</h1>

      {loading && <p>Loading...</p>}
      {!loading && articles.length === 0 && <p>Tidak ada artikel</p>}

      <div className="mb-4 flex gap-4 items-center">
        <Select
          value={selectedCategory || "all"}
          onValueChange={(val) => {
            setPage(1);
            setSelectedCategory(val === "all" ? undefined : val);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories
              .filter((cat) => cat.id) // pastikan ada id
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>


      <div className="flex flex-col gap-2">
        {articles.map((article) => (
          <Card
            key={article.id}
            className="p-4 cursor-pointer hover:bg-gray-50 flex flex-row"
            onClick={() => router.push(`/userpage/article/${article.id}`)}
          >
            <img
              src={article.imageUrl || "/dummy.png"}
              alt={article.title}
              className="w-64 h-40 object-cover"
            />
            <div className="ml-4">
              <h2 className="font-semibold">{article.title}</h2>
              <p className="line-clamp-2 text-sm text-gray-700">
                {article.content}
              </p>
              <p className="text-sm text-gray-500">
                By {article.user.username} | Category: {article.category.name}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/userpage/article/${article.id}`)}
                >
                  Detail
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && setPage(page - 1)}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && setPage(page + 1)}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}
