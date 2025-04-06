export interface RequestBody {
  additional_system_instructions: string
  temperature: number
  model: string
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

export interface TranslateParams {
  source: string
  q: string
  target: string
  format: string
}
