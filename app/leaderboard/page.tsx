/* eslint-disable @typescript-eslint/no-explicit-any */
// app/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      orderBy("score", "desc")
    );

    return onSnapshot(q, (snap) => {
      setData(snap.docs.map((doc) => doc.data()));
    });
  }, []);

  return (
    <div className="p-10">
      <h1>Leaderboard</h1>
      {data.map((d, i) => (
        <div key={i}>
          {d.name} — {d.score}
        </div>
      ))}
    </div>
  );
}