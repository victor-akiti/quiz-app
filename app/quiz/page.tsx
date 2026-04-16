"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { questions } from "@/data/questions";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

type Answers = Record<string, string>;

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function autoScore(answers: Answers): number {
  let score = 0;
  for (const q of questions) {
    if (q.type === "mcq" && answers[q.id] === q.correctAnswer) {
      score += 1;
    }
  }
  return score;
}

export default function QuizPage() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const question = questions[index];
  const total = questions.length;
  const progress = ((index + 1) / total) * 100;
  const currentAnswer = answers[question.id] ?? "";
  const isAnswered = currentAnswer.trim().length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("quizSubmitted") === "true") {
      router.replace("/leaderboard");
    } else if (!localStorage.getItem("quizName")) {
      router.replace("/");
    }
  }, [router]);

  function goNext() {
    if (index < total - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (index > 0) {
      setDirection(-1);
      setIndex((i) => i - 1);
    }
  }

  async function handleSubmit() {
    // Validate all answered
    for (const q of questions) {
      if (!answers[q.id]?.trim()) {
        setSubmitError("Please answer all questions before submitting.");
        return;
      }
    }

    const name = localStorage.getItem("quizName") ?? "Unknown";
    setSubmitting(true);
    setSubmitError("");

    try {
      const score = autoScore(answers);
      await addDoc(collection(db, "submissions"), {
        name,
        answers,
        score,
        submittedAt: Date.now(),
      });
      localStorage.setItem("quizSubmitted", "true");
      router.push("/leaderboard");
    } catch {
      setSubmitError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c6ff7, #5b4fcf)",
              boxShadow: "0 0 40px rgba(124,111,247,0.5)",
            }}
          >
            <SubmitSpinner />
          </div>
          <p className="text-lg font-semibold" style={{ color: "#f1f1f8" }}>
            Submitting your answers…
          </p>
          <p className="text-sm" style={{ color: "#8888a8" }}>
            Calculating your score
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8888a8" }}>
              QuizArena
            </p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "#a89cf8" }}>
              Question {index + 1} of {total}
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#8888a8", background: "#22222e" }}
          >
            ✕ Exit
          </a>
        </motion.div>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden mb-8"
          style={{ background: "#22222e", height: "6px" }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #7c6ff7, #a89cf8)",
            }}
          />
        </div>

        {/* Question card */}
        <div className="relative overflow-hidden" style={{ minHeight: "420px" }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={question.id}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "#1a1a24",
                border: "1px solid #2e2e3e",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              {/* Question type badge */}
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                style={{
                  background:
                    question.type === "mcq"
                      ? "rgba(124,111,247,0.15)"
                      : "rgba(52,211,153,0.15)",
                  color: question.type === "mcq" ? "#a89cf8" : "#34d399",
                }}
              >
                {question.type === "mcq" ? "Multiple Choice" : "Short Answer"}
              </span>

              <h2 className="text-lg sm:text-xl font-semibold leading-snug mb-6" style={{ color: "#f1f1f8" }}>
                {question.text}
              </h2>

              {/* MCQ Options */}
              {question.type === "mcq" && (
                <div className="flex flex-col gap-3">
                  {question.options.map((opt, i) => {
                    const selected = currentAnswer === opt;
                    return (
                      <motion.button
                        key={opt}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: opt,
                          }))
                        }
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                        className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200"
                        style={{
                          background: selected ? "rgba(124,111,247,0.18)" : "#22222e",
                          border: `1.5px solid ${selected ? "#7c6ff7" : "#2e2e3e"}`,
                          color: selected ? "#f1f1f8" : "#c0c0d8",
                          minHeight: "52px",
                          boxShadow: selected
                            ? "0 0 0 3px rgba(124,111,247,0.2)"
                            : "none",
                        }}
                      >
                        {/* Option label */}
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: selected
                              ? "linear-gradient(135deg, #7c6ff7, #5b4fcf)"
                              : "#2e2e3e",
                            color: selected ? "#fff" : "#8888a8",
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm sm:text-base font-medium">
                          {opt}
                        </span>
                        {selected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="ml-auto"
                            style={{ color: "#7c6ff7" }}
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Text Input */}
              {question.type === "text" && (
                <div>
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer here…"
                    rows={5}
                    className="w-full rounded-xl px-4 py-3 text-sm sm:text-base font-medium resize-none transition-all duration-200"
                    style={{
                      background: "#22222e",
                      border: "1.5px solid #2e2e3e",
                      color: "#f1f1f8",
                      outline: "none",
                      lineHeight: "1.6",
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
        {submitError && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm font-medium text-center"
            style={{ color: "#f87171" }}
          >
            {submitError}
          </motion.p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {index > 0 && (
            <motion.button
              onClick={goBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1 sm:flex-none sm:w-32 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: "#22222e",
                border: "1.5px solid #2e2e3e",
                color: "#8888a8",
                minHeight: "52px",
              }}
            >
              ← Back
            </motion.button>
          )}

          {index < total - 1 ? (
            <motion.button
              onClick={goNext}
              disabled={!isAnswered}
              whileHover={{ scale: isAnswered ? 1.02 : 1 }}
              whileTap={{ scale: isAnswered ? 0.97 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isAnswered
                  ? "linear-gradient(135deg, #7c6ff7, #5b4fcf)"
                  : "#22222e",
                border: `1.5px solid ${isAnswered ? "transparent" : "#2e2e3e"}`,
                color: isAnswered ? "#ffffff" : "#8888a8",
                minHeight: "52px",
                boxShadow: isAnswered
                  ? "0 4px 20px rgba(124,111,247,0.35)"
                  : "none",
                cursor: isAnswered ? "pointer" : "not-allowed",
              }}
            >
              Next →
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={!isAnswered}
              whileHover={{ scale: isAnswered ? 1.02 : 1 }}
              whileTap={{ scale: isAnswered ? 0.97 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isAnswered
                  ? "linear-gradient(135deg, #34d399, #059669)"
                  : "#22222e",
                border: `1.5px solid ${isAnswered ? "transparent" : "#2e2e3e"}`,
                color: isAnswered ? "#ffffff" : "#8888a8",
                minHeight: "52px",
                boxShadow: isAnswered
                  ? "0 4px 20px rgba(52,211,153,0.3)"
                  : "none",
                cursor: isAnswered ? "pointer" : "not-allowed",
              }}
            >
              Submit Answers ✓
            </motion.button>
          )}
        </div>

        {/* Answer status dots */}
        <div className="flex justify-center gap-2 mt-6">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              animate={{
                scale: i === index ? 1.2 : 1,
              }}
              className="rounded-full transition-colors duration-200"
              style={{
                width: i === index ? "28px" : "8px",
                height: "8px",
                background: answers[q.id]?.trim()
                  ? "#7c6ff7"
                  : i === index
                  ? "#a89cf8"
                  : "#2e2e3e",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function SubmitSpinner() {
  return (
    <svg
      className="animate-spin"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
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
