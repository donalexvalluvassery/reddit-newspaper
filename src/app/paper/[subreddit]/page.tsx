"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./paper.module.css";
import html2pdf from "html2pdf.js";
import NewspaperArticle from "./NewspaperArticle";

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
    over_18: boolean;
  };
}

export default function Newspaper({ params }: { params: { subreddit: string } }) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // PDF Generator States
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandAll, setExpandAll] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  
  // Active Print Directives
  const [forceExpanded, setForceExpanded] = useState(false);
  const [forceComments, setForceComments] = useState(false);

  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    query.set("subreddit", params.subreddit);
    if (searchParams?.get("sort")) query.set("sort", searchParams.get("sort")!);
    if (searchParams?.get("t")) query.set("t", searchParams.get("t")!);
    if (searchParams?.get("nsfw")) query.set("nsfw", searchParams.get("nsfw")!);

    fetch(`/api/reddit?${query.toString()}`, {
      headers: {
         "ngrok-skip-browser-warning": "true",
         "Bypass-Tunnel-Reminder": "true"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (data.data?.children) {
          const getImageUrl = (p: RedditPost) => (p.data.post_hint === 'image' || p.data.url?.match(/\.(jpeg|jpg|gif|png)$/i)) && !p.data.is_video;
          const withImages = data.data.children.filter((post: RedditPost) => getImageUrl(post));
          const withoutImages = data.data.children.filter((post: RedditPost) => !getImageUrl(post));
          setPosts([...withImages, ...withoutImages].slice(0, 15));
        } else {
          throw new Error("No posts found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.subreddit, searchParams]);

  const executePdf = async () => {
    const element = printRef.current;
    if (!element) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opt: any = {
      margin:       0.5,
      filename:     `${params.subreddit}_times.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'tabloid', orientation: 'portrait' as const },
      pagebreak:    { mode: 'avoid-all', avoid: '.pdf-avoid-break' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Falling back to native print.");
      window.print();
    } finally {
      // Revert styles
      setIsGenerating(false);
      setShowModal(false);
      setForceExpanded(false);
      setForceComments(false);
    }
  };

  const startPdfGeneration = () => {
    setIsGenerating(true);
    setForceExpanded(expandAll);
    if (includeComments) {
      setForceComments(true);
      setTimeout(() => executePdf(), 3500); // Allow fetches to complete
    } else {
      setTimeout(() => executePdf(), 500); // Allow masonry DOM to respond to expansion
    }
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

      {mainPost && (
         <NewspaperArticle 
             post={mainPost} 
             isHero={true} 
             forceExpanded={forceExpanded} 
             showComments={forceComments} 
         />
      )}

      <div className={styles.columns}>
        {restPosts.map((post, index) => (
          <NewspaperArticle 
             key={post.data.id} 
             post={post} 
             forceExpanded={forceExpanded}
             showComments={forceComments && index < 5} // Limit comment fetches to top 5 articles to prevent Reddit 429
          />
        ))}
      </div>
    </div>

    {/* Floating Action Bar */}
    <div className={`${styles.actionBar} no-print`}>
       <Link href="/" className={`${styles.actionButton} ${styles.secondary}`}>&larr; Back to Search</Link>
       <button onClick={() => setShowModal(true)} disabled={isGenerating} className={styles.actionButton}>
          Export PDF
       </button>
    </div>

    {/* Advanced Generator Modal */}
    {showModal && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Print Setup</h2>
                
                <div className={styles.modalOption}>
                    <input 
                       id="expandAll" 
                       type="checkbox" 
                       checked={expandAll} 
                       onChange={(e) => setExpandAll(e.target.checked)} 
                    />
                    <label htmlFor="expandAll">Expand all articles fully</label>
                </div>
                
                <div className={styles.modalOption}>
                    <input 
                       id="inclComments" 
                       type="checkbox" 
                       checked={includeComments} 
                       onChange={(e) => setIncludeComments(e.target.checked)} 
                    />
                    <label htmlFor="inclComments">Include &quot;Letters to the Editor&quot; (Reddit Comments)</label>
                </div>

                <div className={styles.modalActions}>
                    <button onClick={() => setShowModal(false)} className={`${styles.actionButton} ${styles.secondary}`} disabled={isGenerating}>Cancel</button>
                    <button onClick={startPdfGeneration} className={styles.actionButton} disabled={isGenerating}>
                        {isGenerating ? "Typesetting..." : "Generate Document"}
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}
