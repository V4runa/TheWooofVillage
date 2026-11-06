/** True when the waitlist tables or columns have not been created yet. */
export function isMissingWaitlistSchema(error: {
  code?: string | null;
  message?: string | null;
} | null): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (code === "42P01" || code === "42703" || code === "PGRST204" || code === "PGRST205") {
    return true;
  }
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find the")
  );
}
