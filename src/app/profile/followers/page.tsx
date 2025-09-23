"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/clientAuth";
import Link from "next/link";

interface Follower {
  follower: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    bio?: string;
    visibility: string;
  };
}

export default function FollowersPage() {
  const router = useRouter();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function loadFollowers(pageNum = 1) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/users/me/followers?page=${pageNum}&per_page=20`,
        {
          headers: { ...getAuthHeader() },
        }
      );

      if (!res.ok) {
        setError("Failed to load followers");
        return;
      }

      const data = await res.json();

      if (pageNum === 1) {
        setFollowers(data.data || []);
      } else {
        setFollowers((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.data && data.data.length === 20);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowers();
  }, []);

  async function handleUnfollow(followerId: string) {
    try {
      const res = await fetch(`/api/users/${followerId}/follow`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });

      if (res.ok) {
        // Remove from followers list
        setFollowers((prev) => prev.filter((f) => f.follower !== followerId));
      }
    } catch (err) {
      console.error("Failed to unfollow:", err);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold">My Followers</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading && followers.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : followers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No followers yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Start sharing great content to get followers!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {followers.map((follower) => (
            <div key={follower.follower} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/users/${follower.follower}`}>
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
                      {follower.profiles.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={follower.profiles.avatar_url}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          {follower.profiles.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/users/${follower.follower}`}
                      className="font-medium hover:underline"
                    >
                      {follower.profiles.username}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {follower.profiles.first_name}{" "}
                      {follower.profiles.last_name}
                    </p>
                    {follower.profiles.bio && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {follower.profiles.bio}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Following you since{" "}
                      {new Date(follower.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnfollow(follower.follower)}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadFollowers(nextPage);
                }}
                disabled={loading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
