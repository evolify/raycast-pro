import type { NextApiRequest, NextApiResponse } from "next"
import { GEMINI_MODELS } from "common/config"

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    default_models: GEMINI_MODELS,
    models: GEMINI_MODELS
  })
}
