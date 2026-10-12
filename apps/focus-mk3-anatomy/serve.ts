// Zero-dependency static server for the built site.
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "dist");
const port = Number(process.env.PORT ?? 4321);

Bun.serve({
  port,
  async fetch(req) {
    const path = normalize(decodeURIComponent(new URL(req.url).pathname)).replace(/^(\.\.[/\\])+/, "");
    const file = Bun.file(join(root, path === "/" ? "index.html" : path));
    return (await file.exists()) ? new Response(file) : new Response("Not found", { status: 404 });
  },
});
console.log(`focus-mk3-anatomy on http://localhost:${port}`);
