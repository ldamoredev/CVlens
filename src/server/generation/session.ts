import "server-only";

import {
  type GenerationSessionState,
  type GenerationStrategy,
} from "../../domain/generation/contract";
import {
  GenerationSessionManager,
  type GenerationSessionStart,
} from "./session-manager";

const generationSessionGlobal = globalThis as typeof globalThis & {
  __cvlensGenerationSessions?: GenerationSessionManager;
};

function generationSessionManager(): GenerationSessionManager {
  if (!generationSessionGlobal.__cvlensGenerationSessions) {
    generationSessionGlobal.__cvlensGenerationSessions = new GenerationSessionManager();
  }
  return generationSessionGlobal.__cvlensGenerationSessions;
}

export function createGenerationSession(bytes: Buffer): GenerationSessionState {
  return generationSessionManager().create(bytes);
}

export function beginGenerationSession(
  token: string,
  bytes: Buffer,
  strategy: GenerationStrategy,
): GenerationSessionStart {
  return generationSessionManager().begin(token, bytes, strategy);
}
