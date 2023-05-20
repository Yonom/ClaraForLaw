import voiceBot from "@/services/voiceBot";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

import Scene from "../components/Scene";
import playAudioData from "../services/playAudioData";
import { makeSpeech } from "../services/makeSpeech";

export default function Home() {
  const [subtitle, setSubtitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [blendData, setBlendData] = useState();

  const [started, setStarted] = useState(false);
  const [recorder] = useState(() =>
    typeof window === "undefined"
      ? null
      : voiceBot({
          onInput: (t) => setUserInput(t),
          onSpeak: async (t) => {
            setUserInput("");
            setSubtitle(t);

            if (t) {
              await new Promise(async (resolve) => {
                const response = await makeSpeech(t);
                const { blendData, audioData } = response.data;

                if (blendData.length) {
                  setBlendData(blendData);
                }

                if (audioData) {
                  await playAudioData(audioData, resolve);
                } else {
                  resolve();
                }
              });
            }
          },
        })
  );
  const start = async () => {
    setStarted(true);
    recorder.startRecording();
  };

  const { progress } = useProgress();

  return (
    <>
      <Head>
        <title>LLM x Law Hackathon</title>
      </Head>
      <main>
        <Scene blendData={blendData} />

        {!!subtitle && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              textAlign: "center",
              fontSize: 40,
              color: userInput ? "blue" : "black",
              backgroundColor: "#fffa",
              padding: 10,
            }}
          >
            {userInput || subtitle}
          </div>
        )}
        {!started && progress === 100 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000d",
              color: "white",
              fontSize: 24,
            }}
          >
            <p>Press start to begin</p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  padding: 10,
                  cursor: "pointer",
                  backgroundColor: "#fff3",
                  marginLeft: 5,
                  marginRight: 5,
                  marginBottom: 10,
                }}
                onClick={start}
              >
                Start
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
