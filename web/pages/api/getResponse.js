export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  const { messages } = await req.json();

  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
};

export default handler;
