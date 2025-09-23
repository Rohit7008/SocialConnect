"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/clientAuth";
import Link from "next/link";

interface Following {
  following: string;
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

export default function FollowingPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unfollowing, setUnfollowing] = useState<string | null>(null);

  async function loadFollowing(pageNum = 1) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/users/me/following?page=${pageNum}&per_page=20`,
        {
          headers: { ...getAuthHeader() },
        }
      );

      if (!res.ok) {
        setError("Failed to load following");
        return;
      }

      const data = await res.json();

      if (pageNum === 1) {
        setFollowing(data.data || []);
      } else {
        setFollowing((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.data && data.data.length === 20);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowing();
  }, []);

  async function handleUnfollow(userId: string) {
    try {
      setUnfollowing(userId);
      const res = await fetch(`/api/users/me/following?user_id=${userId}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });

      if (res.ok) {
        // Remove from following list
        setFollowing((prev) => prev.filter((f) => f.following !== userId));
      }
    } catch (err) {
      console.error("Failed to unfollow:", err);
    } finally {
      setUnfollowing(null);
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
        <h1 className="text-2xl font-semibold">Following</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading && following.length === 0 ? (
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
      ) : following.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Not following anyone yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Discover and follow interesting people!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {following.map((user) => (
            <div key={user.following} className="border rounded p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/users/${user.following}`}>
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden cursor-pointer">
                      {user.profiles.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.profiles.avatar_url}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          {user.profiles.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/users/${user.following}`}
                      className="font-medium hover:underline"
                    >
                      {user.profiles.username}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {user.profiles.first_name} {user.profiles.last_name}
                    </p>
                    {user.profiles.bio && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {user.profiles.bio}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Following since{" "}
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnfollow(user.following)}
                  disabled={unfollowing === user.following}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {unfollowing === user.following
                    ? "Unfollowing..."
                    : "Unfollow"}
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
                  loadFollowing(nextPage);
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
