'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  isToolOrDynamicToolUIPart,
  type UIMessage,
} from 'ai';
import type { GetUserOrdersResult } from '@/src/lib/ai/tools/orders-tool';
import type { GetCurrentTimeResult } from '@/src/lib/ai/tools/time-tool';
import type { GetWeatherResult } from '@/src/lib/ai/tools/weather-tool';

const demoPrompts = [
  'Explain in 10 short paragraphs why streaming text in chat apps feels fast.',
  'What orders does jan@example.com have?',
  'What is the weather in Warsaw?',
  'What time is it in Berlin?',
  'What is the weather in Krakow and what time is it there?',
  'Show me orders',
];

function isOrdersOutput(value: unknown): value is GetUserOrdersResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<GetUserOrdersResult>;
  return typeof candidate.email === 'string' && Array.isArray(candidate.orders);
}

function isWeatherOutput(value: unknown): value is GetWeatherResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<GetWeatherResult>;
  return (
    typeof candidate.city === 'string' &&
    typeof candidate.temperatureC === 'number' &&
    typeof candidate.condition === 'string'
  );
}

function isTimeOutput(value: unknown): value is GetCurrentTimeResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<GetCurrentTimeResult>;
  return (
    typeof candidate.location === 'string' &&
    typeof candidate.timezone === 'string' &&
    typeof candidate.localTime === 'string'
  );
}

function renderToolOutput(toolName: string, output: unknown) {
  if (toolName === 'getUserOrders' && isOrdersOutput(output)) {
    if (output.orders.length === 0) {
      return <div className="mt-2 text-stone-300">No orders found.</div>;
    }

    return (
      <div className="mt-2 space-y-2">
        {output.orders.map(order => (
          <div
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-stone-200"
            key={order.id}
          >
            {order.id} · {order.status} · ${order.total}
          </div>
        ))}
      </div>
    );
  }

  if (toolName === 'getWeather' && isWeatherOutput(output)) {
    return (
      <div className="mt-2 text-stone-200">
        {output.city} · {output.condition} · {output.temperatureC} C · wind{' '}
        {output.windKmh} km/h
      </div>
    );
  }

  if (toolName === 'getCurrentTime' && isTimeOutput(output)) {
    return (
      <div className="mt-2 text-stone-200">
        {output.location} · {output.localTime} · {output.timezone}
      </div>
    );
  }

  return null;
}

function renderToolPart(part: UIMessage['parts'][number]) {
  if (!isToolOrDynamicToolUIPart(part)) {
    return null;
  }

  const toolName =
    part.type === 'dynamic-tool' ? part.toolName : part.type.slice(5);

  return (
    <div
      className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
      key={part.toolCallId}
    >
      <div className="text-stone-400">{toolName}</div>
      {part.state === 'output-available'
        ? renderToolOutput(toolName, part.output)
        : null}
      {part.state === 'output-error' ? (
        <div className="mt-2 text-red-300">{part.errorText}</div>
      ) : null}
    </div>
  );
}

export default function Page() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  return (
    <main className="min-h-screen bg-[#17120f] px-4 py-8 text-stone-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {demoPrompts.map(prompt => (
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
              key={prompt}
              onClick={() => setInput(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <section className="flex min-h-[70vh] flex-col rounded-[2rem] border border-white/10 bg-[#221b17] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="border-b border-white/10 px-5 py-4 text-sm text-stone-400">
            Chat
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-stone-400">
                Try the first prompt to see pure text streaming, or ask about
                orders, weather, or time.
              </div>
            ) : null}

            {messages.map((message, messageIndex) => {
              const isUser = message.role === 'user';
              const isLatestAssistantMessage =
                !isUser && messageIndex === messages.length - 1;

              return (
                <article
                  className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'ml-auto bg-[#f59e0b] text-stone-950'
                      : 'bg-white/5 text-stone-100'
                  }`}
                  key={message.id}
                >
                  <div className="space-y-2">
                    {message.parts.map((part, index) => {
                      if (part.type === 'text') {
                        return (
                          <div className="whitespace-pre-wrap leading-7" key={index}>
                            {part.text}
                            {isLatestAssistantMessage &&
                            status === 'streaming' &&
                            index === message.parts.length - 1 ? (
                              <span className="ml-1 inline-block animate-pulse text-amber-300">
                                ▍
                              </span>
                            ) : null}
                          </div>
                        );
                      }

                      return <div key={index}>{renderToolPart(part)}</div>;
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          <form
            className="border-t border-white/10 p-4"
            onSubmit={event => {
              event.preventDefault();

              const value = input.trim();
              if (!value || isBusy) {
                return;
              }

              void sendMessage({ text: value });
              setInput('');
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-base text-stone-50 outline-none placeholder:text-stone-500"
                onChange={event => setInput(event.target.value)}
                placeholder="Type your question or use a prompt above..."
                value={input}
              />
              <button
                className="rounded-2xl bg-[#f59e0b] px-5 py-3 font-medium text-stone-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!input.trim() || isBusy}
                type="submit"
              >
                {isBusy ? 'Streaming...' : 'Send'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
