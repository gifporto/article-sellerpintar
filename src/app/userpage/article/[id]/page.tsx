"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { articleService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ArticleDetailPage() {
    const params = useParams();
    const { id } = params;
    const [article, setArticle] = useState<any>(null);
    const [otherArticles, setOtherArticles] = useState<any[]>([]);
    const [showOther, setShowOther] = useState(false);

    const router = useRouter();
    const articleId = Array.isArray(id) ? id[0] : id;

    useEffect(() => {
        if (articleId) {
            articleService.getArticleById(articleId).then((res) => setArticle(res));
        }
    }, [articleId]);

    const fetchOtherArticles = async () => {
        if (!article) return;

        try {
            const res = await articleService.getArticles(1, 3, undefined, article.category.id);
            // filter supaya tidak termasuk artikel yang sedang ditampilkan
            const filtered = res.data.filter((a: any) => a.id !== article.id);
            setOtherArticles(filtered.slice(0, 3)); // maksimal 3
            setShowOther(true);
        } catch (err) {
            console.error("Gagal mengambil other articles", err);
        }
    };

    if (!article) return <p>Loading...</p>;

    return (
        <section className="p-4">
            <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
            <p className="mb-4 text-sm text-gray-500">
                By {article.user.username} | Category: {article.category.name}
            </p>
            {article.imageUrl && (
                <img src={article.imageUrl || "/dummy.png" } alt={article.title} className="mb-4 w-96" />
            )}
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
            <p className="mb-4 text-sm text-gray-500">Terakhir diupdate: {article.updatedAt}</p>

            {/* Button untuk menampilkan other articles */}
            {!showOther && (
                <Button onClick={fetchOtherArticles} className="mt-4">
                    Lihat Artikel Lainnya
                </Button>
            )}

            {/* Other articles */}
            {showOther && otherArticles.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Artikel Lainnya</h2>
                    <div className="flex flex-col gap-2">
                        {otherArticles.map((a) => (
                            <Card
                                key={a.id}
                                className="p-4 cursor-pointer hover:bg-gray-50 flex flex-row"
                                onClick={() => router.push(`/userpage/article/${a.id}`)}
                            >
                                <img
                                    src={a.imageUrl || "/dummy.png"}
                                    alt={a.title}
                                    className="w-40 h-24 object-cover"
                                />
                                <div className="ml-4">
                                    <h3 className="font-semibold">{a.title}</h3>
                                    <p className="mb-4 text-sm text-gray-500">
                                        By {a.user.username} | Category: {a.category.name}
                                    </p>
                                    <p className="line-clamp-1 text-sm text-gray-700">
                                        {a.content}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
