import { aiReply } from "./backend";
import { assemblyAiListener } from "./assemblyAi";
import axios from "axios";

const startSession = async () => {
  const { data } = await axios.post("https://2ce7-68-65-169-185.ngrok-free.app/startSession");
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

      if (reply.isEnd) {
        await new Promise(() => {});
      }
      if (reply.takePhoto) {
        await new Promise((r) => {
          takePhotoCallback = async () => {
            // TODO upload the actual file in the future
            const replyTask = aiReply({
              sessionId: (await session).sessionId,
              text: "<File>",
            });

            await onAiReply({
              text: "Uploading...",
            });

            await onAiReply({
              text: "Thank you. I need a moment to look over your documents.",
            });

            await onAiReply(await replyTask);
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
