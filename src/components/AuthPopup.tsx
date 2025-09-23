"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string; // e.g., "like", "comment"
}

export function AuthPopup({
  isOpen,
  onClose,
  action = "interact",
}: AuthPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when popup is open
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, action]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const actionText =
    action === "like"
      ? "like posts"
      : action === "comment"
      ? "comment on posts"
      : "interact with posts";

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg p-6 mx-4 max-w-md w-full transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Login Required
          </h3>

          <p className="text-sm text-gray-600 mb-6">
            Please login or sign up to {actionText} and enjoy the full
            SocialConnect experience!
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 bg-gray-100 text-gray-900 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 border border-gray-200"
              onClick={onClose}
            >
              Sign Up
            </Link>
          </div>

          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
