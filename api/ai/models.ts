import type { NextApiRequest, NextApiResponse } from "next"
import { DEFAULT_GEMINI_MODELS, GEMINI_MODELS } from "../../common/config.js"

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  console.log("--- get models from vercel ---")
  res.status(200).json({
    default_models: DEFAULT_GEMINI_MODELS,
    models: GEMINI_MODELS
  })
}
