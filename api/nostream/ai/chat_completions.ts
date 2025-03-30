import type { NextApiRequest, NextApiResponse } from "next"
import { chat } from "../../../common/ai/chat.js"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const text = await chat(req.body)
  res.send(
    `data: ${JSON.stringify({
      text
    })}`
  )
}
