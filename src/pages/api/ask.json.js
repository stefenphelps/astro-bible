export async function POST({ request }) {
  try {
    const body = await request.json();

    const data = {
      model: "gpt-3.5-turbo",
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
    };

    const chatGpt = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${import.meta.env.OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    const response = await chatGpt.json();
    console.log("OpenAI API response:", response);

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from OpenAI API");
    }

    const text = response.choices[0].message.content;

    // log question
    console.log(body.question);
    // log answer
    console.log(text);

    return new Response(
      JSON.stringify({
        message: text,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
