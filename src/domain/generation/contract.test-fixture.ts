import type { GeneratedClaim, GeneratedCv, GeneratedEntity } from "./contract";

export const GENERATED_CV_SOURCE_FIXTURE = `Alex Rivera
alex@example.test
Frontend Developer | Acme Labs | 2023–Present
Built accessible interfaces for web products
Improved checkout completion by 18%
Skills: TypeScript`;

export function generatedEntity(text: string, location = "CV fixture"): GeneratedEntity {
  return {
    text,
    evidence: [{ quote: text, location }],
  };
}

export function generatedClaim(text: string, quote: string, location = "CV fixture"): GeneratedClaim {
  return {
    text,
    evidence: [{ quote, location }],
  };
}

export function createGeneratedCvFixture(): GeneratedCv {
  return {
    schemaVersion: "1.0",
    language: "en",
    strategy: "ats_focused",
    header: {
      name: generatedEntity("Alex Rivera", "Header"),
      headline: generatedClaim(
        "Frontend developer focused on accessible product interfaces.",
        "Built accessible interfaces for web products",
        "Profile",
      ),
      contact: [generatedEntity("alex@example.test", "Header")],
    },
    summary: [],
    experience: [
      {
        role: generatedEntity("Frontend Developer", "Experience"),
        organization: generatedEntity("Acme Labs", "Experience"),
        dates: generatedEntity("2023–Present", "Experience"),
        location: null,
        bullets: [
          generatedClaim(
            "Improved checkout completion by 18%.",
            "Improved checkout completion by 18%",
            "Experience — Acme Labs",
          ),
        ],
      },
    ],
    projects: [],
    education: [],
    skills: [generatedEntity("TypeScript", "Skills")],
    additionalSections: [],
  };
}
