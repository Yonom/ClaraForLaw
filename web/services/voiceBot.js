import { gptCompletion } from "./openAi";
import { assemblyAiListener } from "./assemblyAi";
import axios from "axios";

const getInitialPrompt = async () => {
  const { data } = await axios.get("http://localhost:8000/initialPrompt");
  return data.text;
};

const voiceBot = ({ onSpeak, onInput }) => {
  const recorder = assemblyAiListener({
    onInput,
    onInputComplete: async (input) => {
      const text = await gptCompletion({
        text: input,
      });
      await onSpeak(text);
    },
  });
  return {
    startRecording: async () => {
      try {
        await onSpeak(await getInitialPrompt());
      } finally {
        recorder.startRecording();
      }
    },
  };
};

export default voiceBot;
