"use client";

import { useAuth } from "@sd/feature-auth";
import { FeedScreen } from "@sd/feature-feed";
import Link from "next/link";

export default function FeedFollowingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Sign in to see content from scholars you follow
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Follow your favourite scholars to get personalised content in your feed.
        </p>
        <Link
          href="/sign-in"
          style={{
            display: "inline-block",
            padding: "0.5rem 1.5rem",
            backgroundColor: "#2563eb",
            color: "#fff",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return <FeedScreen />;
}
