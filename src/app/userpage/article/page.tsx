"use client";

import { useEffect, useState } from "react";
import { articleService, categoryService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Article = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  user: { username: string };
  category: { name: string; id: string };
  createdAt: string;
  updatedAt: string;
};

type Category = { id: string; name: string };

export default function ArticlePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // pagination states
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchArticles = async (page: number) => {
    setLoading(true);
    try {
      const result = await articleService.getArticles({
        page,
        limit,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        title: debouncedSearch || undefined,
      });
      setArticles(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error("Gagal mengambil artikel");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await categoryService.getCategories();
      setCategories(result.data);
    } catch (err) {
      toast.error("Gagal mengambil kategori");
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short", // hasil: Jan, Feb, Mar, ..., Sept
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
    // ganti ":" dengan "." untuk jam
    return formatted.replace(/:/, ".");
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, selectedCategory, debouncedSearch]);

  return (
    <div  className="space-y-4 bg-white rounded-2xl p-4">
      {/* Filter & Search */}
      <div className="flex gap-2">
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories
              .filter((cat) => cat.id) // hanya yang ada id
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>


        <Input
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset page saat search berubah
          }}
        />
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center items-center md:h-64">
            <LoadingSpinner size={10} />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex justify-center items-center md:h-64 text-gray-500">
            Data tidak tersedia
          </div>
        ) : (
          <ul className="w-full flex flex-col gap-4">
            {articles.map((article, idx) => (
              <Card
                key={article.id}
                onClick={() => router.push(`/userpage/article/${article.id}`)}
                className="cursor-pointer flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
              >
                {/* Image */}
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="md:w-60 md:h-60 w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="md:w-60 md:h-60 w-full min-h-30 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="w-full">
                  <div className="flex justify-between items-end w-full mb-4">
                    {/* Info */}
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-xl">{article.title}</h3>
                      <p className="text-sm text-gray-500">
                        By {article.user.username} | Category: {article.category.name}
                      </p>
                    </div>

                    {/* Aksi */}
                    <div className="flex justify-end gap-2 items-center">
                      <p className="text-sm text-gray-500">
                        Dibuat: {formatDateTime(article.createdAt)}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/userpage/article/${article.id}`)}
                        className="cursor-pointer"
                      >
                        Detail
                      </Button>
                    </div>
                  </div>

                  <div className="line-clamp-2 text-sm text-gray-700">
                    {article.content}
                  </div>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
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
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  );
}
