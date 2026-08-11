"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Use dynamic import with ssr: false since Swagger UI uses browser features
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocs() {
  return (
    <div className="bg-white min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto rounded-lg shadow-sm border border-gray-100 overflow-hidden bg-white">
        <SwaggerUI url="/api/swagger" />
      </div>
    </div>
  );
}
