"use client";

import { useEffect, useState } from "react";
import { articleService, categoryService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
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

  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      // fallback dummy
      const filtered = dummyData.articles.filter(a =>
        selectedCategory === "all" ? true : a.category.id === selectedCategory
      ).filter(a =>
        debouncedSearch ? a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) : true
      );

      setArticles(filtered.slice((page - 1) * limit, page * limit));
      setTotalPages(Math.ceil(filtered.length / limit));
      toast.warning("Gagal mengambil artikel dari server, menggunakan data dummy");
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
      // fallback dummy
      setCategories(dummyData.categories);
      toast.warning("Gagal mengambil kategori dari server, menggunakan data dummy");
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await articleService.deleteArticle(selectedId);
      toast.success("Artikel berhasil dihapus");
      fetchArticles(page);
    } catch (err) {
      toast.error("Gagal menghapus artikel");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
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
    <Card className="space-y-2 px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Artikel</h1>
        <Button onClick={() => router.push("/adminpage/article/create")}>
          Tambah Artikel
        </Button>
      </div>

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

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead>Diubah</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="w-full">
                <TableCell colSpan={7} className="p-0">
                  <div className="flex justify-center items-center h-64 w-fullw">
                    <LoadingSpinner size={10} />
                  </div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow className="w-full">
                <TableCell colSpan={7} className="p-0">
                  <div className="w-full flex justify-center items-center h-64 text-gray-500">
                    Data tidak tersedia
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article, idx) => (
                <TableRow key={article.id}>
                  <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                  <TableCell className="max-w-xs truncate whitespace-nowrap">
                    {article.title}
                  </TableCell>
                  <TableCell>{article.category.name}</TableCell>
                  <TableCell>{article.user.username}</TableCell>
                  <TableCell>{formatDateTime(article.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(article.updatedAt)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/adminpage/article/${article.id}`)
                      }
                    >
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => confirmDelete(article.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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

      {/* AlertDialog Hapus */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
