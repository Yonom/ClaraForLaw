export const aiReply = async (request) => {
  const query = await fetch("https://dfb9-68-65-169-186.ngrok-free.app/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return await query.json();
};
