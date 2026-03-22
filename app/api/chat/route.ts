import { createOpenAI } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { systemPrompt } from '@/src/lib/ai/system-prompt';
import { tools } from '@/src/lib/ai/tools';

export const runtime = 'nodejs';

const openrouter = createOpenAI({
  name: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
    'X-Title': 'Vercel AI SDK Demo',
  },
});

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      {
        error:
          'Missing OPENROUTER_API_KEY. Add it to .env.local before starting the demo.',
      },
      { status: 500 }
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter('openrouter/free'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(4),
    onStepFinish: ({ finishReason, text, toolResults }) => {
      if (toolResults.length === 0) {
        return;
      }

      const summary = toolResults
        .map(toolResult => `${toolResult.toolName}`)
        .join(', ');

      console.log(
        `[chat] tool-step finishReason=${finishReason} tools=${summary} textLength=${text.length}`
      );
    },
  });

  return result.toUIMessageStreamResponse();
}
