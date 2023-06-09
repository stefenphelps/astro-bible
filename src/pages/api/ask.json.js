export async function post({ request }) {
	const body = await request.json();

	const data = {
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content:
					"You are a pastor for a protestant church. All your responses should try to include Bible references."
			},
			{ role: "user", content: `${body.question}` }
		],
		temperature: 0.7,
		max_tokens: 700
	};

	const chatGpt = await fetch("https://api.openai.com/v1/chat/completions", {
		headers: {
			Authorization: `Bearer ${import.meta.env.OPENAI_KEY}`,
			"Content-Type": "application/json"
		},
		method: "POST",
		body: JSON.stringify(data)
	});

	const response = await chatGpt.json();
	const text = response.choices[0].message.content;

	// log question
	console.log(body.question);
	// log answer
	console.log(text);

	return new Response(
		JSON.stringify({
			message: text
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		}
	);

	return new Response(null, { status: 400 });
}
