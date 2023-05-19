let hasShownPlaybackError = false;
// this function will be replaced in the app by a native method
globalThis.playAudioData =
  globalThis.playAudioData ||
  (async (audioData, onEnded) => {
    try {
      const audio = new Audio(audioData);
      audio.onended = onEnded;
      await audio.play();
    } catch (ex) {
      if (!hasShownPlaybackError) {
        hasShownPlaybackError = true;
        alert(
          "There was a problem with audio playback. The avatar will not speak. There are known issues on iOS Safari. Please try on another browser or device."
        );
      }
      onEnded?.();
      throw ex;
    }
  });

const playAudioData = (...args) => globalThis.playAudioData(...args);

export default playAudioData;
