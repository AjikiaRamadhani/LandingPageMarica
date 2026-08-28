"use client";

import { useState } from "react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setResult("❌ Pilih file dulu");
      return;
    }

    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        // credentials: "same-origin" itu default fetch, cookie session otomatis kebawa
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`❌ Gagal (${res.status}): ${data.error}`);
      } else {
        setResult(`✅ Berhasil!\n\nURL: ${data.url}`);
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1>Test Upload Gambar</h1>
      <p style={{ fontSize: 13, color: "#666" }}>
        Pastikan kamu udah login sebagai ADMIN di tab browser ini (lewat /test-login),
        soalnya endpoint upload butuh session admin.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ display: "block", marginTop: 16 }}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ marginTop: 16, padding: "10px 20px", cursor: "pointer" }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            padding: 12,
            background: "#f4f4f4",
            whiteSpace: "pre-wrap",
            fontSize: 12,
            wordBreak: "break-all",
          }}
        >
          {result}
        </pre>
      )}

      {result.startsWith("✅") && (
        <img
          src={result.split("URL: ")[1]}
          alt="preview"
          style={{ marginTop: 16, maxWidth: "100%", borderRadius: 8 }}
        />
      )}
    </div>
  );
}