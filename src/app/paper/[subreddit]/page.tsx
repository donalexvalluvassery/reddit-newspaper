"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./paper.module.css";
import html2pdf from "html2pdf.js";

// Basic interfaces for Reddit JSON
interface RedditPost {
  data: {
    id: string;
    title: string;
    author: string;
    selftext: string;
    url: string;
    is_video: boolean;
    post_hint?: string;
    permalink: string;
  };
}

export default function Newspaper({ params }: { params: { subreddit: string } }) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    query.set("subreddit", params.subreddit);
    if (searchParams?.get("sort")) query.set("sort", searchParams.get("sort")!);
    if (searchParams?.get("t")) query.set("t", searchParams.get("t")!);
    if (searchParams?.get("nsfw")) query.set("nsfw", searchParams.get("nsfw")!);

    fetch(`/api/reddit?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (data.data?.children) {
          // Sort posts to push image-heavy ones to the front
          const withImages = data.data.children.filter((post: RedditPost) => getImageUrl(post));
          const withoutImages = data.data.children.filter((post: RedditPost) => !getImageUrl(post));
          setPosts([...withImages, ...withoutImages].slice(0, 15)); // Take top 15 to keep it reasonable
        } else {
          throw new Error("No posts found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.subreddit, searchParams]);

  const handlePdfDownload = async () => {
    const element = printRef.current;
    if (!element) return;
    setIsGenerating(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opt: any = {
      margin: 0.5,
      filename: `${params.subreddit}_times.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'tabloid', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Falling back to native print.");
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const getImageUrl = (post: RedditPost) => {
    if (post.data.post_hint === "image" && !post.data.is_video) {
      return post.data.url;
    }
    if (post.data.url && post.data.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
      return post.data.url;
    }
    return null;
  };

  if (loading) return <div className={styles.loading}>Printing Press Warming Up...</div>;
  if (error) return <div className={styles.loading}>Error: {error}</div>;
  if (!posts.length) return <div className={styles.loading}>No News Today.</div>;

  const mainPost = posts[0];
  const restPosts = posts.slice(1);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <div className={styles.newspaperContainer} ref={printRef}>
        <header className={styles.header}>
          <h1 className={styles.title}>The {params.subreddit} Times</h1>
          <div className={styles.meta}>
            <span>Vol. 1</span>
            <span>{currentDate}</span>
            <span>Est. 2026</span>
          </div>
        </header>

        {/* Hero Article */}
        {mainPost && (
          <a href={`https://www.reddit.com${mainPost.data.permalink}`} target="_blank" rel="noopener noreferrer" className={`${styles.article} ${styles.heroArticle}`}>
            <h2 className={`${styles.articleTitle} ${styles.mainArticleTitle}`}>{mainPost.data.title}</h2>

            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <p className={`${styles.byline} ${styles.mainByline}`}>Reported by {mainPost.data.author}</p>
                <div className={styles.content}>
                  {mainPost.data.selftext ? (
                    <p className={styles.dropCap}>{mainPost.data.selftext.substring(0, 1000)}{mainPost.data.selftext.length > 1000 ? '...' : ''}</p>
                  ) : (
                    <p className={styles.dropCap}>In today&apos;s top story circulating on the network, readers have drawn massive attention to emerging details. The subject at hand continues to gather reactions from the community at large. Full context is still developing...</p>
                  )}
                </div>
              </div>

              {getImageUrl(mainPost) && (
                <div className={styles.heroImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(mainPost)!} alt="" className={styles.articleImage} crossOrigin="anonymous" />
                </div>
              )}
            </div>
          </a>
        )}

        {/* Masonic Layout for the Rest */}
        <div className={styles.columns}>
          {restPosts.map(post => (
            <a key={post.data.id} href={`https://www.reddit.com${post.data.permalink}`} target="_blank" rel="noopener noreferrer" className={styles.article}>
              <h3 className={`${styles.articleTitle} ${styles.secondaryArticleTitle}`}>{post.data.title}</h3>
              <p className={styles.byline}>By {post.data.author}</p>
              {getImageUrl(post) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={getImageUrl(post)!} alt="" className={styles.articleImage} crossOrigin="anonymous" />
              )}
              <div className={styles.content}>
                <p>{post.data.selftext ? post.data.selftext.substring(0, 250) + '...' : 'Further discussion suggests diverging opinions on the matter.'}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className={`${styles.actionBar} no-print`}>
        <Link href="/" className={`${styles.actionButton} ${styles.secondary}`}>&larr; Back to Search</Link>
        <button onClick={handlePdfDownload} disabled={isGenerating} className={styles.actionButton}>
          {isGenerating ? "Exporting..." : "Download PDF"}
        </button>
      </div>
    </>
  );
}
