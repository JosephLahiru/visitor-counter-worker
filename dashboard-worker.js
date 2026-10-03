const COUNTER_ID = "profile";
const INITIAL_COUNT = 11111;
const DIGIT_COUNT = 7;
const DIGIT_WIDTH = 40;
const DIGIT_HEIGHT = 40;
const DIGIT_GAP = 3;
const SVG_WIDTH =
  DIGIT_COUNT * DIGIT_WIDTH + (DIGIT_COUNT - 1) * DIGIT_GAP;

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
};

export function renderCounterSvg(value) {
  const count = Math.max(0, Math.trunc(Number(value) || 0));
  const digits = String(count).padStart(DIGIT_COUNT, "0").slice(-DIGIT_COUNT);

  const tiles = [...digits]
    .map((digit, index) => {
      const x = index * (DIGIT_WIDTH + DIGIT_GAP);
      const centerX = x + DIGIT_WIDTH / 2;

      return (
        `<rect x="${x}" y="0" width="${DIGIT_WIDTH}" height="${DIGIT_HEIGHT}" fill="#000"/>` +
        `<text x="${centerX}" y="29" text-anchor="middle" fill="#00ff00" ` +
        `font-family="Consolas, Monaco, 'Liberation Mono', monospace" ` +
        `font-size="28" font-weight="400">${digit}</text>`
      );
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${DIGIT_HEIGHT}" ` +
    `viewBox="0 0 ${SVG_WIDTH} ${DIGIT_HEIGHT}" role="img" aria-label="Visitor count: ${count}">` +
    `<title>Visitor count: ${count}</title>${tiles}</svg>`
  );
}

function svgResponse(count, extraHeaders = {}) {
  return new Response(renderCounterSvg(count), {
    headers: { ...SVG_HEADERS, ...extraHeaders },
  });
}

async function incrementCounter(db) {
  const row = await db
    .prepare(
      `UPDATE counters
       SET count = count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       RETURNING count`,
    )
    .bind(COUNTER_ID)
    .first();

  if (!row) {
    throw new Error("Counter row is missing");
  }

  return Number(row.count);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/count.svg") {
      try {
        return svgResponse(await incrementCounter(env.DB));
      } catch (error) {
        console.error("Failed to increment visitor counter", error);
        return svgResponse(INITIAL_COUNT, { "X-Counter-Status": "fallback" });
      }
    }

    if (request.method === "HEAD" && url.pathname === "/count.svg") {
      return new Response(null, { headers: SVG_HEADERS });
    }

    if (request.method === "GET" && url.pathname === "/preview.svg") {
      const requestedCount = Number(
        url.searchParams.get("count") ?? INITIAL_COUNT,
      );
      const count = Number.isSafeInteger(requestedCount)
        ? Math.max(0, requestedCount)
        : INITIAL_COUNT;
      return svgResponse(count);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    return new Response(
      "Visitor counter is running. Use /preview.svg or /count.svg.",
      { status: 200 },
    );
  },
};
