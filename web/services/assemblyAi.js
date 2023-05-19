const assemblyAi = async ({ onMessage }) => {
  const response = await fetch("/api/getToken");
  const data = await response.json();

  if (data.error) {
    alert(data.error);
  }

  const { token } = data;
  const socket = new WebSocket(
    `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&language_code=de_DE&token=${token}`
  );

  // handle incoming messages to display transcription to the DOM
  const texts = {};
  socket.onmessage = (message) => {
    let msg = "";
    const res = JSON.parse(message.data);

    texts[res.audio_start] = res.text;

    const keys = Object.keys(texts);
    keys.sort((a, b) => a - b);
    for (const key of keys) {
      if (texts[key]) {
        msg += ` ${texts[key]}`;
      }
    }

    const hasUnfinalizedChanges =
      res.message_type !== "FinalTranscript" && !!res.text;
    onMessage(msg, hasUnfinalizedChanges);
  };

  socket.onerror = (event) => {
    console.error(event);
    socket.close();
  };

  return new Promise((resolve, err) => {
    socket.onopen = () => {
      // once socket is open, begin recording
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          let paused = false;
          const recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 250, // set 250 ms intervals of data that sends to AAI
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // real-time requires only one channel
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob) => {
              if (paused) return;

              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;

                // audio data must be sent as a base64 encoded string
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      audio_data: base64data.split("base64,")[1],
                    })
                  );
                }
              };
              reader.readAsDataURL(blob);
            },
          });

          resolve({
            startRecording: () => {
              recorder.startRecording();
            },
            pauseRecording: () => {
              paused = true;
            },
            resumeRecording: () => {
              paused = false;
            },
          });
        })
        .catch(err);
    };
  });
};

const messageRepetitionThreshold = 500;

export const assemblyAiListener = async ({ onInput, onInputComplete }) => {
  let prevMessage = "";
  let prevMessageSince = new Date();
  let isBusy = false;
  let ignoreAmount = 0;
  const recorder = await assemblyAi({
    onMessage: async (message, hasUnfinalizedChanges) => {
      if (isBusy) return;

      message = message.slice(ignoreAmount);
      onInput(message);

      if (message != prevMessage || hasUnfinalizedChanges) {
        prevMessage = message;
        prevMessageSince = new Date();
      }

      if (
        !!message &&
        new Date().getTime() - prevMessageSince.getTime() >
          messageRepetitionThreshold
      ) {
        ignoreAmount += message.length;
        recorder.pauseRecording();
        isBusy = true;
        try {
          await onInputComplete(message);
        } finally {
          recorder.resumeRecording();
          isBusy = false;
        }
      }
    },
  });
  return recorder;
};

export default assemblyAi;
