import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    // Excludes nested git worktrees (e.g. background-task checkouts under
    // .claude/worktrees) so their copies of the test suite aren't double-run.
    exclude: ["**/node_modules/**", "**/.claude/**"],
  },
});
