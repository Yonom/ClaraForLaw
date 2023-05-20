export const gptCompletion = async (request) => {
  const query = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const { text } = await query.json();
  return text;
};
