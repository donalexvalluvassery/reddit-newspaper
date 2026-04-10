"use client";

import { useState, useEffect } from "react";
import styles from "./paper.module.css";

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

interface Comment {
  id: string;
  author: string;
  body: string;
}

interface Props {
  post: RedditPost;
  isHero?: boolean;
  forceExpanded?: boolean;
  showComments?: boolean;
  onCommentsLoaded?: () => void;
}

export default function NewspaperArticle({ post, isHero = false, forceExpanded = false, showComments = false, onCommentsLoaded }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Derive final expanded state
  const expanded = forceExpanded || isExpanded;

  // Truncate logic
  const truncateLength = isHero ? 1000 : 250;
  const isTruncatable = post.data.selftext && post.data.selftext.length > truncateLength;
  
  const contentText = post.data.selftext 
    ? (expanded ? post.data.selftext : post.data.selftext.substring(0, truncateLength) + (isTruncatable ? '...' : ''))
    : (isHero 
         ? "In today's top story circulating on the network, readers have drawn massive attention to emerging details. The subject at hand continues to gather reactions from the community at large. Full context is still developing..."
         : "Further discussion suggests diverging opinions on the matter.");

  useEffect(() => {
    if (showComments && comments.length === 0 && !loadingComments) {
      setLoadingComments(true);
      fetch(`/api/reddit/comments?permalink=${encodeURIComponent(post.data.permalink)}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Bypass-Tunnel-Reminder": "true"
        }
      })
        .then(res => res.json())
        .then(data => {
            if (!data.error) setComments(data);
        })
        .catch(console.error)
        .finally(() => {
            setLoadingComments(false);
            if (onCommentsLoaded) onCommentsLoaded();
        });
    } else if (showComments && comments.length > 0) {
        if (onCommentsLoaded) onCommentsLoaded(); // already loaded
    }
  }, [showComments, post.data.permalink]); // eslint-disable-line react-hooks/exhaustive-deps

  const getImageUrl = (post: RedditPost) => {
    if (post.data.post_hint === "image" && !post.data.is_video) {
        return post.data.url;
    }
    if (post.data.url && post.data.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
      return post.data.url;
    }
    return null;
  };

  const articleContent = (
      <>
         {isHero ? (
            <h2 className={`${styles.articleTitle} ${styles.mainArticleTitle}`}>{post.data.title}</h2>
         ) : (
            <h3 className={`${styles.articleTitle} ${styles.secondaryArticleTitle}`}>{post.data.title}</h3>
         )}
         
         <div className={isHero ? styles.heroContent : ""}>
            <div className={isHero ? styles.heroText : ""}>
              <p className={`${styles.byline} ${isHero ? styles.mainByline : ""}`}>
                  {isHero ? "Reported by " : "By "}{post.data.author}
              </p>
              
              {!isHero && getImageUrl(post) && (
                 /* eslint-disable-next-line @next/next/no-img-element */
                 <img src={`/api/image-proxy?url=${encodeURIComponent(getImageUrl(post)!)}`} alt="" className={styles.articleImage} crossOrigin="anonymous" />
              )}

              <div className={styles.content}>
                 <p>
                    {isHero ? <span className={styles.dropCapLetter}>{contentText.charAt(0)}</span> : null}
                    {isHero ? contentText.slice(1) : contentText}
                 </p>
                 
                 {/* Local Expand Button */}
                 {!forceExpanded && isTruncatable && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className={`${styles.readMoreBtn} no-print`}>
                        {isExpanded ? "Collapse Article" : "Read Full Article"}
                    </button>
                 )}
              </div>
            </div>

            {isHero && getImageUrl(post) && (
              <div className={styles.heroImageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/image-proxy?url=${encodeURIComponent(getImageUrl(post)!)}`} alt="" className={styles.articleImage} crossOrigin="anonymous" />
              </div>
            )}
         </div>

         {/* Letters to the Editor */}
         {comments.length > 0 && (
             <div className={styles.lettersSection}>
                 <div className={styles.lettersTitle}>Letters to the Editor</div>
                 {comments.map(c => (
                     <div key={c.id} className={`${styles.commentBlock} pdf-avoid-break`}>
                         <div className={styles.commentAuthor}>{c.author} says:</div>
                         <div>{c.body.substring(0, 300)}{c.body.length > 300 ? '...' : ''}</div>
                     </div>
                 ))}
             </div>
         )}

         {/* Link logic */}
         <div className={`${styles.articleLinks} no-print`}>
             <a href={`https://www.reddit.com${post.data.permalink}`} target="_blank" rel="noopener noreferrer">
                 [ Discuss on Reddit ]
             </a>
         </div>
      </>
  );

  return (
      <div className={`${styles.article} ${isHero ? styles.heroArticle : ""} pdf-avoid-break`}>
          {articleContent}
      </div>
  );
}
