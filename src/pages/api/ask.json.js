import {
  defaultPastorDenominationId,
  pastorDenominations,
} from "../../content/pastorDenominations.js";

const DEFAULT_MODEL = "gpt-5-nano";
const MAX_QUESTION_CHARS = 2000;
const denominationPromptById = new Map(
  pastorDenominations.map((denomination) => [denomination.id, denomination.prompt])
);

function getSystemPrompt(denominationId) {
  return (
    denominationPromptById.get(denominationId) ||
    denominationPromptById.get(defaultPastorDenominationId) ||
    "You are a Christian pastor. Include Bible references in your responses."
  );
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function getQuestion(input) {
  const question = input?.question;
  if (typeof question !== "string") {
    return null;
  }

  const trimmed = question.trim();
  if (!trimmed || trimmed.length > MAX_QUESTION_CHARS) {
    return null;
  }

  return trimmed;
}

function getDenominationId(input) {
  const denomination = input?.denomination;
  if (typeof denomination !== "string") {
    return defaultPastorDenominationId;
  }

  const normalized = denomination.trim().toLowerCase();
  return denominationPromptById.has(normalized)
    ? normalized
    : defaultPastorDenominationId;
}

export async function POST({ request }) {
  const apiKey = import.meta.env.OPENAI_API_KEY || import.meta.env.OPENAI_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "OpenAI API key is not configured." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const question = getQuestion(payload);
  if (!question) {
    return jsonResponse(
      {
        error: `Please provide a non-empty question up to ${MAX_QUESTION_CHARS} characters.`,
      },
      400
    );
  }

  const denominationId = getDenominationId(payload);

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: import.meta.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: getSystemPrompt(denominationId) }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: question }],
          },
        ],
        reasoning: {
          effort: "minimal",
        },
        max_output_tokens: 700,
        stream: true,
      }),
      signal: request.signal,
    });

    if (!openaiResponse.ok) {
      const requestId = openaiResponse.headers.get("x-request-id");
      const errorBody = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, requestId, errorBody);

      return jsonResponse(
        {
          error: "Failed to generate a response.",
          requestId: requestId || undefined,
        },
        openaiResponse.status >= 500 ? 502 : openaiResponse.status
      );
    }

    if (!openaiResponse.body) {
      return jsonResponse({ error: "OpenAI API returned an empty response body." }, 502);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body.getReader();
        let buffer = "";
        let closed = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n\n");
            buffer = events.pop() || "";

            for (const event of events) {
              const dataLines = event
                .split("\n")
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.slice(5).trimStart());

              if (!dataLines.length) {
                continue;
              }

              const data = dataLines.join("\n").trim();
              if (!data) {
                continue;
              }

              if (data === "[DONE]") {
                closed = true;
                controller.close();
                return;
              }

              try {
                const chunk = JSON.parse(data);
                if (chunk.type === "response.output_text.delta" && chunk.delta) {
                  controller.enqueue(encoder.encode(chunk.delta));
                }
              } catch (error) {
                console.error("Failed to parse OpenAI stream chunk:", error);
              }
            }
          }
        } finally {
          reader.releaseLock();
          if (!closed) {
            controller.close();
          }
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return jsonResponse({ error: "Internal server error." }, 500);
  }
}
