import voiceBot from "@/services/voiceBot";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

import Scene from "../components/Scene";
import playAudioData from "../services/playAudioData";
import { makeSpeech } from "../services/makeSpeech";

export default function Home() {
  const [takePhoto, setTakePhoto] = useState(false);
  const [showDIY, setShowDIY] = useState(false);
  const [showLegalHelp, setShowLegalHelp] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [blendData, setBlendData] = useState();

  const [started, setStarted] = useState(false);

  const recorderRef = useRef();
  useEffect(() => {
    if (recorderRef.current) return;
    recorderRef.current = voiceBot({
      onInput: (t) => setUserInput(t),
      onAiReply: async ({ text: t, takePhoto, showDIY, showLegalHelp }) => {
        setUserInput("");
        setSubtitle(t);
        setTakePhoto(takePhoto);
        setShowDIY(showDIY);
        setShowLegalHelp(showLegalHelp);

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
    });
  }, []);

  const handleTakePhoto = () => {
    recorderRef.current.onTakePhoto();
  };

  const start = async () => {
    setStarted(true);
    recorderRef.current.startRecording();
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
              fontSize: 22,
              color: userInput ? "blue" : "black",
              backgroundColor: "#fffa",
              padding: 10,
            }}
          >
            {userInput || subtitle}
          </div>
        )}

        {showLegalHelp && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
            }}
          >
            <div
              style={{
                backgroundColor: "#000d",
                padding: 25,
              }}
            >
              <a
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  padding: 10,
                  cursor: "pointer",
                  backgroundColor: "#fff3",
                }}
                href="https://evictiondefense.org/"
              >
                Visit evictiondefense.org
              </a>
              
            </div>
          </div>
        )}

        {showDIY && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
            }}
          >
            <div
              style={{
                backgroundColor: "#000d",
                padding: 25,
                textAlign:"center"
              }}
            >
              <a
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  padding: 10,
                  cursor: "pointer",
                  backgroundColor: "#fff3",
                }}
                href="/docs/UD105.pdf"
                target="_blank"
              >
                Download documents
              </a>
              <br />
              <br />
              <a
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  padding: 10,
                  cursor: "pointer",
                  backgroundColor: "#fff3",
                }}
                href="https://selfhelp.courts.ca.gov/eviction-tenant"
                target="_blank"
              >
                View Instructions
              </a>
            </div>
          </div>
        )}
        {takePhoto && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
            }}
          >
            <div
              style={{
                backgroundColor: "#000d",
                padding: 25,
              }}
            >
              <input
                type="file"
                id="img"
                name="img"
                accept="image/*"
                hidden
                onChange={handleTakePhoto}
              ></input>
              <label
                style={{
                  padding: 10,
                  cursor: "pointer",
                  backgroundColor: "#fff3",
                }}
                htmlFor="img"
              >
                Take photo
              </label>
            </div>
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
