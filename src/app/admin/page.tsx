"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminStats {
  total_users: number;
  total_posts: number;
  active_today: number;
  user_growth_percentage: number;
  post_growth_percentage: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-[var(--muted-foreground)]">
                Monitor and manage your social platform
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-[var(--color-primary-end)] to-[var(--color-primary-start)] text-white px-6 py-3 rounded-xl">
                <div className="text-sm font-medium">Welcome back, Admin</div>
                <div className="text-xs opacity-90">
                  Ready to manage your platform
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--surface)] border border-muted rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary-end)] to-[var(--color-primary-start)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-[var(--foreground)]">
                    {stats?.total_users || 0}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Registered
                </div>
                <div
                  className={`text-xs font-medium ${
                    (stats?.user_growth_percentage || 0) >= 0
                      ? "text-[var(--color-secondary-green)]"
                      : "text-red-500"
                  }`}
                >
                  {stats?.user_growth_percentage
                    ? `${stats.user_growth_percentage >= 0 ? "+" : ""}${
                        stats.user_growth_percentage
                      }% this month`
                    : "0% this month"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-muted rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-secondary-green)] to-[var(--color-secondary-blue)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">
                    Total Posts
                  </p>
                  <p className="text-3xl font-bold text-[var(--foreground)]">
                    {stats?.total_posts || 0}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Published
                </div>
                <div
                  className={`text-xs font-medium ${
                    (stats?.post_growth_percentage || 0) >= 0
                      ? "text-[var(--color-secondary-green)]"
                      : "text-red-500"
                  }`}
                >
                  {stats?.post_growth_percentage
                    ? `${stats.post_growth_percentage >= 0 ? "+" : ""}${
                        stats.post_growth_percentage
                      }% this week`
                    : "0% this week"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-muted rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">
                    Active Today
                  </p>
                  <p className="text-3xl font-bold text-[var(--foreground)]">
                    {stats?.active_today || 0}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Online
                </div>
                <div className="text-xs text-[var(--color-secondary-green)] font-medium">
                  Live
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--surface)] border border-muted rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-primary-end)] to-[var(--color-primary-start)] rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    User Management
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Manage accounts & permissions
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <p className="text-[var(--muted-foreground)] mb-6">
              View user profiles, manage account status, and handle user-related
              issues.
            </p>
            <button
              onClick={() => router.push("/admin/users")}
              className="w-full bg-gradient-to-r from-[var(--color-primary-end)] to-[var(--color-primary-start)] text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
            >
              Manage Users
            </button>
          </div>

          <div className="bg-[var(--surface)] border border-muted rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-secondary-green)] to-[var(--color-secondary-blue)] rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Content Management
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Moderate posts & content
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <p className="text-[var(--muted-foreground)] mb-6">
              Review posts, moderate content, remove inappropriate material, and
              handle reports.
            </p>
            <button
              onClick={() => router.push("/admin/posts")}
              className="w-full bg-gradient-to-r from-[var(--color-secondary-green)] to-[var(--color-secondary-blue)] text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
            >
              Manage Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
