export type QuizStatus = "draft" | "published" | "locked";

export interface McqQuestion {
  id: string;
  text: string;
  type: "mcq";
  options: string[];
  correctAnswer: string;
}

export interface TextQuestion {
  id: string;
  text: string;
  type: "text";
}

export type Question = McqQuestion | TextQuestion;

export interface QuizBlock {
  id: string;
  title: string;
  description: string;
  category?: string;
  status: QuizStatus;
  questions: Question[];
  createdAt: number;
}

export interface Submission {
  id: string;
  quizId: string;
  name: string;
  answers: Record<string, string>;
  score: number;
  deviceToken: string;
  submittedAt: number;
}
