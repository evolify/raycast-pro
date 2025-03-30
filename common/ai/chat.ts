import { GEMINI_MODELS } from "../config.js"
import { RequestBody } from "../type.js"
import * as gemini from "./gemini.js"
import * as groq from "./groq.js"

export function chat(body: RequestBody){
  const { model = "llama3-8b-8192"} = body
  if(GEMINI_MODELS.find(t=>t.id === model)){
    return gemini.chat(body)
  }
  return groq.chat(body)
}

export function chatStream(body: RequestBody){
  const { model = "llama3-8b-8192"} = body
  if(GEMINI_MODELS.find(t=>t.id === model)){
    return gemini.chatStream(body)
  }
  return groq.chatStream(body)
}
