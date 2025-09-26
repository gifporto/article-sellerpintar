"use client";

import { useEffect, useState } from "react";
import { articleService, categoryService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import dummyData from "@/data/dummyData.json";

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

  // Infinite scroll & pagination
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);

  const DUMMY_ARTICLES = dummyData.articles;
  const DUMMY_CATEGORIES = dummyData.categories;

  const fetchArticles = async (page: number) => {
    setLoading(true);
    try {
      const result = await articleService.getArticles({
        page,
        limit,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        title: debouncedSearch || undefined,
      });

      if (page === 1) {
        setArticles(result.data);
      } else {
        setArticles((prev) => [...prev, ...result.data]);
      }

      setTotalPages(result.totalPages);
      setHasMore(page < result.totalPages);
    } catch (error) {
      toast.warning("Sedang menggunakan data backup (artikel dummy)");
      setArticles(DUMMY_ARTICLES);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await categoryService.getCategories({
        page: 1,
        limit: 9999,
      });
      setCategories(result.data);
    } catch (err) {
      toast.warning("Sedang menggunakan data backup (kategori dummy)");
      setCategories(DUMMY_CATEGORIES);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, selectedCategory, debouncedSearch]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
    return formatted.replace(/:/, ".");
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search */}
      <Card className="sticky top-22 z-50 p-4">
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
                .filter((cat) => cat.id)
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
              setPage(1);
            }}
          />
        </div>
      </Card>

      <div>
        {articles.length === 0 && !loading ? (
          <div className="flex justify-center items-center md:h-64 text-gray-500">
            Data tidak tersedia
          </div>
        ) : (
          <ul className="w-full flex flex-col gap-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                onClick={() => router.push(`/userpage/article/${article.id}`)}
                className="cursor-pointer flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition"
              >
                {article.imageUrl ? (
                  <div className="md:w-80 md:h-60 w-full h-40 overflow-hidden rounded-md">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="md:w-80 md:h-60 w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="w-full">
                  <div className="md:flex justify-between items-end w-full mb-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-xl">{article.title}</h3>
                      <p className="text-sm text-gray-500">
                        By {article.user.username} | Category: {article.category.name}
                      </p>
                    </div>

                    <div className="flex md:justify-end justify-between gap-2 items-center">
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

        {loading && (
          <div className="flex justify-center items-center my-4">
            <LoadingSpinner/>
          </div>
        )}

        {!hasMore && articles.length > 0 && !loading && (
          <div className="text-center text-gray-500 mt-4">
            Semua artikel telah ditampilkan
          </div>
        )}
      </div>
    </div>
  );
}
