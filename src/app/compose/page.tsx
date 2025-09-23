"use client";
import { useState } from "react";
import { getAuthHeader } from "@/lib/clientAuth";

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({
        content,
        image_url: imageUrl || null,
        category: "general",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.detail || "Failed to post");
    } else {
      setOk("Posted!");
      setContent("");
      setImageUrl("");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create Post</h1>
      <form onSubmit={submit} className="space-y-3 surface p-4 rounded">
        <textarea
          className="w-full border border-muted rounded p-2 bg-transparent"
          maxLength={280}
          rows={4}
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          className="w-full border border-muted rounded p-2 bg-transparent"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-green-600">{ok}</p>}
        <button className="w-full btn-primary-soft rounded p-2">Post</button>
      </form>
    </div>
  );
}
