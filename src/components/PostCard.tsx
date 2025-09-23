"use client";
import { useEffect, useState } from "react";
import { getAuthHeader } from "@/lib/clientAuth";
import { AuthPopup } from "./AuthPopup";

export type Post = {
  id: string;
  content: string;
  image_url?: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: { id?: string };
  profiles?: { username: string; avatar_url?: string | null };
};

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  author: string;
  profiles?: { username: string; avatar_url?: string | null };
};

export function PostCard({
  post,
  onChanged,
  showComments = false,
  onClick,
  disableInteractions = false,
}: {
  post: Post;
  onChanged?: () => void;
  showComments?: boolean;
  onClick?: () => void;
  disableInteractions?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentsLocal, setShowCommentsLocal] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupAction, setAuthPopupAction] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/posts/${post.id}/like-status`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const j = await res.json();
        setLiked(!!j.liked);
      }
    })();
  }, [post.id]);

  async function loadComments() {
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      headers: { ...getAuthHeader() },
    });
    if (res.ok) {
      const j = await res.json();
      setComments(j);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent.trim() || submittingComment) return;

    if (handleAuthRequired("comment")) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ content: commentContent.trim() }),
      });

      if (res.ok) {
        setCommentContent("");
        await loadComments();
        onChanged?.(); // Refresh post to update comment count
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  function handleAuthRequired(action: string) {
    // Check if user is authenticated by looking for access token
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access") : null;
    const isAuthenticated = !!token;

    if (!isAuthenticated) {
      setAuthPopupAction(action);
      setShowAuthPopup(true);
      return true;
    }
    return false;
  }

  async function toggleLike() {
    if (submitting) return;

    if (handleAuthRequired("like")) return;

    setSubmitting(true);
    try {
      if (!liked) {
        const r = await fetch(`/api/posts/${post.id}/like`, {
          method: "POST",
          headers: { ...getAuthHeader() },
        });
        if (r.ok) {
          setLiked(true);
          setLikeCount((c) => c + 1);
        }
      } else {
        const r = await fetch(`/api/posts/${post.id}/like`, {
          method: "DELETE",
          headers: { ...getAuthHeader() },
        });
        if (r.ok) {
          setLiked(false);
          setLikeCount((c) => Math.max(0, c - 1));
        }
      }
      onChanged?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border rounded p-4 space-y-2">
      {/* Clickable post content area */}
      <div
        onClick={onClick}
        className="cursor-pointer -m-4 p-4 rounded transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
            {post.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.profiles.avatar_url} alt="avatar" />
            ) : null}
          </div>
          <span className="font-medium">{post.profiles?.username}</span>
          <span>• {new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div>{post.content}</div>
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="post" className="rounded" />
        )}
      </div>

      {/* Interaction buttons - not clickable for navigation */}
      <div className="flex items-center gap-4 text-sm text-gray-700 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent post click
            toggleLike();
          }}
          className={`px-2 py-1 border rounded transition-colors ${
            liked
              ? "bg-[var(--color-primary-end)] text-white border-[var(--color-primary-end)]"
              : "hover:bg-gray-50"
          }`}
        >
          {liked ? "♥ Unlike" : "♡ Like"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent post click
            if (handleAuthRequired("comment")) return;
            if (showComments) {
              // If comments are always shown, do nothing
              return;
            }
            setShowCommentsLocal(!showCommentsLocal);
            if (!showCommentsLocal) loadComments();
          }}
          className="px-2 py-1 border rounded"
        >
          💬 Comment
        </button>
        <span>
          {likeCount} likes • {post.comment_count} comments
        </span>
      </div>

      {(showComments || showCommentsLocal) && (
        <div
          className="border-t pt-3 mt-3 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={submitComment} className="space-y-2">
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={2}
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              maxLength={200}
            />
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-l-2 border-gray-200 pl-3 py-1"
              >
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">
                    {comment.profiles?.username}
                  </span>
                  <span>• {new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm mt-1">{comment.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        action={authPopupAction}
      />
    </div>
  );
}
