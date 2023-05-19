import axios from "axios";

export function makeSpeech(lang, text) {
  return axios.post("/api/getSpeech", { lang, text });
}
