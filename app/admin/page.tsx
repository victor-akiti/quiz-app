/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Admin() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, "submissions"), (snap) => {
      setSubs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="p-10">
      <h1>Admin Panel</h1>

      {subs.map((s) => (
        <div key={s.id} className="border p-4 mt-4">
          <h2>{s.name}</h2>
          <pre>{JSON.stringify(s.answers, null, 2)}</pre>
          <p>Score: {s.score}</p>
        </div>
      ))}
    </div>
  );
}