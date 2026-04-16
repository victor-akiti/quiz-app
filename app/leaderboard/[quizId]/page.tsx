"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { quizStorage } from "@/lib/utils";
import type { QuizBlock, Submission } from "@/lib/types";

// ─── Confetti ─────────────────────────────────────────────────────────────────

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#7c6ff7", "#a89cf8", "#34d399", "#f59e0b", "#f87171", "#60a5fa"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    }));

    let frame = 0;
    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed;
        if (p.y > canvas!.height) { p.y = -10; p.x = Math.random() * canvas!.width; }
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = Math.max(0, 1 - frame / 300);
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx!.restore();
      }
      frame++;
      if (frame < 300) rafRef.current = requestAnimationFrame(tick);
      else ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return canvasRef;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RANK_GLOW = [
  "0 0 24px rgba(251,191,36,0.35)",
  "0 0 20px rgba(156,163,175,0.3)",
  "0 0 16px rgba(180,111,61,0.3)",
];
const RANK_COLORS = ["#fbbf24", "#9ca3af", "#b46f3d"];
const RANK_BG = ["rgba(251,191,36,0.08)", "rgba(156,163,175,0.06)", "rgba(180,111,61,0.06)"];
const RANK_LABELS = ["🥇", "🥈", "🥉"];

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizBlock | null>(null);
  const [entries, setEntries] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(true);

  const currentUser = quizStorage.getName(quizId);

  // Fetch quiz metadata
  useEffect(() => {
    getDoc(doc(db, "quizzes", quizId)).then((snap) => {
      if (snap.exists()) {
        setQuiz({ id: snap.id, ...(snap.data() as Omit<QuizBlock, "id">) });
      }
      setQuizLoading(false);
    });
  }, [quizId]);

  // Real-time submissions for this quiz
  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      orderBy("score", "desc"),
      orderBy("submittedAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      setEntries(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) }))
          .filter((s) => s.quizId === quizId)
      );
      setLoading(false);
    });
  }, [quizId]);

  const userRank = currentUser
    ? entries.findIndex((e) => e.name === currentUser) + 1
    : 0;
  const isFirst = userRank === 1 && !!currentUser;
  const confettiCanvas = useConfetti(isFirst);
  const mcqTotal = quiz?.questions.filter((q) => q.type === "mcq").length ?? 0;

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <canvas ref={confettiCanvas} className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }} />

      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="text-center mb-8">
          {quizLoading ? (
            <div className="h-8 rounded-lg animate-pulse mx-auto mb-2"
              style={{ background: "#1a1a24", width: "200px" }} />
          ) : (
            <>
              {quiz?.category && (
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2"
                  style={{ background: "rgba(124,111,247,0.12)", color: "#a89cf8" }}>
                  {quiz.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#f1f1f8" }}>
                {quiz?.title ?? "Leaderboard"}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#8888a8" }}>
                {quiz?.status === "locked" ? "Final results" : "Live rankings · Updated in real-time"}
              </p>
            </>
          )}

          {userRank > 0 && currentUser && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: userRank === 1 ? "rgba(251,191,36,0.15)" : "rgba(124,111,247,0.15)",
                color: userRank === 1 ? "#fbbf24" : "#a89cf8",
                border: `1px solid ${userRank === 1 ? "rgba(251,191,36,0.3)" : "rgba(124,111,247,0.3)"}`,
              }}>
              {userRank === 1 ? "👑 " : ""}You are #{userRank}
              {userRank === 1 && " — You're winning!"}
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <a href="/"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center"
            style={{ background: "#22222e", border: "1.5px solid #2e2e3e", color: "#8888a8", minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ← All Quizzes
          </a>
          <a href="/admin"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center"
            style={{ background: "rgba(124,111,247,0.12)", border: "1.5px solid rgba(124,111,247,0.3)", color: "#a89cf8", minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Admin Panel
          </a>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl animate-pulse"
                style={{ background: "#1a1a24", height: "72px", opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16" style={{ color: "#8888a8" }}>
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-medium">No submissions yet.</p>
            <p className="text-sm mt-1">Be the first to play!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col gap-3">
              {entries.map((entry, i) => {
                const isCurrentUser = entry.name === currentUser && !!currentUser;
                const rank = i + 1;
                const isTop3 = rank <= 3;
                const rgbStr = rank === 1 ? "251,191,36" : rank === 2 ? "156,163,175" : "180,111,61";

                return (
                  <motion.div key={entry.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-4 rounded-2xl px-4 sm:px-5 py-4"
                    style={{
                      background: isCurrentUser ? "rgba(124,111,247,0.12)" : isTop3 ? RANK_BG[rank - 1] : "#1a1a24",
                      border: `1.5px solid ${isCurrentUser ? "rgba(124,111,247,0.4)" : isTop3 ? `rgba(${rgbStr},0.25)` : "#2e2e3e"}`,
                      boxShadow: isTop3 ? RANK_GLOW[rank - 1] : "none",
                    }}>
                    {/* Rank badge */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: isTop3 ? RANK_BG[rank - 1] : "#22222e",
                        color: isTop3 ? RANK_COLORS[rank - 1] : "#8888a8",
                        border: `1.5px solid ${isTop3 ? `rgba(${rgbStr},0.3)` : "#2e2e3e"}`,
                      }}>
                      {isTop3 ? RANK_LABELS[rank - 1] : rank}
                    </div>

                    {/* Name + time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm sm:text-base truncate"
                          style={{ color: isCurrentUser ? "#a89cf8" : "#f1f1f8" }}>
                          {entry.name}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                            style={{ background: "rgba(124,111,247,0.2)", color: "#a89cf8" }}>
                            you
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#8888a8" }}>
                        {formatDate(entry.submittedAt)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold"
                        style={{ color: isTop3 ? RANK_COLORS[rank - 1] : "#f1f1f8" }}>
                        {entry.score}
                      </p>
                      <p className="text-xs" style={{ color: "#8888a8" }}>
                        {mcqTotal > 0 ? `/ ${mcqTotal}` : "pts"}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        <p className="text-center text-xs mt-8" style={{ color: "#2e2e3e" }}>
          {quiz?.status === "locked" ? "Competition closed · Final scores" : "Scores update in real-time"}
        </p>
      </div>
    </main>
  );
}
