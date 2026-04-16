"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Submission {
  id: string;
  name: string;
  score: number;
  submittedAt: number;
}

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

    const pieces: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotSpeed: number;
    }[] = [];

    const colors = ["#7c6ff7", "#a89cf8", "#34d399", "#f59e0b", "#f87171", "#60a5fa"];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    let frame = 0;
    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas!.height) {
          p.y = -10;
          p.x = Math.random() * canvas!.width;
        }
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = Math.max(0, 1 - frame / 300);
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx!.restore();
      }
      frame++;
      if (frame < 300) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return canvasRef;
}

const RANK_GLOW = [
  "0 0 24px rgba(251,191,36,0.35)", // gold
  "0 0 20px rgba(156,163,175,0.3)", // silver
  "0 0 16px rgba(180,111,61,0.3)", // bronze
];

const RANK_COLORS = ["#fbbf24", "#9ca3af", "#b46f3d"];
const RANK_BG = [
  "rgba(251,191,36,0.08)",
  "rgba(156,163,175,0.06)",
  "rgba(180,111,61,0.06)",
];
const RANK_LABELS = ["🥇", "🥈", "🥉"];

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState<string>(
    () =>
      typeof window !== "undefined"
        ? (localStorage.getItem("quizName") ?? "")
        : ""
  );
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      orderBy("score", "desc"),
      orderBy("submittedAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Submission, "id">),
      }));
      setEntries(data);
      setLoading(false);
    });

    return unsub;
  }, []);

  const userRank =
    currentUser
      ? entries.findIndex((e) => e.name === currentUser) + 1
      : 0;

  const isFirst = userRank === 1 && !!currentUser;
  const confettiCanvas = useConfetti(isFirst);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Confetti overlay */}
      <canvas
        ref={confettiCanvas}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
      />

      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#f1f1f8" }}>
            Leaderboard
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "#8888a8" }}>
            Real-time rankings · Updated live
          </p>

          {userRank > 0 && currentUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background:
                  userRank === 1
                    ? "rgba(251,191,36,0.15)"
                    : "rgba(124,111,247,0.15)",
                color: userRank === 1 ? "#fbbf24" : "#a89cf8",
                border: `1px solid ${userRank === 1 ? "rgba(251,191,36,0.3)" : "rgba(124,111,247,0.3)"}`,
              }}
            >
              {userRank === 1 ? "👑 " : ""}You are #{userRank}
              {userRank === 1 && " — You're winning!"}
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: "#22222e",
              border: "1.5px solid #2e2e3e",
              color: "#8888a8",
              minHeight: "48px",
            }}
          >
            ← Play Again
          </motion.button>
          <motion.button
            onClick={() => router.push("/admin")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(124,111,247,0.12)",
              border: "1.5px solid rgba(124,111,247,0.3)",
              color: "#a89cf8",
              minHeight: "48px",
            }}
          >
            Admin Panel
          </motion.button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{
                  background: "#1a1a24",
                  height: "72px",
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
            style={{ color: "#8888a8" }}
          >
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-base font-medium">No submissions yet.</p>
            <p className="text-sm mt-1">Be the first to play!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col gap-3">
              {entries.map((entry, i) => {
                const isCurrentUser =
                  entry.name === currentUser && !!currentUser;
                const rank = i + 1;
                const isTop3 = rank <= 3;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-center gap-4 rounded-2xl px-4 sm:px-5 py-4"
                    style={{
                      background: isCurrentUser
                        ? "rgba(124,111,247,0.12)"
                        : isTop3
                        ? RANK_BG[rank - 1]
                        : "#1a1a24",
                      border: `1.5px solid ${
                        isCurrentUser
                          ? "rgba(124,111,247,0.4)"
                          : isTop3
                          ? `rgba(${rank === 1 ? "251,191,36" : rank === 2 ? "156,163,175" : "180,111,61"},0.25)`
                          : "#2e2e3e"
                      }`,
                      boxShadow: isTop3 ? RANK_GLOW[rank - 1] : "none",
                    }}
                  >
                    {/* Rank */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: isTop3 ? RANK_BG[rank - 1] : "#22222e",
                        color: isTop3 ? RANK_COLORS[rank - 1] : "#8888a8",
                        border: `1.5px solid ${isTop3 ? `rgba(${rank === 1 ? "251,191,36" : rank === 2 ? "156,163,175" : "180,111,61"},0.3)` : "#2e2e3e"}`,
                      }}
                    >
                      {isTop3 ? RANK_LABELS[rank - 1] : rank}
                    </div>

                    {/* Name + time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="font-semibold text-sm sm:text-base truncate"
                          style={{
                            color: isCurrentUser ? "#a89cf8" : "#f1f1f8",
                          }}
                        >
                          {entry.name}
                        </p>
                        {isCurrentUser && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                            style={{
                              background: "rgba(124,111,247,0.2)",
                              color: "#a89cf8",
                            }}
                          >
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
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: isTop3 ? RANK_COLORS[rank - 1] : "#f1f1f8",
                        }}
                      >
                        {entry.score}
                      </p>
                      <p className="text-xs" style={{ color: "#8888a8" }}>
                        pts
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        <p className="text-center text-xs mt-8" style={{ color: "#2e2e3e" }}>
          Scores update in real-time
        </p>
      </div>
    </main>
  );
}
