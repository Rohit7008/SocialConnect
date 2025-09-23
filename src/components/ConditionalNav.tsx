"use client";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";

export default function ConditionalNav() {
  const pathname = usePathname();

  // Don't show the main nav on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Nav />;
}
