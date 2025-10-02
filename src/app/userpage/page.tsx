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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import dummyData from "@/data/dummyData.json";
import { GalleryVerticalEnd, SearchIcon } from "lucide-react";

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long", // April
      day: "numeric", // 14
      year: "numeric", // 2025
      timeZone: "Asia/Jakarta",
    });
  };

  return (
    <div className="space-y-4">
      {/* Hero / Banner */}
      <section
        className="relative w-full bg-cover bg-center text-white md:h-[500px] h-[560px] flex flex-col"
        style={{ backgroundImage: "url('/assets/bg-home.jpg')" }}
      >
        {/* Overlay card */}
        <div className="pt-24 md:pt-0 absolute inset-0 bg-primary bg-opacity-70 flex flex-col justify-center px-4 text-center gap-4">
          <p>Blog genzet</p>
          <h1 className="md:text-5xl text-4xl font-bold text-white">The Journal : Design Resources, <br /> Interviews, and Industry News</h1>
          <h2 className="md:text-2xl text-xl">Your daily dose of design insights!</h2>
          {/* Filter & Search */}
          <div className="md:w-1/2 w-full flex md:flex-row flex-col gap-2 mx-auto z-20 p-2 bg-white/20 border-0 rounded-xl">
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-48 w-full bg-white text-gray-900">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">select category</SelectItem>
                {categories
                  .filter((cat) => cat.id)
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>


            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                className="pl-9 placeholder:text-slate-400 text-slate-900"
                placeholder="Cari artikel..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

          </div>
        </div>
      </section>

      <section className="max-w-7xl w-full mx-auto px-4">
        {articles.length === 0 && !loading ? (
          <div className="flex justify-center items-center md:h-64 text-gray-500">
            Data tidak tersedia
          </div>
        ) : (
          <ul className="w-full grid md:grid-cols-3 grid-cols-1 gap-x-[40px] md:gap-y-[60px] gap-y-[40px]">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => router.push(`/userpage/article/${article.id}`)}
                className="cursor-pointer items-start gap-15"
              >
                {article.imageUrl ? (
                  <div className="md:w-96 md:h-60 w-full h-50 overflow-hidden rounded-xl">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="md:w-96 md:h-60 w-full h-50 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2 w-full">
                  <p className="text-sm text-slate-500">
                    {formatDateTime(article.createdAt)}
                  </p>
                  <h3 className="font-semibold text-lg">{article.title}</h3>
                  <div className="line-clamp-2 text-base text-slate-900">
                    {article.content}
                  </div>
                  <span className="rounded-full w-fit bg-blue-200 text-blue-900 px-3 py-1">{article.category.name}</span>
                </div>
              </div>
            ))}
          </ul>
        )}

        {loading && (
          <div className="flex justify-center items-center my-4">
            <LoadingSpinner />
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-15">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

      </section>
    </div>
  );
}
