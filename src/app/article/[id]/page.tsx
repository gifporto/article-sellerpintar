"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { articleService } from "@/lib/api";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import dummyData from "@/data/dummyData.json";
import LexicalContent from "@/components/LexicalContent";

export default function ArticleDetailPage() {
  const params = useParams();
  const { id } = params;
  const articleId = Array.isArray(id) ? id[0] : id;

  const [article, setArticle] = useState<any>(null);
  const [otherArticles, setOtherArticles] = useState<any[]>([]);
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
          console.warn("API gagal, menggunakan artikel dummy", err);
          const dummyArticle =
            dummyData.articles.find((a) => a.id === articleId) ||
            dummyData.articles[0];
          setArticle(dummyArticle);
        } finally {
          setLoadingArticle(false);
        }
      };
      fetchArticle();
    }
  }, [articleId]);

  // Ambil artikel lain otomatis setelah artikel utama berhasil dimuat
  useEffect(() => {
    if (!article || !article.category?.id) return;

    const fetchOtherArticles = async () => {
      setLoadingOther(true);
      try {
        const res = await articleService.getArticles({
          page: 1,
          limit: 10,
          category: article.category.id,
        });
        const filtered = res.data.filter((a: any) => a.id !== article.id);
        setOtherArticles(filtered.slice(0, 3));
      } catch (err) {
        console.warn("API gagal, menggunakan artikel dummy lain", err);
        const other = dummyData.articles
          .filter(
            (a) => a.category.id === article.category.id && a.id !== article.id
          )
          .slice(0, 3);
        setOtherArticles(other);
      } finally {
        setLoadingOther(false);
      }
    };

    fetchOtherArticles();
  }, [article]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long", // April
      day: "numeric", // 14
      year: "numeric", // 2025
      timeZone: "Asia/Jakarta",
    });
  };

  if (loadingArticle) return <LoadingSpinner />;

  if (!article)
    return <p className="text-center py-10">Artikel tidak ditemukan</p>;

  return (
    <section className="max-w-7xl w-full mx-auto px-4 mt-24 flex flex-col gap-10">
      <div>
        <p className="mb-4 text-sm text-slate-600">
          {formatDateTime(article.createdAt)} • Create by {article.user.username}
        </p>
        <h1 className="md:text-3xl text-2xl font-semibold mb-2 text-slate-900">
          {article.title}
        </h1>
      </div>
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="mb-4 w-full md:h-[480px] h-[240px] object-cover rounded-xl"
        />
      ) : (
        <div className="mb-4 w-full h-60 bg-gray-200 flex items-center justify-center rounded-xl text-gray-400">
          No Image
        </div>
      )}
      <LexicalContent content={article.content} className="text-start prose max-w-none" />

      {loadingOther ? (
        <p className="text-gray-500">Memuat artikel lain...</p>
      ) : (
        otherArticles.length > 0 && (
          <div className="mt-6 flex flex-col gap-6">
            <h2 className="text-xl font-semibold mb-2">Other articles</h2>
            <div className="w-full grid md:grid-cols-3 grid-cols-1 gap-x-[40px] md:gap-y-[60px] gap-y-[40px] text-start">
              {otherArticles.map((article) => (
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
            </div>
          </div>
        )
      )}
    </section>
  );
}
