export const getApiDocs = () => {
  return {
    openapi: "3.0.0",
    info: {
      title: "Marica Landing Page API",
      version: "1.0.0",
      description: "API documentation for the Marica Landing Page",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        description: "API Server",
      },
    ],
    paths: {
      "/api/benefits": {
        get: {
          summary: "Get benefits list",
          description: "Returns a list of benefits.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of benefits",
            },
          },
        },
      },
      "/api/company": {
        get: {
          summary: "Get company profile",
          description: "Returns the company profile data.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "Company profile object",
            },
            "404": {
              description: "Company profile not found",
            }
          },
        },
      },
      "/api/faqs": {
        get: {
          summary: "Get FAQs",
          description: "Returns a list of frequently asked questions.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of FAQs",
            },
          },
        },
      },
      "/api/hero": {
        get: {
          summary: "Get hero section data",
          description: "Returns the hero section data including headline, subheadline, and badges.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "Hero section data",
            },
          },
        },
      },
      "/api/how-it-works": {
        get: {
          summary: "Get how it works steps",
          description: "Returns a list of steps for how it works.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of steps",
            },
          },
        },
      },
      "/api/pain-points": {
        get: {
          summary: "Get pain points",
          description: "Returns a list of pain points.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of pain points",
            },
          },
        },
      },
      "/api/solutions": {
        get: {
          summary: "Get solutions",
          description: "Returns a list of solutions.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of solutions",
            },
          },
        },
      },
      "/api/statistics": {
        get: {
          summary: "Get statistics",
          description: "Returns a list of statistics for the hero section.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of statistics",
            },
          },
        },
      },
      "/api/testimonials": {
        get: {
          summary: "Get testimonials",
          description: "Returns a list of testimonials.",
          tags: ["Content"],
          responses: {
            "200": {
              description: "A list of testimonials",
            },
          },
        },
      },
    },
  };
};
