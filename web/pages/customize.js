import { getServicePrompt } from "@/services/voiceBot";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Customize() {
  const [message, setMessage] = useState(
    "Hello Edward, how are we feeling today?"
  );
  const [prompt, setPrompt] = useState(getServicePrompt("English"));

  const router = useRouter();

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleOk = () => {
    router.push(
      "/?lang=en-US&message=" +
        encodeURIComponent(message) +
        "&prompt=" +
        encodeURIComponent(prompt)
    );
  };

  return (
    <>
      <Head>
        <title>New Bets Customizer</title>
      </Head>
      <main style={{ margin: 32 }}>
        <h2>Prompt customizer</h2>

        <h3>Initial Message</h3>
        <textarea
          cols="150"
          rows="1"
          value={message}
          onChange={handleMessageChange}
        />

        <h3>System Prompt</h3>

        <textarea
          cols="150"
          rows="24"
          value={prompt}
          onChange={handlePromptChange}
        />
        <br />
        <br />
        <button onClick={handleOk}>Customize</button>
      </main>
    </>
  );
}
