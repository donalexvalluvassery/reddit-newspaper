"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./paper.module.css";

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
  }
}

export default function Newspaper({ params }: { params: { subreddit: string } }) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reddit?subreddit=${params.subreddit}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (data.data?.children) {
          setPosts(data.data.children);
        } else {
          throw new Error("No posts found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.subreddit]);

  if (loading) return <div className={styles.loading}>Printing Press Warming Up...</div>;
  if (error) return <div className={styles.loading}>Error: {error}</div>;
  if (!posts.length) return <div className={styles.loading}>No News Today.</div>;

  const getImageUrl = (post: RedditPost) => {
    if (post.data.post_hint === "image" && !post.data.is_video) {
        return post.data.url;
    }
    // Also check if url itself ends with image extension
    if (post.data.url && post.data.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
      return post.data.url;
    }
    return null;
  }

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 4);
  const bottomPosts = posts.slice(4, 10);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
    <div className={styles.newspaperContainer}>
      <header className={styles.header}>
         <h1 className={styles.title}>The {params.subreddit} Times</h1>
         <div className={styles.meta}>
            <span>Vol. 1</span>
            <span>{currentDate}</span>
            <span>Est. 2026</span>
         </div>
      </header>

      <div className={styles.grid}>
        {/* Main Hero Article */}
        <div className={styles.mainArticle}>
           <h2 className={`${styles.articleTitle} ${styles.mainArticleTitle}`}>{mainPost.data.title}</h2>
           <p className={`${styles.byline} ${styles.mainByline}`}>Reported by {mainPost.data.author}</p>
           
           {getImageUrl(mainPost) && (
             /* eslint-disable-next-line @next/next/no-img-element */
             <img src={getImageUrl(mainPost)!} alt="" className={styles.articleImage} />
           )}
           
           <div className={styles.content}>
             {mainPost.data.selftext ? (
                <p className={styles.dropCap}>{mainPost.data.selftext.substring(0, 1500)}{mainPost.data.selftext.length > 1500 ? '...' : ''}</p>
             ) : (
                <p className={styles.dropCap}>In today&apos;s top story circulating on the network, readers have drawn massive attention to emerging details. The subject at hand continues to gather reactions from the community at large. Full context is still developing...</p>
             )}
           </div>
        </div>

        {/* Sidebar Articles */}
        <div className={styles.sideBar}>
          {sidePosts.map(post => (
            <div key={post.data.id} className={styles.article}>
               <h3 className={`${styles.articleTitle} ${styles.secondaryArticleTitle}`}>{post.data.title}</h3>
               <p className={styles.byline}>By {post.data.author}</p>
               {getImageUrl(post) && (
                 /* eslint-disable-next-line @next/next/no-img-element */
                 <img src={getImageUrl(post)!} alt="" className={styles.articleImage} />
               )}
               <div className={styles.content}>
                 <p>{post.data.selftext ? post.data.selftext.substring(0, 300) + '...' : 'Further discussion suggests diverging opinions on the matter.'}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Bottom Snippets */}
        <div className={styles.bottomArticles}>
          {bottomPosts.map(post => (
            <div key={post.data.id} className={styles.article}>
              <h4 className={`${styles.articleTitle} ${styles.smallArticleTitle}`}>{post.data.title}</h4>
              <p className={styles.byline}>By {post.data.author}</p>
              <div className={styles.content}>
                 <p>{post.data.selftext ? post.data.selftext.substring(0, 150) + '...' : 'Read more on the front page of the internet.'}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Floating Action Bar */}
    <div className={`${styles.actionBar} no-print`}>
       <Link href="/" className={`${styles.actionButton} ${styles.secondary}`}>&larr; Back to Search</Link>
       <button onClick={() => window.print()} className={styles.actionButton}>Print / Save PDF</button>
    </div>
    </>
  );
}
