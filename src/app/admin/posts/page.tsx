"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  author: string;
  content: string;
  image_url: string | null;
  category: string;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface Like {
  user_id: string;
  profiles: {
    username: string;
  };
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  profiles: {
    username: string;
  };
  created_at: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postDetails, setPostDetails] = useState<{
    likes: Like[];
    comments: Comment[];
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchPostDetails = async (postId: string) => {
    try {
      const [likesResponse, commentsResponse] = await Promise.all([
        fetch(`/api/admin/posts/${postId}/likes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }),
        fetch(`/api/admin/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }),
      ]);

      if (likesResponse.ok && commentsResponse.ok) {
        const likes = await likesResponse.json();
        const comments = await commentsResponse.json();
        setPostDetails({ likes, comments });
        setShowDetails(true);
      } else {
        console.error("Failed to fetch post details");
      }
    } catch (err) {
      console.error("Error fetching post details:", err);
    }
  };

  const deletePost = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove post from local state
      setPosts(posts.filter((post) => post.id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this comment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Update local state to remove the deleted comment
      if (postDetails) {
        setPostDetails({
          ...postDetails,
          comments: postDetails.comments.filter(
            (comment) => comment.id !== commentId
          ),
        });
      }

      // Also update the post's comment count in the main list
      setPosts(
        posts.map((post) =>
          post.id === selectedPost?.id
            ? { ...post, comment_count: post.comment_count - 1 }
            : post
        )
      );

      alert("Comment deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-end)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Post Management
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Review and moderate posts on the platform
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-muted rounded-lg">
          <div className="px-6 py-4 border-b border-muted">
            <h2 className="text-lg font-medium text-[var(--foreground)]">
              All Posts ({posts.length})
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-[var(--muted-foreground)]">
                No posts found
              </div>
            </div>
          ) : (
            <div className="divide-y divide-muted">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-6 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.profiles.username}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.category === "announcement"
                              ? "bg-red-100 text-red-800"
                              : post.category === "question"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {post.category}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {post.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="text-sm text-[var(--foreground)] mb-3">
                        {truncateContent(post.content)}
                      </p>

                      {post.image_url && (
                        <div className="mb-3">
                          <img
                            src={post.image_url}
                            alt="Post image"
                            className="h-32 w-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-[var(--muted-foreground)]">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>{post.like_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>{post.comment_count}</span>
                        </div>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          fetchPostDetails(post.id);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[var(--color-primary-start)] hover:bg-[var(--color-primary-end)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-start)] transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Details Modal */}
      {showDetails && selectedPost && postDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] border border-muted rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-muted flex justify-between items-center">
              <h2 className="text-lg font-medium text-[var(--foreground)]">
                Post Details - {selectedPost.profiles.username}
              </h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedPost(null);
                  setPostDetails(null);
                }}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Post Content */}
              <div className="bg-[var(--background)] border border-muted rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedPost.profiles.username}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPost.category === "announcement"
                        ? "bg-red-100 text-red-800"
                        : selectedPost.category === "question"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedPost.category}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formatDate(selectedPost.created_at)}
                  </span>
                </div>
                <p className="text-[var(--foreground)] mb-3">
                  {selectedPost.content}
                </p>
                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt="Post image"
                    className="max-w-xs h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Likes Section */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-3">
                  Likes ({postDetails.likes.length})
                </h3>
                <div className="bg-[var(--background)] border border-muted rounded-lg p-4 max-h-48 overflow-y-auto">
                  {postDetails.likes.length === 0 ? (
                    <p className="text-[var(--muted-foreground)] text-center py-4">
                      No likes yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {postDetails.likes.map((like, index) => (
                        <div
                          key={`${like.user_id}-${index}`}
                          className="flex items-center justify-between py-2 border-b border-muted last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[var(--color-primary-start)] rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                            <span className="text-[var(--foreground)] font-medium">
                              {like.profiles.username}
                            </span>
                          </div>
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {formatDate(like.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-3">
                  Comments ({postDetails.comments.length})
                </h3>
                <div className="bg-[var(--background)] border border-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                  {postDetails.comments.length === 0 ? (
                    <p className="text-[var(--muted-foreground)] text-center py-4">
                      No comments yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {postDetails.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border-b border-muted last:border-b-0 pb-3 last:pb-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[var(--color-secondary-blue)] rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                              <span className="text-[var(--foreground)] font-medium">
                                {comment.profiles.username}
                              </span>
                              <span className="text-sm text-[var(--muted-foreground)]">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                          <p className="text-[var(--foreground)] ml-11">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
