import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai"

const { API_KEY } = process.env

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

interface RequestBody {
  additional_system_instructions: string
  temperature: number
  messages: Array<{
    content: {
      system_instructions: string
      command_instructions: string
      text: string
      temperature: number
      [key: string]: string | number
    }
    author: "user" | "assistant"
  }>
}

export async function chat(body: RequestBody) {
  let system_message = ""
  const google_message = []
  let temperature = 0.5
  const messages = body.messages
  for (const message of messages) {
    if ("system_instructions" in message.content)
      system_message += `${message.content.system_instructions}\n`

    if ("command_instructions" in message.content)
      system_message += `${message.content.command_instructions}\n`

    if ("additional_system_instructions" in body)
      system_message += `${body.additional_system_instructions}\n`

    if ("text" in message.content) {
      google_message.push({
        role: message.author === "user" ? "user" : "model",
        parts: message.content.text,
      })
    }
    if ("temperature" in message.content)
      temperature = message.content.temperature
  }

  let msg = google_message.pop()?.parts || ""
  if (!(google_message.length > 0)) {
    // if there is no message, and it's the first message
    msg = `${system_message}\n${msg}`
  } else {
    // if there is a message, and it's not the first message
    google_message[0].parts = `${system_message}\n\n${google_message[0].parts}`
  }
  // const result = await model.generateContentStream(system_message)
  const chat = model.startChat({
    history: google_message,
    generationConfig: {
      temperature,
      maxOutputTokens: undefined,
      candidateCount: 1,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  })
  return await chat.sendMessageStream(msg)
}
