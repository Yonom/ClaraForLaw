import { gptCompletion } from "./openAi";
import { assemblyAiListener } from "./assemblyAi";
import { canUseWebSpeech, webSpeechListener } from "./webSpeech";

export const languages = canUseWebSpeech
  ? {
      "en-US": "English",
      "de-DE": "German",
      "fr-FR": "French",
      "es-ES": "Spanish",
      "zh-CN": "Mandarin",
    }
  : { "en-US": "English" };

const initialPrompt = {
  "en-US": "Hello Edward, how are we feeling today?",
  "de-DE": "Ja guten tag auch lieber Edward. Wie geht es dir heute?",
  "fr-FR": "Bonjour Edward, comment nous sentons-nous aujourd'hui ?",
  "es-ES": "Hola Edward, ¿cómo nos sentimos hoy?",
  "zh-CN": "你好爱德华，我们今天感觉如何？",
};

export const getServicePrompt = (
  lang
) => `You are an assistant named Clara who is talking with Edward. 

Try to lift Edwards mood by having a conversation with him.
Answer in max 3 sentences and only in ${lang}.
Stay professional and warm.

During your conversation mention events in his life and ask question about these.
If Edward feels lonely or sad, ask him if he wants to listen to music.

About the assistant Clara: 
- 50 year old ranger in a national park
- Has a great sense of humor and likes to joke arround.
- A warm person and respectful

About Edward:
- Active and adventurous man who lived a fulfilling life devoted to his family, career, and hobbies
- married to Mathea for over 50 years, raised three successful children named Tom, Hans and Peter
- Had a loyal dog named Bobi
- Worked as a mechanical engineer for ABB, where he became a respected member of the team
- In retirement, he enjoyed hobbies like reading, chess, gardening, and walks in the park, where he exchanged stories with other retirees
- Despite being in his twilight years, Edward remained active and engaged, always eager to make new memories`;

const voiceBot = async ({
  messageOverride,
  promptOverride,
  lang,
  onSpeak,
  onInput,
}) => {
  const messages = [
    { role: "system", content: promptOverride || getServicePrompt(lang) },
    { role: "assistant", content: messageOverride || initialPrompt[lang] },
  ];
  const ttsEngine = lang === "en-US" ? assemblyAiListener : webSpeechListener;

  const recorder = await ttsEngine({
    lang,
    onInput,
    onInputComplete: async (input) => {
      messages.push({ role: "user", content: input.trim() });
      const text = await gptCompletion({
        language: languages[lang],
        messages,
      });
      messages.push({ role: "assistant", content: text.trim() });
      await onSpeak(text);
    },
  });
  try {
    await onSpeak(messages[1].content);
  } finally {
    recorder.startRecording();
  }
};

export default voiceBot;
