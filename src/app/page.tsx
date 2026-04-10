"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const [subreddit, setSubreddit] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) {
      // Remove 'r/' prefix if user typed it
      const cleanSub = subreddit.replace(/^r\//i, "").trim();
      router.push(`/paper/${cleanSub}`);
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
        <button type="submit" className={styles.button}>
          Generate Newspaper
        </button>
      </form>
    </main>
  );
}
