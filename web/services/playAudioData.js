// this function will be replaced in the app by a native method
globalThis.playAudioData =
  globalThis.playAudioData ||
  (async (audioData, onEnded) => {
    try {
      const audio = new Audio(audioData);
      audio.onended = onEnded;
      await audio.play();
    } catch (ex) {
      onEnded?.();
      // throw ex;
    }
  });

const playAudioData = (...args) => globalThis.playAudioData(...args);

export default playAudioData;
