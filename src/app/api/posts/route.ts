import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createPostSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 }
    );
  const { content, image_url, category } = parsed.data;
  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert({ author: auth.sub, content, image_url, category })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const per_page = Number(searchParams.get("per_page") || 20);
  const offset = (page - 1) * per_page;
  const authorParam = searchParams.get("author");

  let query = supabaseAdmin
    .from("posts")
    .select("*, profiles!posts_author_fkey(username, avatar_url, visibility)")
    .order("created_at", { ascending: false });

  if (authorParam) {
    let authorId: string | null = null;
    if (authorParam === "me") {
      const auth = await getAuth(req);
      if (!auth) {
        return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
      }
      authorId = auth.sub;
    } else {
      authorId = authorParam;
    }
    query = query.eq("author", authorId);
  }

  const { data, error } = await query.range(offset, offset + per_page - 1);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });

  // Filter posts based on visibility settings
  let auth = null;
  try {
    auth = await getAuth(req);
  } catch {
    // User not authenticated, continue without auth
    auth = null;
  }
  const filteredData = await filterPostsByVisibility(data || [], auth?.sub);

  return NextResponse.json({ page, per_page, data: filteredData });
}

async function filterPostsByVisibility(posts: any[], currentUserId?: string) {
  if (!currentUserId) {
    // If not authenticated, only show posts from public profiles
    return posts.filter((post) => post.profiles?.visibility === "public");
  }

  const filteredPosts = [];

  for (const post of posts) {
    const postAuthor = post.author;
    const profileVisibility = post.profiles?.visibility;

    // Always show your own posts
    if (postAuthor === currentUserId) {
      filteredPosts.push(post);
      continue;
    }

    // Show posts based on profile visibility
    if (profileVisibility === "public") {
      filteredPosts.push(post);
    } else if (profileVisibility === "followers_only") {
      // Check if current user follows the post author
      const { data: followData } = await supabaseAdmin
        .from("follows")
        .select("follower")
        .eq("follower", currentUserId)
        .eq("following", postAuthor)
        .maybeSingle();

      if (followData) {
        filteredPosts.push(post);
      }
    }
    // For "private" profiles, don't show posts to anyone except the author
  }

  return filteredPosts;
}
