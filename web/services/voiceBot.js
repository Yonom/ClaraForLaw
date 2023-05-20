import { aiReply } from "./backend";
import { assemblyAiListener } from "./assemblyAi";
import axios from "axios";

const startSession = async () => {
  const { data } = await axios.post("http://localhost:8000/startSession");
  return data;
};

const voiceBot = ({ onAiReply, onInput }) => {
  let takePhotoCallback;
  const session = startSession();
  const recorder = assemblyAiListener({
    onInput,
    onInputComplete: async (input) => {
      const reply = await aiReply({
        sessionId: (await session).sessionId,
        text: input,
      });
      await onAiReply(reply);
      if (reply.takePhoto) {
        await new Promise((r) => {
          takePhotoCallback = async () => {
            const replyTask = onAiReply({
              text: "Uploading...",
            });

            // TODO upload the actual file in the future
            const reply = await aiReply({
              sessionId: (await session).sessionId,
              text: "<File>",
            });

            await replyTask;
            await new Promise((r) => setTimeout(r, 2000));
            await onAiReply({
              text: "Upload complete. Thank you. I need a moment to look over your documents. Please wait...",
            });
            await new Promise((r) => setTimeout(r, 6000));

            await onAiReply(reply);
            r();
          };
        });
      }
    },
  });
  return {
    startRecording: async () => {
      try {
        await onAiReply(await session);
      } finally {
        recorder.startRecording();
      }
    },
    onTakePhoto: () => {
      takePhotoCallback?.();
    },
  };
};

export default voiceBot;
