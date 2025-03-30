import { chatStream } from "../../common/ai/chat.js"

export async function POST(req: Request) {
  const readable = await chatStream(await req.json())
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    },
  })
}

export const config = {
  runtime: "edge",
  regions: ["iad1", "sin1"],
}
