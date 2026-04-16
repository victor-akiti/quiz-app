/* eslint-disable @typescript-eslint/no-explicit-any */
// app/quiz/page.tsx
"use client";

import { useState } from "react";
import { questions } from "@/data/questions";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const router = useRouter();

  const q = questions[index];

  const handleSubmit = async () => {
    const name = localStorage.getItem("name");

    await addDoc(collection(db, "submissions"), {
      name,
      answers,
      score: 0,
      submittedAt: Date.now()
    });

    router.push("/leaderboard");
  };

  return (
    <div className="p-10">
      <h2>{q.text}</h2>

      {q.type === "mcq" &&
        q.options?.map((opt: string) => (
          <button
            key={opt}
            onClick={() => setAnswers({ ...answers, [q.id]: opt })}
            className="block border p-2 mt-2"
          >
            {opt}
          </button>
        ))}

      {q.type === "text" && (
        <input
          className="border p-2 mt-2"
          onChange={(e) =>
            setAnswers({ ...answers, [q.id]: e.target.value })
          }
        />
      )}

      <div className="mt-4">
        {index > 0 && (
          <button onClick={() => setIndex(index - 1)}>Back</button>
        )}
        {index < questions.length - 1 ? (
          <button onClick={() => setIndex(index + 1)}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
}
