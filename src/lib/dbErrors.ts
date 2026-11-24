/** True when a Supabase error means the table hasn't been migrated yet. */
export function isMissingTable(message: string, table: string): boolean {
  return (
    message.includes(table) &&
    (message.includes("does not exist") ||
      message.includes("Could not find the table"))
  );
}
