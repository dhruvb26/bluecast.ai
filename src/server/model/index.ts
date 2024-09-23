import { env } from "@/env";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = env.SPIREO_SECRET_KEY;
const baseURL = `https://gateway.ai.cloudflare.com/v1/${env.AIGATEWAY_ACCOUNT_ID}/${env.AIGATEWAY_ID}/anthropic`;

export const anthropic = new Anthropic({
  apiKey,
  baseURL,
});
