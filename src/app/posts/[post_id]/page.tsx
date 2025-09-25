"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/clientAuth";
import { PostCard, Post, Comment } from "@/components/PostCard";
import { AuthPopup } from "@/components/AuthPopup";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.post_id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupAction, setAuthPopupAction] = useState<string>("");

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  async function loadPost() {
    try {
      // Try to get auth header, but don't fail if not authenticated
      let headers = {};
      let userAuthenticated = false;
      try {
        headers = { ...getAuthHeader() };
        userAuthenticated = true;
        setIsAuthenticated(true);
      } catch {
        // User not authenticated, continue without auth headers
        userAuthenticated = false;
        setIsAuthenticated(false);
      }

      const res = await fetch(`/api/posts/${postId}`, {
        headers,
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError("Post not found");
        } else {
          setError("Failed to load post");
        }
        return;
      }
      const postData = await res.json();
      setPost(postData);
    } catch (e: any) {
      setError(e.message || "Error loading post");
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      // Try to get auth header, but don't fail if not authenticated
      let headers = {};
      try {
        headers = { ...getAuthHeader() };
      } catch {
        // User not authenticated, continue without auth headers
        // Comments will still load for public posts
      }

      const res = await fetch(`/api/posts/${postId}/comments`, {
        headers,
      });
      if (res.ok) {
        const commentsData = await res.json();
        setComments(commentsData);
      }
    } catch (e: any) {
      console.error("Failed to load comments:", e);
    }
  }

  function handleAuthRequired(action: string) {
    // Check if user is authenticated by looking for access token
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access") : null;
    const userAuthenticated = !!token;

    if (!userAuthenticated) {
      setAuthPopupAction(action);
      setShowAuthPopup(true);
      return true;
    }
    return false;
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent.trim() || submittingComment) return;

    if (handleAuthRequired("comment")) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
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
        await loadPost(); // Refresh post to update comment count
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.back()}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Loading post...</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.back()}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Post Not Found</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold">Post Details</h1>
      </div>

      {/* Post */}
      <div className="border rounded-lg p-6">
        <PostCard
          post={post}
          onChanged={() => {
            loadPost();
            loadComments();
          }}
          showComments={true}
          disableInteractions={!isAuthenticated}
        />
      </div>

      {/* Comments Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        <form onSubmit={submitComment} className="mb-6 space-y-3">
          <textarea
            className="w-full border rounded p-3"
            rows={3}
            placeholder="Write a comment..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">{commentContent.length}/500</p>
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-l-4 border-gray-200 pl-4 py-2"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span className="font-medium">
                    {comment.profiles?.username}
                  </span>
                  <span>•</span>
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div className="text-gray-800">{comment.content}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        action={authPopupAction}
      />
    </div>
  );
}
