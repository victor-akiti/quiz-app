"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { quizStorage } from "@/lib/utils";
import type { QuizBlock } from "@/lib/types";

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  published: {
    label: "Open",
    bg: "rgba(52,211,153,0.12)",
    color: "#34d399",
  },
  locked: {
    label: "Closed",
    bg: "rgba(248,113,113,0.12)",
    color: "#f87171",
  },
};

function QuizCard({
  quiz,
  index,
}: {
  quiz: QuizBlock;
  index: number;
}) {
  const played = quizStorage.isSubmitted(quiz.id);
  const score = played ? quizStorage.getScore(quiz.id) : null;
  const badge = STATUS_BADGE[quiz.status];
  const isLocked = quiz.status === "locked";
  const mcqCount = quiz.questions.filter((q) => q.type === "mcq").length;

  const href = played
    ? `/leaderboard/${quiz.id}`
    : isLocked
    ? `/leaderboard/${quiz.id}`
    : `/quiz/${quiz.id}`;

  const ctaLabel = played
    ? "View Results →"
    : isLocked
    ? "View Leaderboard →"
    : "Take Quiz →";

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.985 }}
      className="block rounded-2xl p-5 sm:p-6 cursor-pointer"
      style={{
        background: "#1a1a24",
        border: `1.5px solid ${played ? "rgba(124,111,247,0.35)" : "#2e2e3e"}`,
        boxShadow: played ? "0 0 0 1px rgba(124,111,247,0.1)" : "none",
        textDecoration: "none",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {quiz.category && (
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
              style={{
                background: "rgba(124,111,247,0.12)",
                color: "#a89cf8",
              }}
            >
              {quiz.category}
            </span>
          )}
          <h2
            className="text-base sm:text-lg font-bold leading-snug"
            style={{ color: "#f1f1f8" }}
          >
            {quiz.title}
          </h2>
        </div>

        {/* Status badge */}
        {badge && (
          <span
            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        )}
      </div>

      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "#8888a8" }}
      >
        {quiz.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "#8888a8" }}>
            {mcqCount} question{mcqCount !== 1 ? "s" : ""}
          </span>
          {played && score !== null && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(124,111,247,0.15)",
                color: "#a89cf8",
              }}
            >
              Your score: {score} / {mcqCount}
            </span>
          )}
        </div>

        <span
          className="text-sm font-semibold"
          style={{
            color: played ? "#a89cf8" : isLocked ? "#8888a8" : "#34d399",
          }}
        >
          {ctaLabel}
        </span>
      </div>
    </motion.a>
  );
}

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<QuizBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "quizzes"), (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<QuizBlock, "id">) }))
        .filter((q) => q.status === "published" || q.status === "locked")
        .sort((a, b) => a.createdAt - b.createdAt);
      setQuizzes(all);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "#f1f1f8" }}
          >
            QuizArena
          </h1>
          <p className="mt-2 text-base" style={{ color: "#8888a8" }}>
            Select a quiz to begin competing
          </p>
        </motion.div>

        {/* Quiz list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{
                  background: "#1a1a24",
                  height: "140px",
                  opacity: 1 - i * 0.2,
                }}
              />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            style={{ color: "#8888a8" }}
          >
            <p className="text-4xl mb-3">🕐</p>
            <p className="font-medium">No quizzes available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col gap-4">
              {quizzes.map((quiz, i) => (
                <QuizCard key={quiz.id} quiz={quiz} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Admin link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 text-center"
        >
          <a
            href="/admin"
            className="text-xs font-medium"
            style={{ color: "#3e3e52" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#8888a8")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#3e3e52")
            }
          >
            Admin →
          </a>
        </motion.div>
      </div>
    </main>
  );
}
