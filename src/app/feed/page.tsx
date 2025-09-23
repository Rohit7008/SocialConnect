"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/clientAuth";
import { PostCard, Post } from "@/components/PostCard";

type PostT = Post;

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostT[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  async function loadFeed() {
    const res = await fetch("/api/feed?page=1", {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      setError("Failed to load feed");
      return;
    }
    const j = await res.json();
    setPosts(j.data);
  }

  useEffect(() => {
    (async () => {
      await loadFeed();
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPosting(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload/image", {
          method: "POST",
          headers: { ...getAuthHeader() },
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          setError(uploadData.detail || "Failed to upload image");
          return;
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Create post
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          content,
          image_url: imageUrl,
          category: "general",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Failed to post");
      } else {
        setContent("");
        setImageFile(null);
        setImagePreview(null);
        await loadFeed();
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setPosting(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Your Feed</h1>
      <form onSubmit={submit} className="space-y-3 border p-4 rounded">
        <div className="relative">
          <textarea
            className="w-full border rounded p-2 pr-10"
            maxLength={280}
            rows={3}
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute right-2 top-2 w-6 h-6 opacity-0 cursor-pointer"
            id="file-input"
          />
          <label htmlFor="file-input" className="absolute right-2 top-2 cursor-pointer">
            <svg
              className="w-6 h-6 text-gray-500 hover:text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>
        </div>
        <div className="space-y-2">
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={posting}
          className="w-full bg-black text-white rounded p-2 disabled:opacity-60"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </form>
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onClick={() => router.push(`/posts/${p.id}`)}
          onChanged={loadFeed}
        />
      ))}
    </div>
  );
}
