"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import dummyData from "@/data/dummyData.json";

export default function ArticleDetailPage() {
  const params = useParams();
  const { id } = params;
  const articleId = Array.isArray(id) ? id[0] : id;

  const [article, setArticle] = useState<any>(null);
  const [otherArticles, setOtherArticles] = useState<any[]>([]);
  const [showOther, setShowOther] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [loadingOther, setLoadingOther] = useState(false);

  const router = useRouter();

  // Ambil artikel utama
 useEffect(() => {
  if (articleId) {
    const fetchArticle = async () => {
      setLoadingArticle(true);
      try {
        const res = await articleService.getArticleById(articleId);
        setArticle(res);
      } catch (err) {
        // fallback ke dummy
        console.warn("API gagal, menggunakan artikel dummy", err);
        const dummyArticle = dummyData.articles.find(a => a.id === articleId) || dummyData.articles[0];
        setArticle(dummyArticle);
      } finally {
        setLoadingArticle(false);
      }
    };
    fetchArticle();
  }
}, [articleId]);

  // Ambil artikel lain
  const fetchOtherArticles = async () => {
  if (!article || !article.category?.id) return;

  setLoadingOther(true);
  try {
    const res = await articleService.getArticles({
      page: 1,
      limit: 10,
      category: article.category.id,
    });
    const filtered = res.data.filter((a: any) => a.id !== article.id);
    setOtherArticles(filtered.slice(0, 3));
    setShowOther(true);
  } catch (err) {
    // fallback ke dummy
    console.warn("API gagal, menggunakan artikel dummy lain", err);
    const other = dummyData.articles
      .filter(a => a.category.id === article.category.id && a.id !== article.id)
      .slice(0, 3);
    setOtherArticles(other);
    setShowOther(true);
  } finally {
    setLoadingOther(false);
  }
};

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      })
      .replace(":", ".");
  };

  // Jika artikel utama masih loading
  if (loadingArticle) return <LoadingSpinner size={12} />;

  if (!article) return <p className="text-center py-10">Artikel tidak ditemukan</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <p className="mb-4 text-sm text-gray-500">
        By {article.user.username} | Category: {article.category?.name || "-"}
      </p>
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="mb-4 w-full max-w-md object-cover rounded-md"
        />
      ) : (
        <div className="mb-4 w-full max-w-md h-60 bg-gray-200 flex items-center justify-center rounded-md text-gray-400">
          No Image
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      <p className="mb-4 mt-2 text-sm text-gray-500">
        Terakhir diupdate: {formatDateTime(article.updatedAt)}
      </p>

      {!showOther && (
        <Button onClick={fetchOtherArticles} className="mt-4" disabled={loadingOther}>
          {loadingOther ? (
            <div className="flex items-center space-x-2">
              <span>Memuat...</span>
            </div>
          ) : (
            "Lihat Artikel Lainnya"
          )}
        </Button>
      )}

      {showOther && otherArticles.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Artikel Lainnya</h2>
          <div className="flex flex-col  gap-2">
            {otherArticles.map((a) => (
              <Card
                key={a.id}
                className="p-4 cursor-pointer hover:bg-gray-50 flex md:flex-row flex-col gap-4"
                onClick={() => router.push(`/userpage/article/${a.id}`)}
              >
                <img
                  src={a.imageUrl || "/dummy.png"}
                  alt={a.title}
                  className="md:w-40 w-full h-40 object-cover rounded-md"
                />
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mb-1 text-sm text-gray-500">
                    By {a.user.username} | Category: {a.category?.name || "-"}
                  </p>
                  <p className="line-clamp-2 text-sm text-gray-700">{a.content}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
