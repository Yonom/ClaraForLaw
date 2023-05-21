export const aiReply = async (request) => {
  const query = await fetch("https://2ce7-68-65-169-185.ngrok-free.app/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return await query.json();
};
