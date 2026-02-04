export async function POST({ request }) {
  try {
    const body = await request.json();

    const data = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a pastor for a protestant church. All your responses should try to include Bible references.",
        },
        { role: "user", content: `${body.question}` },
      ],
      temperature: 0.7,
      max_tokens: 700,
      stream: true,
    };

    const chatGpt = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${import.meta.env.OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!chatGpt.ok) {
      const errorBody = await chatGpt.text();
      throw new Error(`OpenAI API error (${chatGpt.status}): ${errorBody}`);
    }

    if (!chatGpt.body) {
      throw new Error("OpenAI API returned an empty response body");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = chatGpt.body.getReader();
        let buffer = "";
        let closed = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) {
                continue;
              }

              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") {
                closed = true;
                controller.close();
                return;
              }

              try {
                const chunk = JSON.parse(payload);
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
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
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
