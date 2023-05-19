const SpeechRecognition =
  globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

const webSpeech = ({ lang, onMessage }) => {
  return {
    startRecording: () => {
      return new Promise(() => {
        const recognition = new SpeechRecognition();

        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const result = event.results[0];
          const hasUnfinalizedChanges = !result.isFinal;
          const transcript = result[0].transcript;
          onMessage(transcript, hasUnfinalizedChanges);
        };
        recognition.onspeechend = () => {
          recognition.stop();
        };

        recognition.start();
      });
    },
  };
};

export const webSpeechListener = async ({ lang, onInput, onInputComplete }) => {
  const recorder = webSpeech({
    lang,
    onMessage: async (message, hasUnfinalizedChanges) => {
      onInput(message);

      if (!hasUnfinalizedChanges) {
        try {
          await onInputComplete(message);
        } finally {
          recorder.startRecording();
        }
      }
    },
  });
  return recorder;
};

export const canUseWebSpeech = !!SpeechRecognition;

export default webSpeech;
