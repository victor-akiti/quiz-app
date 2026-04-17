"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SEED_QUIZZES } from "@/data/quizzes";
import type { QuizBlock, QuizStatus, Submission } from "@/lib/types";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

function getQuestionLabel(quiz: QuizBlock, qId: string) {
  const q = quiz.questions.find((q) => q.id === qId);
  return q ? q.text : qId;
}

const STATUS_META: Record<QuizStatus, { label: string; bg: string; color: string; border: string }> = {
  draft:     { label: "Draft",     bg: "rgba(136,136,168,0.1)",  color: "#8888a8", border: "rgba(136,136,168,0.25)" },
  published: { label: "Published", bg: "rgba(52,211,153,0.1)",   color: "#34d399", border: "rgba(52,211,153,0.3)"  },
  locked:    { label: "Locked",    bg: "rgba(248,113,113,0.1)",  color: "#f87171", border: "rgba(248,113,113,0.3)" },
};

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit() {
    if (input === "admin123") { onUnlock(); return; }
    setError(true); setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
            style={{ background: "linear-gradient(135deg, #22222e, #2e2e3e)", border: "1.5px solid #3e3e52" }}>
            🔐
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f1f8" }}>Admin Panel</h1>
          <p className="mt-1 text-sm" style={{ color: "#8888a8" }}>Enter the admin password to continue</p>
        </div>

        <motion.div animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
          className="rounded-2xl p-6"
          style={{ background: "#1a1a24", border: `1px solid ${error ? "#f87171" : "#2e2e3e"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#8888a8" }}>
            Password
          </label>
          <input type="password" autoFocus value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter password"
            style={{
              width: "100%", background: "#22222e",
              border: `1.5px solid ${error ? "#f87171" : "#2e2e3e"}`,
              color: "#f1f1f8", outline: "none", borderRadius: "12px",
              padding: "12px 16px", minHeight: "52px", fontSize: "1rem",
            }}
            onFocus={(e) => { if (!error) e.target.style.borderColor = "#E07820"; }}
            onBlur={(e) => { if (!error) e.target.style.borderColor = "#2e2e3e"; }}
          />
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm font-medium" style={{ color: "#f87171" }}>
              Incorrect password.
            </motion.p>
          )}
          <motion.button onClick={handleSubmit}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-4 w-full py-3.5 rounded-xl text-base font-semibold"
            style={{ background: "linear-gradient(135deg, #E07820, #C96E10)", color: "#fff", minHeight: "52px", boxShadow: "0 4px 20px rgba(224,120,32,0.35)" }}>
            Unlock
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}

// ─── Score Input ──────────────────────────────────────────────────────────────

function ScoreInput({ submissionId, initialScore }: { submissionId: string; initialScore: number }) {
  const [value, setValue] = useState(String(initialScore));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setValue(String(initialScore)); }, [initialScore]);

  async function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#3e3e52";
    const num = parseInt(value, 10);
    if (isNaN(num) || num === initialScore) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "submissions", submissionId), { score: num });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally { setSaving(false); }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="number" min={0} value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        onBlur={handleBlur}
        className="w-20 rounded-lg px-3 py-2 text-sm font-bold text-center"
        style={{ background: "#22222e", border: "1.5px solid #3e3e52", color: "#f1f1f8", outline: "none" }}
        onFocus={(e) => (e.target.style.borderColor = "#E07820")}
      />
      <AnimatePresence>
        {saving && <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="text-xs" style={{ color: "#8888a8" }}>saving…</motion.span>}
        {saved && <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="text-xs font-semibold" style={{ color: "#34d399" }}>✓ Saved</motion.span>}
      </AnimatePresence>
    </div>
  );
}

// ─── Quiz Detail (submissions for one quiz) ───────────────────────────────────

function QuizDetail({ quiz, onBack }: { quiz: QuizBlock; onBack: () => void }) {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const mcqTotal = quiz.questions.filter((q) => q.type === "mcq").length;

  useEffect(() => {
    // Single equality where avoids composite index; sort newest-first client-side
    const q = query(
      collection(db, "submissions"),
      where("quizId", "==", quiz.id)
    );
    return onSnapshot(q, (snap) => {
      setSubs(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Submission, "id">) }))
          .sort((a, b) => b.submittedAt - a.submittedAt)
      );
      setLoading(false);
    });
  }, [quiz.id]);

  const statusMeta = STATUS_META[quiz.status];

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button onClick={onBack}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#22222e", border: "1.5px solid #2e2e3e", color: "#8888a8" }}>
          ←
        </motion.button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold truncate" style={{ color: "#f1f1f8" }}>{quiz.title}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.border}` }}>
              {statusMeta.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#8888a8" }}>
            {loading ? "Loading…" : `${subs.length} submission${subs.length !== 1 ? "s" : ""}`} · {mcqTotal} MCQ
          </p>
        </div>
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1a1a24", height: "140px" }} />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#8888a8" }}>
          <p className="text-3xl mb-3">📭</p>
          <p className="font-medium">No submissions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {subs.map((sub, i) => (
              <motion.div key={sub.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-5 sm:p-6"
                style={{ background: "#1a1a24", border: "1px solid #2e2e3e", boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}>
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "#f1f1f8" }}>{sub.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#8888a8" }}>{formatDate(sub.submittedAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#8888a8" }}>Score</p>
                    <ScoreInput submissionId={sub.id} initialScore={sub.score} />
                  </div>
                </div>

                <div className="mb-4" style={{ height: "1px", background: "#2e2e3e" }} />

                <div className="flex flex-col gap-3">
                  {Object.entries(sub.answers).map(([qId, answer]) => (
                    <div key={qId}>
                      <p className="text-xs font-semibold mb-1 leading-relaxed" style={{ color: "#8888a8" }}>
                        {getQuestionLabel(quiz, qId)}
                      </p>
                      <p className="text-sm leading-relaxed px-3 py-2 rounded-lg"
                        style={{ background: "#22222e", color: "#c0c0d8" }}>
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
  );
}

// ─── Quiz List (manage all quizzes) ──────────────────────────────────────────

function QuizList({ onSelect }: { onSelect: (quiz: QuizBlock) => void }) {
  const [quizzes, setQuizzes] = useState<QuizBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [transitioning, setTransitioning] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "quizzes"), (snap) => {
      setQuizzes(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<QuizBlock, "id">) }))
          .sort((a, b) => a.createdAt - b.createdAt)
      );
      setLoading(false);
    });
  }, []);

  async function seedQuizzes() {
    setSeeding(true);
    try {
      for (const q of SEED_QUIZZES) {
        await addDoc(collection(db, "quizzes"), { ...q, createdAt: Date.now() });
      }
    } finally { setSeeding(false); }
  }

  async function setStatus(quiz: QuizBlock, status: QuizStatus) {
    setTransitioning(quiz.id + status);
    try {
      await updateDoc(doc(db, "quizzes", quiz.id), { status });
    } finally { setTransitioning(null); }
  }

  function StatusButtons({ quiz }: { quiz: QuizBlock }) {
    const busy = transitioning !== null;

    const btn = (label: string, status: QuizStatus, accent: string) => (
      <motion.button
        key={label}
        onClick={() => setStatus(quiz, status)}
        disabled={busy}
        whileHover={{ scale: busy ? 1 : 1.03 }}
        whileTap={{ scale: busy ? 1 : 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
        style={{
          background: `rgba(${accent},0.1)`,
          border: `1px solid rgba(${accent},0.3)`,
          color: `rgb(${accent})`,
          opacity: busy ? 0.5 : 1,
          cursor: busy ? "not-allowed" : "pointer",
        }}>
        {transitioning === quiz.id + status ? "…" : label}
      </motion.button>
    );

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {quiz.status === "draft" && btn("Publish", "published", "52,211,153")}
        {quiz.status === "published" && btn("Lock", "locked", "248,113,113")}
        {quiz.status === "published" && btn("Unpublish", "draft", "136,136,168")}
        {quiz.status === "locked" && btn("Unlock", "published", "52,211,153")}
        {quiz.status === "locked" && btn("Unpublish", "draft", "136,136,168")}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#f1f1f8" }}>Admin Panel</h1>
          <p className="mt-1 text-sm" style={{ color: "#8888a8" }}>
            {loading ? "Loading…" : `${quizzes.length} quiz${quizzes.length !== 1 ? "zes" : ""}`} · Live
          </p>
        </div>
        <Link href="/" className="text-sm font-medium px-3 py-2 rounded-xl"
          style={{ background: "rgba(224,120,32,0.12)", border: "1.5px solid rgba(224,120,32,0.3)", color: "#F0A050" }}>
          ← Home
        </Link>
      </div>

      {/* Seed button (shown only when no quizzes exist) */}
      {!loading && quizzes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-6 mb-6 text-center"
          style={{ background: "#1a1a24", border: "1.5px dashed #2e2e3e" }}>
          <p className="text-3xl mb-3">🌱</p>
          <p className="font-semibold mb-1" style={{ color: "#f1f1f8" }}>No quizzes yet</p>
          <p className="text-sm mb-4" style={{ color: "#8888a8" }}>
            Seed the initial quiz blocks to get started.
          </p>
          <motion.button onClick={seedQuizzes} disabled={seeding}
            whileHover={{ scale: seeding ? 1 : 1.02 }} whileTap={{ scale: seeding ? 1 : 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="px-5 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: seeding ? "#2e2e3e" : "linear-gradient(135deg, #E07820, #C96E10)",
              color: seeding ? "#8888a8" : "#fff",
              boxShadow: seeding ? "none" : "0 4px 20px rgba(224,120,32,0.35)",
            }}>
            {seeding ? "Seeding…" : "Seed Initial Quizzes"}
          </motion.button>
        </motion.div>
      )}

      {/* Also show seed button when quizzes exist (to add more) */}
      {!loading && quizzes.length > 0 && (
        <div className="flex justify-end mb-4">
          <motion.button onClick={seedQuizzes} disabled={seeding}
            whileHover={{ scale: seeding ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: "#22222e", border: "1.5px solid #2e2e3e",
              color: seeding ? "#8888a8" : "#F0A050",
              opacity: seeding ? 0.6 : 1,
            }}>
            {seeding ? "Seeding…" : "+ Re-seed quizzes"}
          </motion.button>
        </div>
      )}

      {/* Quiz cards */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1a1a24", height: "120px" }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {quizzes.map((quiz, i) => {
              const meta = STATUS_META[quiz.status];
              const mcqTotal = quiz.questions.filter((q) => q.type === "mcq").length;
              return (
                <motion.div key={quiz.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl p-5"
                  style={{ background: "#1a1a24", border: "1px solid #2e2e3e", boxShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {quiz.category && (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1"
                          style={{ background: "rgba(224,120,32,0.12)", color: "#F0A050" }}>
                          {quiz.category}
                        </span>
                      )}
                      <h3 className="font-bold text-base leading-snug" style={{ color: "#f1f1f8" }}>
                        {quiz.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "#8888a8" }}>
                        {mcqTotal} question{mcqTotal !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Status actions */}
                  <StatusButtons quiz={quiz} />

                  {/* View submissions link */}
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid #2e2e3e" }}>
                    <div className="flex items-center justify-between">
                      <a href={`/leaderboard/${quiz.id}`}
                        className="text-xs font-medium" style={{ color: "#8888a8" }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#F0A050")}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#8888a8")}>
                        View leaderboard →
                      </a>
                      <motion.button
                        onClick={() => onSelect(quiz)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(224,120,32,0.12)", border: "1.5px solid rgba(224,120,32,0.25)", color: "#F0A050" }}>
                        Submissions →
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Admin Shell ──────────────────────────────────────────────────────────────

function AdminShell() {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizBlock | null>(null);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {selectedQuiz ? (
            <motion.div key={selectedQuiz.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <QuizDetail quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} />
            </motion.div>
          ) : (
            <motion.div key="list"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <QuizList onSelect={setSelectedQuiz} />
            </motion.div>
          )}
        </AnimatePresence>
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

  return unlocked ? <AdminShell /> : <PasswordGate onUnlock={handleUnlock} />;
}
