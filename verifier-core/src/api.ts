import http from "http";
import { MarketVerifyRequestSchema, classifyMarketFeed, MarketFeedSchema } from "./market";
import { isVerifierError } from "./errors";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

function sendJson(response: http.ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function handleVerifyMarket(request: http.IncomingMessage, response: http.ServerResponse) {
  try {
    const chunks: Uint8Array[] = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks).toString("utf8");
    const data = rawBody.length > 0 ? JSON.parse(rawBody) : {};
    const body = MarketVerifyRequestSchema.parse(data);

    let feed = body.feed;
    if (!feed && body.url) {
      const fetched = await fetchJson(body.url);
      feed = MarketFeedSchema.parse(fetched);
    }

    if (!feed) {
      return sendJson(response, 400, {
        error: "Missing feed body or url"
      });
    }

    const classification = classifyMarketFeed(feed);
    return sendJson(response, 200, classification);
  } catch (error) {
    if (isVerifierError(error)) {
      return sendJson(response, 400, {
        error: error.message,
        code: error.code,
        context: error.context ?? null
      });
    }

    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

const server = http.createServer(async (request, response) => {
  if (!request.url || !request.method) {
    return sendJson(response, 400, { error: "Invalid request" });
  }

  if (request.url === "/health" && request.method === "GET") {
    return sendJson(response, 200, { status: "ok", service: "market-verifier" });
  }

  if (request.url === "/verify-market" && request.method === "POST") {
    return handleVerifyMarket(request, response);
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`📡 Market verifier API listening on http://localhost:${PORT}`);
});
