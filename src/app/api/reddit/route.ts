import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=12`, {
      headers: {
        'User-Agent': 'reddit-newspaper-generator/1.0.0'
      }
    });

    if (!res.ok) {
      if (res.status === 404 || res.status === 403) {
         return NextResponse.json({ error: 'Subreddit not found or private' }, { status: 404 });
      }
      return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
