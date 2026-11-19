import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { DEMO_GAME, DEMO_MENTOR, SYSTEM_PROMPT } from "../../../lib/demo-game";
import { NextResponse } from "next/server";

type InputMessage = { role?: string; content?: string };

const isComplete = (prompt: string) => /готово|выполнил|выполнен|сделал|завершил|миссия выполнена|портфолио/i.test(prompt);
const demo = (prompt = "") => NextResponse.json({ mentor_message: DEMO_MENTOR, code: DEMO_GAME, mission_completed: isComplete(prompt), demo: true });

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = await request.json();
    const currentCode = typeof body?.currentCode === "string" ? body.currentCode : DEMO_GAME;
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const history: InputMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const normalizedHistory = prompt ? [...history, { role: "user", content: prompt }] : history;
    const lastTwo: ChatCompletionMessageParam[] = normalizedHistory.slice(-2).map((message) => ({
      role: message.role === "assistant" || message.role === "mentor" ? "assistant" : "user",
      content: typeof message.content === "string" ? message.content.slice(0, 2400) : ""
    } as ChatCompletionMessageParam));

    if (!process.env.OPENAI_API_KEY) return demo(prompt);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Текущий HTML-код игры:\n${currentCode}` },
        ...lastTwo
      ]
    });

    const raw = response.choices[0]?.message?.content || "";
    const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(clean) as { mentor_message?: unknown; code?: unknown; mission_completed?: unknown };
    if (typeof parsed.mentor_message !== "string" || typeof parsed.code !== "string" || typeof parsed.mission_completed !== "boolean" || !parsed.code.includes("<canvas")) return demo(prompt);
    return NextResponse.json({ mentor_message: parsed.mentor_message.slice(0, 500), code: parsed.code, mission_completed: parsed.mission_completed, demo: false });
  } catch {
    return demo(prompt);
  }
}
