import type { NextApiRequest, NextApiResponse } from "next"
import { MODELS as models, DEFAULT_MODELS as default_models } from "../../common/config.js"

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    default_models,
    models,
  })
}
