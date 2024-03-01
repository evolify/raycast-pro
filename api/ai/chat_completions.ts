import type { NextApiRequest, NextApiResponse } from "next"
import { chat } from "../../common/ai/gemini.js"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache,no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked')

  const result = await chat(req.body)
  for await (const data of result.stream) {
    console.log(data.text())
    res.write(`data: ${JSON.stringify({
        text: data.text()
      })}\n`)
  }
  res.write(`data: ${JSON.stringify({
      text: '',
      finish_reason: 'stop',
    })}\n`)

  // res.write("event: end")

  res.end()
}
