export type Question =
  | {
      id: string;
      text: string;
      type: "mcq";
      options: string[];
      correctAnswer: string;
    }
  | {
      id: string;
      text: string;
      type: "text";
    };

export const questions: Question[] = [
  {
    id: "q1",
    text: "Which of the following is the correct way to declare a variable in TypeScript?",
    type: "mcq",
    options: [
      "var x: number = 5",
      "let x = 5 as number",
      "const x: number = 5",
      "Both A and C",
    ],
    correctAnswer: "Both A and C",
  },
  {
    id: "q2",
    text: "What does the 'use client' directive do in Next.js App Router?",
    type: "mcq",
    options: [
      "Marks a component as server-side only",
      "Enables client-side interactivity and browser APIs",
      "Disables server-side rendering",
      "Loads the component lazily on the client",
    ],
    correctAnswer: "Enables client-side interactivity and browser APIs",
  },
  {
    id: "q3",
    text: "In your own words, describe what makes React's virtual DOM efficient compared to direct DOM manipulation.",
    type: "text",
  },
];
