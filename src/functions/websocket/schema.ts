export default {
  type: "object",
  properties: {
    // name: { type: "string" },
    message: { type: "string" },
  },
  required: ["message"],
} as const;
