import { ChatCompletion } from "groq-sdk/src/resources/chat/index.js"
import { RequestBody } from "../type.js"
import Groq from "groq-sdk"
import { ChatCompletionChunk } from "groq-sdk/lib/chat_completions_ext.mjs"
import { Stream } from "groq-sdk/lib/streaming.mjs"

const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8")

const { GROQ_API_KEY } = process.env

const DEFAULT_MODEL = "llama3-8b-8192"

const groq = new Groq({
  apiKey: GROQ_API_KEY,
})

function send(body: RequestBody): Promise<ChatCompletion>
function send(body: RequestBody, stream: boolean): Promise<Stream<ChatCompletionChunk>>
async function send(body: RequestBody, stream = false) {
  const msgs = []
  const { temperature = 0.5, model = DEFAULT_MODEL, messages } = body
  for (const message of messages) {
    if ("system_instructions" in message.content)
      msgs.push({
        role: "system",
        content: message.content.system_instructions,
      })

    if ("command_instructions" in message.content)
      msgs.push({
        role: "system",
        content: message.content.command_instructions,
      })

    if ("additional_system_instructions" in body)
      msgs.push({
        role: "system",
        content: body.additional_system_instructions,
      })

    if ("text" in message.content) {
      msgs.push({
        role: message.author === "user" ? "user" : "system",
        content: message.content.text,
      })
    }
  }

  return groq.chat.completions.create({
    messages: msgs,
    model,
    temperature,
    stream
  })
}

export async function chat(body: RequestBody){
  const res = await send(body)
  return res.choices[0].message.content
}

export async function chatStream(body: RequestBody){
  const res = await send(body, true)
  const reader = res.toReadableStream().getReader()

  const readable = new ReadableStream({
    async start(controller) {
      let finish = false
      while (!finish) {
        const { value, done } = await reader.read()
        if (done) {
          finish = true
          controller.close()
        } else {
          const { delta, finish_reason } = JSON.parse(decoder.decode(value)).choices[0]
          let data: { text?: string; finish_reason?: string } = {}
          if (delta.content !== undefined) {
            data.text = delta.content
          } else {
            data.text = ""
            data.finish_reason = finish_reason || "stop"
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        }
      }
      controller.close()
    },
  })
  return readable
}
