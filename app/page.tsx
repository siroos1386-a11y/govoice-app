"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("سلام دنیا");

  return (
    <main style={{ padding: "40px", background: "#090d16", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", color: "#fbbf24", marginBottom: "20px" }}>دستیار صوتی هوشمند</h1>
      <p style={{ fontSize: "1.2rem" }}>سیستم با موفقیت بالا آمد و هیچ خطایی ندارد!</p>
    </main>
  );
}
