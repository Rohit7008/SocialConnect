"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getAuthHeader } from "@/lib/clientAuth";
import { Logo } from "./Logo";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchUsers(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  async function searchUsers(searchQuery: string) {
    try {
      setSearching(true);
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: { ...getAuthHeader() },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-80 px-5 py-3 pr-12 border border-muted rounded-full text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-end)] bg-transparent text-[var(--color-foreground)] placeholder-[var(--muted-foreground)]"
        />
        <svg
          className="absolute right-4 top-3.5 w-5 h-5 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searching && (
          <div className="absolute right-4 top-3.5 w-5 h-5 border-2 border-[var(--color-primary-end)] border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--background)] border border-muted rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,_var(--background)_90%,_transparent)]">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="flex items-center gap-3 p-3 hover:bg-[color-mix(in_oklab,_var(--foreground)_8%,_transparent)] border-b border-muted last:border-b-0"
              onClick={() => {
                setQuery("");
                setShowResults(false);
              }}
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.username}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.visibility === "public"
                        ? "bg-[rgba(0,255,157,0.15)] text-[var(--secondary-green)]"
                        : user.visibility === "followers_only"
                        ? "bg-[rgba(255,200,0,0.15)] text-yellow-400"
                        : "bg-[rgba(255,0,0,0.15)] text-red-400"
                    }`}
                  >
                    {user.visibility}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {user.first_name} {user.last_name}
                </p>
                {user.bio && (
                  <p className="text-xs text-muted truncate max-w-48">
                    {user.bio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showResults &&
        query.length >= 2 &&
        results.length === 0 &&
        !searching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--background)] border border-muted rounded-lg shadow-lg p-4 text-center text-muted">
            No users found
          </div>
        )}
    </div>
  );
}

function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { ...getAuthHeader() },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { ...getAuthHeader() },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) loadNotifications();
        }}
        className="relative p-2 hover:bg-gray-100 rounded-full"
        aria-haspopup="menu"
        aria-expanded={open}
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 border border-muted bg-[var(--background)] rounded shadow-lg text-sm max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-muted flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[var(--color-primary-end)] hover:underline text-xs"
              >
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-muted text-center">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mx-2 my-2 rounded-md cursor-pointer ${
                  !notification.is_read
                    ? "bg-[color-mix(in_oklab,_var(--color-primary-end)_12%,_var(--surface))]"
                    : "surface"
                } hover:bg-[var(--surface-hover)]`}
                onClick={() => {
                  if (!notification.is_read) markAsRead(notification.id);
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-[var(--muted)] overflow-hidden flex-shrink-0">
                    {notification.profiles?.avatar_url ? (
                      <img
                        src={notification.profiles.avatar_url}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] text-xs">
                        {notification.profiles?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--foreground)]">
                      <span className="font-medium">
                        {notification.profiles?.username}
                      </span>{" "}
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-[var(--color-primary-end)] rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/users/me", {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) {
          const profile = await res.json();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    }
    loadUserProfile();
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold overflow-hidden"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {userProfile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={userProfile.avatar_url}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{userProfile?.username?.[0]?.toUpperCase() || "Me"}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 border border-muted bg-[var(--background)] rounded shadow text-sm">
          <Link
            href="/profile"
            className="block px-3 py-2 hover:bg-[color-mix(in_oklab,_var(--foreground)_8%,_transparent)]"
          >
            Profile
          </Link>
          {userProfile?.role === "admin" && (
            <Link
              href="/admin"
              className="block px-3 py-2 hover:bg-[color-mix(in_oklab,_var(--foreground)_8%,_transparent)] text-purple-600"
            >
              Admin Panel
            </Link>
          )}
          <Link
            href="/logout"
            className="block px-3 py-2 hover:bg-[color-mix(in_oklab,_var(--foreground)_8%,_transparent)]"
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    try {
      setAuthed(Boolean(localStorage.getItem("access")));
    } catch {}
  }, []);

  const handleLogoClick = () => {
    if (authed) {
      window.location.href = "/feed";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <nav
      className="w-full border-b border-muted p-3 flex items-center justify-between"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={handleLogoClick}
          className="hover:opacity-80 transition-opacity"
        >
          <Logo size="md" />
        </button>
      </div>

      {authed && (
        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>
      )}

      <div className="flex items-center gap-4 text-sm">
        {authed ? (
          <>
            <Link
              href="/explore"
              className="hover:opacity-80 transition-opacity"
            >
              Explore
            </Link>
            <NotificationMenu />
            <ProfileMenu />
          </>
        ) : (
          <>
            <Link
              href="/explore"
              className="hover:opacity-80 transition-opacity"
            >
              Explore
            </Link>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              Login
            </Link>
            <Link
              href="/register"
              className="hover:opacity-80 transition-opacity"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export { Nav };
