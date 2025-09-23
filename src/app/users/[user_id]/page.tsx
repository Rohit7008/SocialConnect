"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAuthHeader } from "@/lib/clientAuth";
import { PostCard, Post } from "@/components/PostCard";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.user_id as string;

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "posts" | "followers" | "following"
  >("posts");

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  async function loadUserData() {
    try {
      setLoading(true);
      const [userRes, postsRes, followersRes, followingRes, followStatusRes] =
        await Promise.all([
          fetch(`/api/users/${userId}`, { headers: { ...getAuthHeader() } }),
          fetch(`/api/posts?author=${userId}`, {
            headers: { ...getAuthHeader() },
          }),
          fetch(`/api/users/${userId}/followers`, {
            headers: { ...getAuthHeader() },
          }),
          fetch(`/api/users/${userId}/following`, {
            headers: { ...getAuthHeader() },
          }),
          fetch(`/api/users/${userId}/follow-status`, {
            headers: { ...getAuthHeader() },
          }),
        ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.data || []);
      }

      if (followersRes.ok) {
        const followersData = await followersRes.json();
        setFollowers(followersData);
      }

      if (followingRes.ok) {
        const followingData = await followingRes.json();
        setFollowing(followingData);
      }

      // Check if current user is following this user
      if (followStatusRes.ok) {
        const followData = await followStatusRes.json();
        setIsFollowing(followData.is_following || false);
      }
    } catch (err) {
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow() {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: { ...getAuthHeader() },
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        // Refresh user data to update follower count
        const userRes = await fetch(`/api/users/${userId}`, {
          headers: { ...getAuthHeader() },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
      }
    } catch (err) {
      setError("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* User Profile Header */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                {user.location && <span>📍 {user.location}</span>}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-6 py-2 rounded font-medium ${
              isFollowing
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } disabled:opacity-50`}
          >
            {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6 text-sm">
          <div>
            <span className="font-medium">{user.followers_count}</span>
            <span className="text-gray-600"> Followers</span>
          </div>
          <div>
            <span className="font-medium">{user.following_count}</span>
            <span className="text-gray-600"> Following</span>
          </div>
          <div>
            <span className="font-medium">{user.posts_count}</span>
            <span className="text-gray-600"> Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "posts"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "followers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "following"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Following ({following.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              {user.username} hasn't posted anything yet
            </p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onChanged={loadUserData} />
            ))
          )}
        </div>
      )}

      {activeTab === "followers" && (
        <div className="space-y-3">
          {followers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No followers yet</p>
          ) : (
            followers.map((follower) => (
              <div
                key={follower.follower}
                className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {follower.profiles?.avatar_url ? (
                    <img
                      src={follower.profiles.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                      {follower.profiles?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{follower.profiles?.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "following" && (
        <div className="space-y-3">
          {following.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Not following anyone yet
            </p>
          ) : (
            following.map((follow) => (
              <div
                key={follow.following}
                className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {follow.profiles?.avatar_url ? (
                    <img
                      src={follow.profiles.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                      {follow.profiles?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{follow.profiles?.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
