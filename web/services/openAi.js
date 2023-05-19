export const gptCompletion = async (request) => {
  const query = await fetch("/api/getResponse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const {
    choices: [
      {
        message: { content },
      },
    ] = [{ message: { content: "" } }],
  } = await query.json();
  return content;
};
