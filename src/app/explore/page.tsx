"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/clientAuth";
import { PostCard, Post } from "@/components/PostCard";

export default function ExplorePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function loadExplorePosts() {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated by looking for access token
      let headers = {};
      let userAuthenticated = false;

      const token =
        typeof window !== "undefined" ? localStorage.getItem("access") : null;
      if (token) {
        headers = { ...getAuthHeader() };
        userAuthenticated = true;
        setIsAuthenticated(true);
      } else {
        userAuthenticated = false;
        setIsAuthenticated(false);
      }

      const res = await fetch("/api/posts?page=1&per_page=50", {
        headers,
      });

      if (!res.ok) {
        if (res.status === 401 && !userAuthenticated) {
          setError("Please login to like, comment and interact with posts");
        } else {
          setError("Failed to load posts");
        }
        return;
      }

      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExplorePosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Explore</h1>
        <p className="text-gray-600">
          Discover posts from users across SocialConnect
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts to explore yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Be the first to share something amazing!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => router.push(`/posts/${post.id}`)}
              onChanged={loadExplorePosts}
              disableInteractions={!isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
