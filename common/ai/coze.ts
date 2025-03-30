import { NextApiRequest, NextApiResponse } from "next";

const {COZE_BOT_ID, COZE_BOT_CONFIG} = process.env
const default_bot_id = COZE_BOT_ID || "";
const botConfig = COZE_BOT_CONFIG ? JSON.parse(process.env.BOT_CONFIG) : {};

const decoder = new TextDecoder('utf-8');

function getToken(req: NextApiRequest){
  const auth = (req.headers["authorization"] || req.headers["Authorization"] || "") as string
  return auth.split(" ")[1]
}

async function request(req: NextApiRequest){
  const {messages, model} = req.body
    const chatHistory = []
    for (let i = 0; i < messages.length - 1; i++) {
      const message = messages[i]
      const role = message.role
      const content = message.content

      chatHistory.push({
        role: role,
        content: content,
        content_type: "text",
      })
    }
    const lastMessage = messages[messages.length - 1]
    const queryString = lastMessage.content
    const bot_id = model && botConfig[model] ? botConfig[model] : default_bot_id
    const requestBody = {
      query: queryString,
      stream: req.body.stream || false,
      conversation_id: "",
      user: "apiuser",
      bot_id: bot_id,
      chat_history: chatHistory,
    }
    const resp = await fetch("https://api.coze.com/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken(req)}`,
      },
      body: JSON.stringify(requestBody),
    })
    return resp
}
export async function chat(req: NextApiRequest, res: NextApiResponse) {
  if(!getToken(req)){
    return res.status(401).json({
      code: 401,
      errmsg: "Unauthorized.",
    })
  }
  try {
    const resp = await request(req)
    const {model} = req.body
    if (req.body.stream) {
      res.setHeader("Content-Type", "text/event-stream")
      let buffer = ""
      const reader = resp.body.getReader()
      reader.read().then(function read({ value, done }):void | Promise<void> {
        if (done) {
          return
        }
        buffer += decoder.decode(value)
        let lines = buffer.split("\n")

        for (let i = 0; i < lines.length - 1; i++) {
          let line = lines[i].trim()

          if (!line.startsWith("data:")) continue
          line = line.slice(5).trim()
          let chunkObj
          try {
            if (line.startsWith("{")) {
              chunkObj = JSON.parse(line)
            } else {
              continue
            }
          } catch (error) {
            console.error("Error parsing chunk:", error)
            continue
          }
          if (chunkObj.event === "message") {
            if (
              chunkObj.message.role === "assistant" &&
              chunkObj.message.type === "answer"
            ) {
              let chunkContent = chunkObj.message.content

              if (chunkContent !== "") {
                const chunkId = `chatcmpl-${Date.now()}`
                const chunkCreated = Math.floor(Date.now() / 1000)
                res.write(
                  "data: " +
                    JSON.stringify({
                      id: chunkId,
                      object: "chat.completion.chunk",
                      created: chunkCreated,
                      model,
                      choices: [
                        {
                          index: 0,
                          delta: {
                            content: chunkContent,
                          },
                          finish_reason: null,
                        },
                      ],
                    }) +
                    "\n\n"
                )
              }
            }
          } else if (chunkObj.event === "done") {
            const chunkId = `chatcmpl-${Date.now()}`
            const chunkCreated = Math.floor(Date.now() / 1000)
            res.write(
              "data: " +
                JSON.stringify({
                  id: chunkId,
                  object: "chat.completion.chunk",
                  created: chunkCreated,
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: {},
                      finish_reason: "stop",
                    },
                  ],
                }) +
                "\n\n"
            )
            res.write("data: [DONE]\n\n")
            res.end()
          } else if (chunkObj.event === "ping") {
          } else if (chunkObj.event === "error") {
            console.error(`Error: ${chunkObj.code}, ${chunkObj.message}`)
            res
              .status(500)
              .write(`data: ${JSON.stringify({ error: chunkObj.message })}\n\n`)
            res.write("data: [DONE]\n\n")
            res.end()
          }
        }

        buffer = lines[lines.length - 1]

        return reader.read().then(read)
      })
    } else {
      resp
        .json()
        .then(data => {
          if (data.code === 0 && data.msg === "success") {
            const messages = data.messages
            const answerMessage = messages.find(
              (message: any) =>
                message.role === "assistant" && message.type === "answer"
            )

            if (answerMessage) {
              const result = answerMessage.content.trim()
              const usageData = {
                prompt_tokens: 100,
                completion_tokens: 10,
                total_tokens: 110,
              }
              const chunkId = `chatcmpl-${Date.now()}`
              const chunkCreated = Math.floor(Date.now() / 1000)

              const formattedResponse = {
                id: chunkId,
                object: "chat.completion",
                created: chunkCreated,
                model,
                choices: [
                  {
                    index: 0,
                    message: {
                      role: "assistant",
                      content: result,
                    },
                    // @ts-ignore
                    logprobs: null,
                    finish_reason: "stop",
                  },
                ],
                usage: usageData,
                system_fingerprint: "fp_2f57f81c11",
              }
              const jsonResponse = JSON.stringify(formattedResponse, null, 2)
              res.setHeader("Content-Type", "application/json")
              res.send(jsonResponse)
            } else {
              res.status(500).json({ error: "No answer message found." })
            }
          } else {
            res
              .status(500)
              .json({ error: "Unexpected response from Coze API." })
          }
        })
        .catch(error => {
          console.error("Error parsing JSON:", error)
          res.status(500).json({ error: "Error parsing JSON response." })
        })
    }
  } catch (error) {
    console.error("Error:", error)
  }
}
