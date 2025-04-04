import {
  GenerateContentResult,
  GenerateContentStreamResult,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai"

const { API_KEY } = process.env

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8")

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

function send(body: RequestBody): Promise<GenerateContentResult>
function send(body: RequestBody, stream: boolean): Promise<GenerateContentStreamResult>
async function send(body: RequestBody, stream = false) {
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
  if(stream){
    return chat.sendMessageStream(msg)
  }
  return chat.sendMessage(msg)
}

export async function chat(body: RequestBody) {
  const res = await send(body)
  return res.response.text()
}

export async function chatStream(body: RequestBody){
  const res = await send(body, true)

  const readable = new ReadableStream({
    async start(controller) {
      for await(const data of res.stream){
        controller.enqueue(
          encoder.encode(`data: ${
            JSON.stringify({
              text: data.text()
            })
          }\n\n`)
        )  
      }
      controller.close()
    },
  })
  return readable
}
