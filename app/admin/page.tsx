"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { questions } from "@/data/questions";

interface Submission {
  id: string;
  name: string;
  answers: Record<string, string>;
  score: number;
  submittedAt: number;
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function getQuestionLabel(id: string) {
  const q = questions.find((q) => q.id === id);
  return q ? q.text : id;
}

// ─── Password Gate ───────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    if (input === "admin123") {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #22222e, #2e2e3e)",
              border: "1.5px solid #3e3e52",
              fontSize: "24px",
            }}
          >
            🔐
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f1f8" }}>
            Admin Panel
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#8888a8" }}>
            Enter the admin password to continue
          </p>
        </div>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-6"
          style={{
            background: "#1a1a24",
            border: `1px solid ${error ? "#f87171" : "#2e2e3e"}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#8888a8" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter password"
            className="w-full rounded-xl px-4 py-3 text-base font-medium"
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
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm font-medium"
              style={{ color: "#f87171" }}
            >
              Incorrect password. Try again.
            </motion.p>
          )}

          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-4 w-full py-3.5 rounded-xl text-base font-semibold"
            style={{
              background: "linear-gradient(135deg, #7c6ff7, #5b4fcf)",
              color: "#ffffff",
              minHeight: "52px",
              boxShadow: "0 4px 20px rgba(124,111,247,0.35)",
            }}
          >
            Unlock
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}

// ─── Score Input ──────────────────────────────────────────────────────────────

function ScoreInput({
  submissionId,
  initialScore,
}: {
  submissionId: string;
  initialScore: number;
}) {
  const [value, setValue] = useState(String(initialScore));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync when prop changes (realtime update from another admin tab)
  useEffect(() => {
    setValue(String(initialScore));
  }, [initialScore]);

  async function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#3e3e52";
    const num = parseInt(value, 10);
    if (isNaN(num) || num === initialScore) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "submissions", submissionId), {
        score: num,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onBlur={handleBlur}
        className="w-20 rounded-lg px-3 py-2 text-sm font-bold text-center"
        style={{
          background: "#22222e",
          border: "1.5px solid #3e3e52",
          color: "#f1f1f8",
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#7c6ff7")}
      />
      <AnimatePresence>
        {saving && (
          <motion.span
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs"
            style={{ color: "#8888a8" }}
          >
            saving…
          </motion.span>
        )}
        {saved && (
          <motion.span
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-semibold"
            style={{ color: "#34d399" }}
          >
            ✓ Saved
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

function AdminPanel() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      orderBy("submittedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSubs(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Submission, "id">),
        }))
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#f1f1f8" }}>
              Admin Panel
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#8888a8" }}>
              {loading ? "Loading…" : `${subs.length} submission${subs.length !== 1 ? "s" : ""}`} · Live
            </p>
          </div>
          <a
            href="/leaderboard"
            className="text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1.5"
            style={{
              background: "rgba(124,111,247,0.12)",
              border: "1.5px solid rgba(124,111,247,0.3)",
              color: "#a89cf8",
            }}
          >
            Leaderboard →
          </a>
        </motion.div>

        {/* Submissions */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{ background: "#1a1a24", height: "140px" }}
              />
            ))}
          </div>
        ) : subs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            style={{ color: "#8888a8" }}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No submissions yet.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {subs.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl p-5 sm:p-6"
                  style={{
                    background: "#1a1a24",
                    border: "1px solid #2e2e3e",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <h2 className="text-base font-bold" style={{ color: "#f1f1f8" }}>
                        {sub.name}
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: "#8888a8" }}>
                        {formatDate(sub.submittedAt)}
                      </p>
                    </div>

                    {/* Score editor */}
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#8888a8" }}>
                        Score
                      </p>
                      <ScoreInput
                        submissionId={sub.id}
                        initialScore={sub.score}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="mb-4"
                    style={{ height: "1px", background: "#2e2e3e" }}
                  />

                  {/* Answers */}
                  <div className="flex flex-col gap-3">
                    {Object.entries(sub.answers).map(([qId, answer]) => (
                      <div key={qId}>
                        <p
                          className="text-xs font-semibold mb-1 leading-relaxed"
                          style={{ color: "#8888a8" }}
                        >
                          {getQuestionLabel(qId)}
                        </p>
                        <p
                          className="text-sm leading-relaxed px-3 py-2 rounded-lg"
                          style={{
                            background: "#22222e",
                            color: "#c0c0d8",
                          }}
                        >
                          {answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem("adminUnlocked") === "true"
  );

  function handleUnlock() {
    sessionStorage.setItem("adminUnlocked", "true");
    setUnlocked(true);
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  return <AdminPanel />;
}
