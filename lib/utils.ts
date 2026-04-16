/** Get or create a persistent anonymous device token stored in localStorage. */
export function getOrCreateToken(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("quizDeviceToken");
  if (stored) return stored;
  const fresh = crypto.randomUUID();
  localStorage.setItem("quizDeviceToken", fresh);
  return fresh;
}

/** Per-quiz localStorage helpers. */
export const quizStorage = {
  isSubmitted: (quizId: string) =>
    typeof window !== "undefined" &&
    localStorage.getItem(`quiz_${quizId}_submitted`) === "true",

  getName: (quizId: string) =>
    typeof window !== "undefined"
      ? (localStorage.getItem(`quiz_${quizId}_name`) ?? "")
      : "",

  getScore: (quizId: string) =>
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem(`quiz_${quizId}_score`) ?? "0", 10)
      : 0,

  save: (quizId: string, name: string, score: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`quiz_${quizId}_submitted`, "true");
    localStorage.setItem(`quiz_${quizId}_name`, name);
    localStorage.setItem(`quiz_${quizId}_score`, String(score));
  },

  clear: (quizId: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`quiz_${quizId}_submitted`);
    localStorage.removeItem(`quiz_${quizId}_name`);
    localStorage.removeItem(`quiz_${quizId}_score`);
  },
};
