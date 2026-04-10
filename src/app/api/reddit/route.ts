import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');
  const sort = searchParams.get('sort') || 'top';
  const time = searchParams.get('t') || 'day';
  const nsfw = searchParams.get('nsfw') === '1';

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  // Build the Reddit URL
  const redditUrl = new URL(`https://www.reddit.com/r/${subreddit}/${sort}.json`);
  redditUrl.searchParams.set("limit", "25"); // Fetch more to allow our algorithmic filtering
  if (sort === "top" || sort === "controversial") {
    redditUrl.searchParams.set("t", time);
  }

  try {
    const res = await fetch(redditUrl.toString(), {
      headers: {
        'User-Agent': 'reddit-newspaper-generator/2.0.0'
      }
    });

    if (!res.ok) {
      if (res.status === 404 || res.status === 403) {
         return NextResponse.json({ error: 'Subreddit not found or private' }, { status: 404 });
      }
      return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    // Filter out NSFW if requested
    if (!nsfw && data.data?.children) {
      data.data.children = data.data.children.filter((child: { data: { over_18: boolean } }) => !child.data.over_18);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
