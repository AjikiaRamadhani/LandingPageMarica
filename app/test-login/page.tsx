"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function TestLoginPage() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Password123!");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setResult("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setResult(`❌ Gagal login: ${res.error}`);
    } else if (res?.ok) {
      // Cek session yang baru kebentuk
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      setResult(`✅ Login berhasil!\n\nSession:\n${JSON.stringify(session, null, 2)}`);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
    setResult("👋 Logout berhasil");
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1>Test Login (Credentials)</h1>

      <div style={{ marginTop: 16 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}
      >
        {loading ? "Loading..." : "Login"}
      </button>

      <button
        onClick={handleLogout}
        style={{ marginTop: 20, marginLeft: 8, padding: "10px 20px", cursor: "pointer" }}
      >
        Logout
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            padding: 12,
            background: "#f4f4f4",
            whiteSpace: "pre-wrap",
            fontSize: 12,
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}