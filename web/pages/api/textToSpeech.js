const blendShapeNames = [
  "eyeBlinkLeft",
  "eyeLookDownLeft",
  "eyeLookInLeft",
  "eyeLookOutLeft",
  "eyeLookUpLeft",
  "eyeSquintLeft",
  "eyeWideLeft",
  "eyeBlinkRight",
  "eyeLookDownRight",
  "eyeLookInRight",
  "eyeLookOutRight",
  "eyeLookUpRight",
  "eyeSquintRight",
  "eyeWideRight",
  "jawForward",
  "jawLeft",
  "jawRight",
  "jawOpen",
  "mouthClose",
  "mouthFunnel",
  "mouthPucker",
  "mouthLeft",
  "mouthRight",
  "mouthSmileLeft",
  "mouthSmileRight",
  "mouthFrownLeft",
  "mouthFrownRight",
  "mouthDimpleLeft",
  "mouthDimpleRight",
  "mouthStretchLeft",
  "mouthStretchRight",
  "mouthRollLower",
  "mouthRollUpper",
  "mouthShrugLower",
  "mouthShrugUpper",
  "mouthPressLeft",
  "mouthPressRight",
  "mouthLowerDownLeft",
  "mouthLowerDownRight",
  "mouthUpperUpLeft",
  "mouthUpperUpRight",
  "browDownLeft",
  "browDownRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
  "cheekPuff",
  "cheekSquintLeft",
  "cheekSquintRight",
  "noseSneerLeft",
  "noseSneerRight",
  "tongueOut",
  "headRoll",
  "leftEyeRoll",
  "rightEyeRoll",
];

import * as sdk from "microsoft-cognitiveservices-speech-sdk";

let SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
<voice name="__VOICE__">
  <mstts:viseme type="FacialExpression"/>
  __TEXT__
</voice>
</speak>`;

const key = process.env.AZURE_API_KEY;
const region = process.env.AZURE_REGION;

const textToSpeech = async (text) => {
  // convert callback function to promise
  return new Promise((resolve, reject) => {
    let ssml = SSML.replace("__VOICE__", "en-US-JennyNeural").replace(
      "__TEXT__",
      text
    );

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisOutputFormat = 5; // mp3

    const outputStream = sdk.AudioOutputStream.createPullStream();
    const audioConfig = sdk.AudioConfig.fromStreamOutput(outputStream);

    const blendData = [];
    const timeStep = 1 / 60;
    let timeStamp = 0;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Subscribes to viseme received event
    synthesizer.visemeReceived = function (s, e) {
      // `Animation` is an xml string for SVG or a json string for blend shapes
      var animation = JSON.parse(e.animation);

      animation.BlendShapes.forEach((blendArray) => {
        let blend = {};
        blendShapeNames.forEach((shapeName, i) => {
          blend[shapeName] = blendArray[i];
        });

        blendData.push({
          time: timeStamp,
          blendshapes: blend,
        });
        timeStamp += timeStep;
      });
    };

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        const { audioData } = result;
        const buffer = Buffer.from(audioData);
        const base64data = buffer.toString("base64");

        outputStream.close();
        synthesizer.close();

        resolve({
          blendData,
          audioData: "data:audio/mp3;base64," + base64data,
        });
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

const handler = async (req, res) => {
  const { text } = req.body;
  const api = await textToSpeech(text);
  res.json(api);
};

export default handler;
