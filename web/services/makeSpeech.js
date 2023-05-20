import axios from "axios";

export function makeSpeech(text) {
  return axios.post("/api/textToSpeech", { text });
}
