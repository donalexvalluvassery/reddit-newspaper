# 🗞️ The Reddit Times (Newspaper Generator)

A modern, containerized web application that transforms the front page of any subreddit into a visually stunning, retro-themed newspaper layout. Perfect for reading yesterday's internet at today's breakfast table.

🌍 **Live Demo:** [https://news.hasvac.com](https://news.hasvac.com)

## ✨ Features

- **Dynamic Masonry Layout**: Articles flow naturally downwards across columns seamlessly without whitespace, imitating a genuine broadsheet utilizing modern CSS multi-column pagination.
- **Smart Visual Triage**: Our algorithm identifies visual posts (posts containing images) and anchors them explicitly to the Hero sections to guarantee a beautiful front-page presence, while text-heavy discussions flow below.
- **True PDF Export Capability**: Instead of browser-enforced linear printing matrices, the application uses `html2pdf.js` to construct an exact pixel-perfect PDF replica of the screen styling. What you see is exactly what you get when you hit print!
- **Clickable Content Links**: Every story acts as a hyperlink, elegantly taking you directly to the original discussion on Reddit.
- **Advanced Control Matrix**: Filter the news by *Sort Criteria* (Top, Hot, New, Controversial), *Time Frames* (Past 24 Hours, Week, Year), and an optional *NSFW* toggle directly from the landing page.
- **CORS Compliant**: Leverages a robust Next.js API server to proxy fetch requests, eliminating browser-side rate limits and Cross-Origin request failures.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router API)
- **Styling**: Vanilla CSS (CSS Modules & CSS Columns)
- **Typography**: Native Google Fonts (Playfair Display & Lora)
- **Exporting**: html2pdf.js 
- **Infrastructure**: Docker & Docker Compose

## 🚀 Quick Start (Docker)

The application is thoroughly containerized and optimized for production using a multi-stage Docker build. 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/reddit-newspaper.git
   cd reddit-newspaper
   ```

2. **Spin up the container:**
   ```bash
   docker compose up --build
   ```

3. **Read the news:**
   Navigate to [http://localhost:3000](http://localhost:3000) inside your browser.

## 💻 Manual Setup

If you wish to run the app natively without Docker, ensure you have **Node.js 18.17.0+** installed.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 License

This project is open-sourced under the MIT License.
