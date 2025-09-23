"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import { getAuthHeader } from "@/lib/clientAuth";
import { PostCard, Post } from "@/components/PostCard";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [me, setMe] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "posts" | "settings">(
    "profile"
  );

  // Profile update form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    website: "",
    location: "",
    visibility: "public" as "public" | "private" | "followers_only",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resMe = await fetch("/api/users/me", {
          headers: { ...getAuthHeader() },
        });
        if (!resMe.ok) throw new Error("Failed to load profile");
        const jMe = await resMe.json();
        setMe(jMe);

        // Populate form data
        setFormData({
          bio: jMe.bio || "",
          website: jMe.website || "",
          location: jMe.location || "",
          visibility: jMe.visibility || "public",
        });

        const resPosts = await fetch("/api/posts?author=me", {
          headers: { ...getAuthHeader() },
        });
        if (!resPosts.ok) throw new Error("Failed to load posts");
        const jPosts = await resPosts.json();
        setPosts(jPosts.data || []);
      } catch (e: any) {
        setError(e.message || "Error loading profile");
      }
    })();
  }, []);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      let avatarUrl = me?.avatar_url;

      // Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await fetch("/api/upload/avatar", {
          method: "POST",
          headers: { ...getAuthHeader() },
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          setError(uploadData.detail || "Failed to upload avatar");
          return;
        }

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // Update profile
      const updateData = {
        ...formData,
        avatar_url: avatarUrl,
      };

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to update profile");
        return;
      }

      // Refresh profile data
      const resMe = await fetch("/api/users/me", {
        headers: { ...getAuthHeader() },
      });
      if (resMe.ok) {
        const jMe = await resMe.json();
        setMe(jMe);
      }

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError("Network error");
    } finally {
      setUpdating(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* Tab Navigation */}
      <div className="border-b border-muted">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-[var(--color-primary-end)] text-[var(--color-primary-end)]"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "posts"
                ? "border-[var(--color-primary-end)] text-[var(--color-primary-end)]"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-[var(--color-primary-end)] text-[var(--color-primary-end)]"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Profile Tab */}
      {activeTab === "profile" && me && (
        <div className="space-y-6">
          {!isEditing ? (
            // Profile Display
            <div className="border border-muted rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
                    {me.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={me.avatar_url}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {me.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{me.username}</h2>
                    <p className="text-gray-600">{me.email}</p>
                    {me.bio && <p className="mt-2 text-gray-700">{me.bio}</p>}
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      {me.location && <span>📍 {me.location}</span>}
                      {me.website && (
                        <a
                          href={me.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-primary-end)] hover:underline"
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 btn-primary-gradient rounded hover:opacity-90"
                >
                  Edit Profile
                </button>
              </div>

              <div className="flex gap-6 mt-6 text-sm">
                <Link
                  href="/profile/followers"
                  className="px-3 py-2 border rounded hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{me.followers_count}</span>
                  <span className="text-gray-600"> Followers</span>
                </Link>
                <Link
                  href="/profile/following"
                  className="px-3 py-2 border rounded hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{me.following_count}</span>
                  <span className="text-gray-600"> Following</span>
                </Link>
                <div className="px-3 py-2 border rounded bg-gray-50">
                  <span className="font-medium">{me.posts_count}</span>
                  <span className="text-gray-600"> Posts</span>
                </div>
              </div>
            </div>
          ) : (
            // Profile Edit Form
            <div className="border border-muted rounded-lg p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <h3 className="text-lg font-semibold">Edit Profile</h3>

                {/* Avatar Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarPreview}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      ) : me.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={me.avatar_url}
                          alt="current"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600">
                          {me.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    className="w-full border border-muted rounded p-2 bg-transparent"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/160
                  </p>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    className="w-full border border-muted rounded p-2 bg-transparent"
                    placeholder="https://your-website.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full border border-muted rounded p-2 bg-transparent"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    maxLength={100}
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Profile Visibility
                  </label>
                  <select
                    className="w-full border border-muted rounded p-2 bg-transparent"
                    value={formData.visibility}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as any,
                      })
                    }
                  >
                    <option value="public">Public</option>
                    <option value="followers_only">Followers Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 btn-primary-gradient rounded disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="px-4 py-2 border border-muted rounded hover:bg-opacity-80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Posts</h2>
          {posts.length === 0 ? (
            <p className="text-muted text-center py-8">
              No posts yet. Create your first post!
            </p>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onClick={() => router.push(`/posts/${p.id}`)}
                onChanged={() => {
                  // Reload posts when changed
                  (async () => {
                    try {
                      const resPosts = await fetch("/api/posts?author=me", {
                        headers: { ...getAuthHeader() },
                      });
                      if (resPosts.ok) {
                        const jPosts = await resPosts.json();
                        setPosts(jPosts.data || []);
                      }
                    } catch (e) {
                      console.error("Failed to reload posts:", e);
                    }
                  })();
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="border border-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-muted">
                    Control who can see your profile
                  </p>
                </div>
                <span className="text-sm text-gray-500 capitalize">
                  {me?.visibility}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-muted">
                    Your account email address
                  </p>
                </div>
                <span className="text-sm text-gray-500">{me?.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Member Since</h4>
                  <p className="text-sm text-muted">
                    When you joined SocialConnect
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {me?.created_at
                    ? new Date(me.created_at).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted">
                    Update your account password
                  </p>
                </div>
                <button className="px-3 py-1 border border-muted rounded text-sm hover:bg-opacity-80">
                  Change
                </button>
              </div>
            </div>
          </div>

          <div className="border border-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Theme</label>
              <select
                className="w-full border border-muted rounded p-2 bg-transparent"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
