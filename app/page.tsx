// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  return (
    <div className="p-10">
      <input
        placeholder="Enter your name"
        className="border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="ml-4 bg-black text-white px-4 py-2"
        onClick={() => {
          localStorage.setItem("name", name);
          router.push("/quiz");
        }}
      >
        Start Quiz
      </button>
    </div>
  );
}