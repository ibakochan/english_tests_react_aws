export function safeParseJSON(input: any): Record<number, any> {
  if (!input) return {};

  // Already an object → return as-is
  if (typeof input === "object") return input;

  // Try to parse if string
  if (typeof input === "string") {
    try {
      const once = JSON.parse(input);

      // Case: once is another JSON string → parse again
      if (typeof once === "string") {
        return JSON.parse(once);
      }

      return once;
    } catch (err) {
      console.error("Invalid JSON:", input);
      return {};
    }
  }

  // Fallback
  return {};
}