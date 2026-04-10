"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const [subreddit, setSubreddit] = useState("");
  const [sort, setSort] = useState("top");
  const [time, setTime] = useState("day");
  const [nsfw, setNsfw] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) {
      const cleanSub = subreddit.replace(/^r\//i, "").trim();
      const queryParams = new URLSearchParams();
      queryParams.append("sort", sort);
      if (sort === "top" || sort === "controversial") {
        queryParams.append("t", time);
      }
      if (nsfw) {
        queryParams.append("nsfw", "1");
      }
      router.push(`/paper/${cleanSub}?${queryParams.toString()}`);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>The Reddit Times</h1>
      <p className={styles.subtitle}>
        Yesterday&apos;s internet, formatted for today&apos;s breakfast table.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="subreddit" className={styles.label}>
            Enter a Subreddit
          </label>
          <input
            id="subreddit"
            type="text"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
            placeholder="e.g. news, technology, AskReddit"
            className={styles.input}
            required
          />
        </div>
        
        <details className={styles.details}>
          <summary className={styles.summary}>Advanced Options</summary>
          <div className={styles.advancedOptions}>
            <div className={styles.inputGroup}>
              <label htmlFor="sort" className={styles.labelSmall}>Sort By</label>
              <select id="sort" className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="top">Top</option>
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>

            {(sort === "top" || sort === "controversial") && (
              <div className={styles.inputGroup}>
                <label htmlFor="time" className={styles.labelSmall}>Time Frame</label>
                <select id="time" className={styles.select} value={time} onChange={(e) => setTime(e.target.value)}>
                  <option value="day">Past 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            )}

            <div className={styles.checkboxGroup}>
              <input 
                id="nsfw" 
                type="checkbox" 
                checked={nsfw} 
                onChange={(e) => setNsfw(e.target.checked)} 
              />
              <label htmlFor="nsfw" className={styles.labelSmall}>Include NSFW posts</label>
            </div>
          </div>
        </details>

        <button type="submit" className={styles.button}>
          Generate Newspaper
        </button>
      </form>
    </main>
  );
}
