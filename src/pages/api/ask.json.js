export async function post({ request }) {
	const body = await request.json();

	const data = {
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: `${body.question} - respond only using Bible verses.` }]
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
