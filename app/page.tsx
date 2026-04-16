"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EntryPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check uniqueness
      const q = query(
        collection(db, "submissions"),
        where("name", "==", trimmed)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        setError("That name is already taken. Pick a different one!");
        setLoading(false);
        return;
      }

      localStorage.setItem("quizName", trimmed);
      router.push("/quiz");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo / hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #7c6ff7, #5b4fcf)",
              boxShadow: "0 8px 32px rgba(124,111,247,0.4)",
            }}
          >
            <span className="text-2xl font-bold text-white">Q</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#f1f1f8" }}>
            QuizArena
          </h1>
          <p className="mt-2 text-base" style={{ color: "#8888a8" }}>
            Answer fast. Climb the board. Own the top.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "#1a1a24",
            border: "1px solid #2e2e3e",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <label
            htmlFor="name-input"
            className="block text-sm font-semibold mb-2"
            style={{ color: "#8888a8", letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            Your Name
          </label>
          <input
            id="name-input"
            type="text"
            autoComplete="off"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="e.g. Alex Rivera"
            className="w-full rounded-xl px-4 py-3 text-base font-medium transition-all duration-200"
            style={{
              background: "#22222e",
              border: `1.5px solid ${error ? "#f87171" : "#2e2e3e"}`,
              color: "#f1f1f8",
              outline: "none",
              minHeight: "52px",
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "#7c6ff7";
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = "#2e2e3e";
            }}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm font-medium"
              style={{ color: "#f87171" }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleStart}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-opacity"
            style={{
              background: loading
                ? "#2e2e3e"
                : "linear-gradient(135deg, #7c6ff7, #5b4fcf)",
              color: loading ? "#8888a8" : "#ffffff",
              minHeight: "52px",
              boxShadow: loading ? "none" : "0 4px 20px rgba(124,111,247,0.35)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <Spinner />
                Checking name…
              </>
            ) : (
              "Start Quiz →"
            )}
          </motion.button>

          <p className="mt-4 text-center text-xs" style={{ color: "#8888a8" }}>
            No account needed. Just pick a unique name.
          </p>
        </motion.div>

        {/* Bottom links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 flex justify-center gap-6"
        >
          <a
            href="/leaderboard"
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: "#8888a8" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#a89cf8")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#8888a8")}
          >
            View Leaderboard
          </a>
          <span style={{ color: "#2e2e3e" }}>·</span>
          <a
            href="/admin"
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: "#8888a8" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#a89cf8")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#8888a8")}
          >
            Admin
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="0"
        d="M12 2a10 10 0 1 1-10 10"
      />
    </svg>
  );
}
