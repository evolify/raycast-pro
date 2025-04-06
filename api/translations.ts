import type { NextApiRequest, NextApiResponse } from "next"
import { translate } from "../common/ai/chat.js"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const text = await translate(req.body)
  res.status(200).json({
    data: {
      translations: [{
        translatedText: text
      }]
    }
  })
}
