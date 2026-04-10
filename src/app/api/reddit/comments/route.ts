import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const permalink = searchParams.get('permalink');

  if (!permalink) {
    return NextResponse.json({ error: 'Permalink is required' }, { status: 400 });
  }

  // Build the Reddit URL
  const redditUrl = new URL(`https://www.reddit.com${permalink}.json`);
  redditUrl.searchParams.set("limit", "2"); 
  redditUrl.searchParams.set("depth", "1"); // We only want top level comments

  try {
    const res = await fetch(redditUrl.toString(), {
      headers: {
        'User-Agent': 'reddit-newspaper-generator/3.0.0'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch comments: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    // Reddit returns array [0] for post, [1] for comments
    const commentsListing = data[1]?.data?.children || [];
    
    // Filter out 'more' kind
    const comments = commentsListing
      .filter((c: { kind: string }) => c.kind === 't1')
      .map((c: { data: { id: string, author: string, body: string } }) => ({
         id: c.data.id,
         author: c.data.author,
         body: c.data.body
      }));

    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
