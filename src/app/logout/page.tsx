"use client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    } catch {}
    window.location.href = "/";
  }, []);
  return <div className="p-6 text-center">Logging out...</div>;
}
