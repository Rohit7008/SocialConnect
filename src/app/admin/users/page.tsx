"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  is_verified: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      setUserDetails(data);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const deactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate user");
      }

      // Refresh users list
      fetchUsers();
      alert("User deactivated successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            User Management
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Manage users and their accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--surface)] border border-muted rounded-lg">
              <div className="px-6 py-4 border-b border-muted">
                <h2 className="text-lg font-medium text-[var(--foreground)]">
                  All Users ({users.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted">
                  <thead className="bg-[var(--surface-hover)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--surface)] divide-y divide-muted">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {user.username}
                            </div>
                            <div className="text-sm text-[var(--muted-foreground)]">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_verified
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.is_verified ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              fetchUserDetails(user.id);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[var(--color-primary-start)] hover:bg-[var(--color-primary-end)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-start)] transition-colors"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </button>
                          {user.is_verified && (
                            <button
                              onClick={() => deactivateUser(user.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                />
                              </svg>
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedUser && userDetails ? (
              <div className="bg-[var(--surface)] border border-muted rounded-lg">
                <div className="px-6 py-4 border-b border-muted">
                  <h2 className="text-lg font-medium text-[var(--foreground)]">
                    User Details
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Username
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.first_name} {userDetails.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Bio
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.bio || "No bio"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Followers
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.followers_count}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Following
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.following_count}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Posts
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.posts_count}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Privacy Setting
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {userDetails.visibility === "private" ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Private
                        </span>
                      ) : userDetails.visibility === "public" ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Followers Only
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted-foreground)]">
                      Joined
                    </label>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {formatDate(userDetails.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--surface)] border border-muted rounded-lg p-6 text-center text-[var(--muted-foreground)]">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
