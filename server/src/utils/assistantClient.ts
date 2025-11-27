import OpenAI from 'openai';

const apiKey = process.env.API_KEY;
const assistantId = process.env.API_ASSISTANT_ID;

let client: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!apiKey) {
    throw new Error('OpenAI API_KEY is not configured.');
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
};

const extractMessageText = (message: OpenAI.Beta.Threads.Messages.Message): string => {
  return message.content
    .map((part) => (part.type === 'text' ? part.text.value : ''))
    .filter(Boolean)
    .join('\n')
    .trim();
};

export const requestAssistantRecommendations = async (prompt: string): Promise<string> => {
  if (!assistantId) {
    throw new Error('OpenAI API_ASSISTANT_ID is not configured.');
  }

  const openai = getClient();
  const thread = await openai.beta.threads.create({
    messages: [{ role: 'user', content: prompt }],
  });

  let run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId });

  const terminalStates = ['completed', 'failed', 'cancelled', 'expired'] as const;
  const startedAt = Date.now();
  const timeoutMs = 45000;

  while (!terminalStates.includes(run.status as (typeof terminalStates)[number])) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('Assistant response timed out.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  if (run.status !== 'completed') {
    throw new Error(`Assistant run ended with status: ${run.status}`);
  }

  const messages = await openai.beta.threads.messages.list(thread.id, { order: 'desc', limit: 10 });
  const assistantMessage = messages.data.find((message) => message.role === 'assistant');
  const text = assistantMessage ? extractMessageText(assistantMessage) : '';

  if (!text) {
    throw new Error('Assistant returned an empty response.');
  }

  return text;
};
