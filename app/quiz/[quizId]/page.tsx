"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getOrCreateToken, quizStorage } from "@/lib/utils";
import type { QuizBlock, Question } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

type Phase =
  | { tag: "loading" }
  | { tag: "not-found" }
  | { tag: "draft" }
  | { tag: "closed" }
  | { tag: "already-played"; name: string; score: number }
  | { tag: "name-entry"; quiz: QuizBlock }
  | { tag: "playing"; quiz: QuizBlock; playerName: string }
  | { tag: "submitting" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function autoScore(questions: Question[], answers: Answers): number {
  let score = 0;
  for (const q of questions) {
    if (q.type === "mcq" && answers[q.id] === q.correctAnswer) score++;
  }
  return score;
}

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeDasharray="60" d="M12 2a10 10 0 1 1-10 10" />
    </svg>
  );
}

function NameEntry({
  quiz,
  onStart,
}: {
  quiz: QuizBlock;
  onStart: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name."); return; }
    setChecking(true);
    setError("");
    try {
      const snap = await getDocs(
        query(
          collection(db, "submissions"),
          where("quizId", "==", quiz.id),
          where("name", "==", trimmed)
        )
      );
      if (!snap.empty) {
        setError("That name is already taken for this quiz. Try another.");
        return;
      }
      localStorage.setItem(`quiz_${quiz.id}_name`, trimmed);
      onStart(trimmed);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {quiz.category && (
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
              style={{ background: "rgba(124,111,247,0.12)", color: "#a89cf8" }}>
              {quiz.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-2"
            style={{ color: "#f1f1f8" }}>
            {quiz.title}
          </h1>
          <p className="text-sm" style={{ color: "#8888a8" }}>
            {quiz.description}
          </p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: "#1a1a24", border: "1px solid #2e2e3e", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#8888a8" }}>
            Your Name
          </label>
          <input
            id="name-input"
            type="text"
            autoFocus
            autoComplete="off"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="e.g. Alex Rivera"
            style={{
              width: "100%", background: "#22222e",
              border: `1.5px solid ${error ? "#f87171" : "#2e2e3e"}`,
              color: "#f1f1f8", outline: "none", borderRadius: "12px",
              padding: "12px 16px", fontSize: "1rem", minHeight: "52px",
            }}
            onFocus={(e) => { if (!error) e.target.style.borderColor = "#7c6ff7"; }}
            onBlur={(e) => { if (!error) e.target.style.borderColor = "#2e2e3e"; }}
          />

          <AnimatePresence>
            {error && (
              <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="mt-2 text-sm font-medium" style={{ color: "#f87171" }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleStart}
            disabled={checking}
            whileHover={{ scale: checking ? 1 : 1.02 }}
            whileTap={{ scale: checking ? 1 : 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold"
            style={{
              background: checking ? "#2e2e3e" : "linear-gradient(135deg, #7c6ff7, #5b4fcf)",
              color: checking ? "#8888a8" : "#fff",
              minHeight: "52px",
              boxShadow: checking ? "none" : "0 4px 20px rgba(124,111,247,0.35)",
              cursor: checking ? "not-allowed" : "pointer",
            }}
          >
            {checking ? <><Spinner />Checking…</> : "Start Quiz →"}
          </motion.button>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm" style={{ color: "#8888a8" }}>
            ← Back to quizzes
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function QuizPlay({
  quiz,
  playerName,
  onSubmitted,
}: {
  quiz: QuizBlock;
  playerName: string;
  onSubmitted: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const { questions } = quiz;
  const question = questions[index];
  const total = questions.length;
  const progress = ((index + 1) / total) * 100;
  const currentAnswer = answers[question.id] ?? "";
  const isAnswered = currentAnswer.trim().length > 0;

  function goNext() { setDirection(1); setIndex((i) => i + 1); }
  function goBack() { setDirection(-1); setIndex((i) => i - 1); }

  async function handleSubmit() {
    for (const q of questions) {
      if (!answers[q.id]?.trim()) {
        setSubmitError("Please answer all questions before submitting.");
        return;
      }
    }

    onSubmitted(); // show submitting screen
    setSubmitError("");

    try {
      const deviceToken = getOrCreateToken();
      const score = autoScore(questions, answers);
      await addDoc(collection(db, "submissions"), {
        quizId: quiz.id,
        name: playerName,
        answers,
        score,
        deviceToken,
        submittedAt: Date.now(),
      });
      quizStorage.save(quiz.id, playerName, score);
      router.push(`/leaderboard/${quiz.id}`);
    } catch {
      setSubmitError("Failed to submit. Please try again.");
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8888a8" }}>
              {quiz.title}
            </p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "#a89cf8" }}>
              Question {index + 1} of {total}
            </p>
          </div>
          <a href="/" className="text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ color: "#8888a8", background: "#22222e" }}>
            ✕ Exit
          </a>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full rounded-full overflow-hidden mb-8"
          style={{ background: "#22222e", height: "6px" }}>
          <motion.div animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7c6ff7, #a89cf8)" }} />
        </div>

        {/* Question card */}
        <div className="relative overflow-hidden" style={{ minHeight: "420px" }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={question.id}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: "#1a1a24", border: "1px solid #2e2e3e", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
            >
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                style={{
                  background: question.type === "mcq" ? "rgba(124,111,247,0.15)" : "rgba(52,211,153,0.15)",
                  color: question.type === "mcq" ? "#a89cf8" : "#34d399",
                }}>
                {question.type === "mcq" ? "Multiple Choice" : "Short Answer"}
              </span>

              <h2 className="text-lg sm:text-xl font-semibold leading-snug mb-6" style={{ color: "#f1f1f8" }}>
                {question.text}
              </h2>

              {question.type === "mcq" && (
                <div className="flex flex-col gap-3">
                  {question.options.map((opt, i) => {
                    const selected = currentAnswer === opt;
                    return (
                      <motion.button key={opt}
                        onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: opt }))}
                        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left"
                        style={{
                          background: selected ? "rgba(124,111,247,0.18)" : "#22222e",
                          border: `1.5px solid ${selected ? "#7c6ff7" : "#2e2e3e"}`,
                          color: selected ? "#f1f1f8" : "#c0c0d8",
                          minHeight: "52px",
                          boxShadow: selected ? "0 0 0 3px rgba(124,111,247,0.2)" : "none",
                        }}
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: selected ? "linear-gradient(135deg, #7c6ff7, #5b4fcf)" : "#2e2e3e",
                            color: selected ? "#fff" : "#8888a8",
                          }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm sm:text-base font-medium">{opt}</span>
                        {selected && (
                          <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="ml-auto" style={{ color: "#7c6ff7" }}>✓</motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {question.type === "text" && (
                <div>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                    placeholder="Type your answer here…"
                    rows={5}
                    className="w-full rounded-xl px-4 py-3 text-sm sm:text-base font-medium resize-none"
                    style={{
                      background: "#22222e", border: "1.5px solid #2e2e3e",
                      color: "#f1f1f8", outline: "none", lineHeight: "1.6",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#7c6ff7")}
                    onBlur={(e) => (e.target.style.borderColor = "#2e2e3e")}
                  />
                  <p className="mt-1.5 text-xs" style={{ color: "#8888a8" }}>
                    {currentAnswer.trim().length} characters
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {submitError && (
            <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="mt-3 text-sm font-medium text-center"
              style={{ color: "#f87171" }}>
              {submitError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {index > 0 && (
            <motion.button onClick={goBack}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1 sm:flex-none sm:w-32 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: "#22222e", border: "1.5px solid #2e2e3e", color: "#8888a8", minHeight: "52px" }}>
              ← Back
            </motion.button>
          )}

          {index < total - 1 ? (
            <motion.button onClick={goNext} disabled={!isAnswered}
              whileHover={{ scale: isAnswered ? 1.02 : 1 }} whileTap={{ scale: isAnswered ? 0.97 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: isAnswered ? "linear-gradient(135deg, #7c6ff7, #5b4fcf)" : "#22222e",
                border: `1.5px solid ${isAnswered ? "transparent" : "#2e2e3e"}`,
                color: isAnswered ? "#fff" : "#8888a8", minHeight: "52px",
                boxShadow: isAnswered ? "0 4px 20px rgba(124,111,247,0.35)" : "none",
                cursor: isAnswered ? "pointer" : "not-allowed",
              }}>
              Next →
            </motion.button>
          ) : (
            <motion.button onClick={handleSubmit} disabled={!isAnswered}
              whileHover={{ scale: isAnswered ? 1.02 : 1 }} whileTap={{ scale: isAnswered ? 0.97 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: isAnswered ? "linear-gradient(135deg, #34d399, #059669)" : "#22222e",
                border: `1.5px solid ${isAnswered ? "transparent" : "#2e2e3e"}`,
                color: isAnswered ? "#fff" : "#8888a8", minHeight: "52px",
                boxShadow: isAnswered ? "0 4px 20px rgba(52,211,153,0.3)" : "none",
                cursor: isAnswered ? "pointer" : "not-allowed",
              }}>
              Submit Answers ✓
            </motion.button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {questions.map((q, i) => (
            <motion.div key={q.id} animate={{ scale: i === index ? 1.2 : 1 }}
              className="rounded-full"
              style={{
                width: i === index ? "28px" : "8px", height: "8px",
                background: answers[q.id]?.trim() ? "#7c6ff7" : i === index ? "#a89cf8" : "#2e2e3e",
              }} />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [phase, setPhase] = useState<Phase>({ tag: "loading" });

  useEffect(() => {
    async function init() {
      // Fetch quiz document
      const quizSnap = await getDoc(doc(db, "quizzes", quizId));
      if (!quizSnap.exists()) { setPhase({ tag: "not-found" }); return; }
      const quiz = { id: quizSnap.id, ...(quizSnap.data() as Omit<QuizBlock, "id">) };

      if (quiz.status === "draft") { setPhase({ tag: "draft" }); return; }

      // Fast path: localStorage says already played
      if (quizStorage.isSubmitted(quiz.id)) {
        setPhase({
          tag: "already-played",
          name: quizStorage.getName(quiz.id),
          score: quizStorage.getScore(quiz.id),
        });
        return;
      }

      if (quiz.status === "locked") { setPhase({ tag: "closed" }); return; }

      // Slow path: token survived but flags were cleared
      const token = getOrCreateToken();
      if (token) {
        const snap = await getDocs(
          query(collection(db, "submissions"), where("deviceToken", "==", token))
        );
        const prior = snap.docs.find((d) => d.data().quizId === quizId);
        if (prior) {
          const data = prior.data();
          quizStorage.save(quiz.id, data.name as string, data.score as number);
          setPhase({ tag: "already-played", name: data.name as string, score: data.score as number });
          return;
        }
      }

      setPhase({ tag: "name-entry", quiz });
    }

    init();
  }, [quizId]);

  // ── Render phases ────────────────────────────────────────────────────────────

  if (phase.tag === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Spinner size={32} />
      </main>
    );
  }

  if (phase.tag === "not-found" || phase.tag === "draft") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
        <p className="text-4xl">🔍</p>
        <p className="text-lg font-semibold" style={{ color: "#f1f1f8" }}>
          {phase.tag === "not-found" ? "Quiz not found." : "This quiz is not available."}
        </p>
        <a href="/" className="text-sm" style={{ color: "#a89cf8" }}>← Back to quizzes</a>
      </main>
    );
  }

  if (phase.tag === "closed") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
        <p className="text-4xl">🔒</p>
        <p className="text-xl font-bold" style={{ color: "#f1f1f8" }}>This quiz is closed.</p>
        <p className="text-sm" style={{ color: "#8888a8" }}>
          Submissions are no longer being accepted.
        </p>
        <a href={`/leaderboard/${quizId}`}
          className="mt-2 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(124,111,247,0.12)", border: "1.5px solid rgba(124,111,247,0.3)", color: "#a89cf8" }}>
          View Leaderboard →
        </a>
        <a href="/" className="text-sm" style={{ color: "#8888a8" }}>← Back to quizzes</a>
      </main>
    );
  }

  if (phase.tag === "already-played") {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "#f1f1f8" }}>Already submitted!</h2>
          <p className="text-sm mb-5" style={{ color: "#8888a8" }}>
            You played as <span style={{ color: "#a89cf8", fontWeight: 600 }}>{phase.name}</span> and
            scored <span style={{ color: "#f1f1f8", fontWeight: 700 }}>{phase.score}</span> point{phase.score !== 1 ? "s" : ""}.
          </p>
          <div className="flex flex-col gap-3">
            <a href={`/leaderboard/${quizId}`}
              className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center"
              style={{ background: "linear-gradient(135deg, #7c6ff7, #5b4fcf)", color: "#fff", minHeight: "52px", boxShadow: "0 4px 20px rgba(124,111,247,0.35)" }}>
              View Leaderboard →
            </a>
            <a href="/" className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center"
              style={{ background: "#22222e", border: "1.5px solid #2e2e3e", color: "#8888a8", minHeight: "52px" }}>
              ← Back to quizzes
            </a>
          </div>
        </motion.div>
      </main>
    );
  }

  if (phase.tag === "submitting") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c6ff7, #5b4fcf)", boxShadow: "0 0 40px rgba(124,111,247,0.5)" }}>
            <Spinner size={28} />
          </div>
          <p className="text-lg font-semibold" style={{ color: "#f1f1f8" }}>Submitting your answers…</p>
          <p className="text-sm" style={{ color: "#8888a8" }}>Calculating your score</p>
        </motion.div>
      </main>
    );
  }

  if (phase.tag === "name-entry") {
    return (
      <main className="flex-1 flex flex-col">
        <NameEntry
          quiz={phase.quiz}
          onStart={(name) =>
            setPhase({ tag: "playing", quiz: phase.quiz, playerName: name })
          }
        />
      </main>
    );
  }

  // phase.tag === "playing"
  return (
    <QuizPlay
      quiz={phase.quiz}
      playerName={phase.playerName}
      onSubmitted={() => setPhase({ tag: "submitting" })}
    />
  );
}
