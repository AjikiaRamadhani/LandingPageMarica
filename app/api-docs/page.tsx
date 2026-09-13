"use client";

import { createElement, useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("swagger-ui-react").then(({ default: SwaggerUI }) => {
      if (cancelled || !mountRef.current) return;

      const root = createRoot(mountRef.current);
      rootRef.current = root;
      root.render(createElement(SwaggerUI, { url: "/api/swagger" }));
    });

    return () => {
      cancelled = true;
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  return (
    <div className="bg-white min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto rounded-lg shadow-sm border border-gray-100 overflow-hidden bg-white">
        <div ref={mountRef} />
      </div>
    </div>
  );
}
