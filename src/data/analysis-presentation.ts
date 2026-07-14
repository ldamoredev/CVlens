import type {
  CriterionFinding,
  CvExtraction,
} from "../domain/extraction/contract";
import type { RubricResult } from "../domain/rubric/rubric";

export type DocumentLanguage = "en" | "es";
export type ResultStatus = "partial" | "success";
export type FindingEffect = "negative" | "not_evaluable" | "positive";
export type AnalysisSource = "cached_example" | "live_upload";

export interface PresentationDimension {
  effect: FindingEffect;
  finding: string;
  name: string;
  quote: string;
  recommendation: string;
  score: number | null;
}

export interface AnalysisPresentation {
  documentName: string;
  language: DocumentLanguage;
  level: string;
  name: string;
  overallScore: number;
  role: string;
  source: AnalysisSource;
  status: ResultStatus;
  dimensions: readonly PresentationDimension[];
}

export interface PresentationMetadata {
  documentName: string;
  fallbackLanguage: DocumentLanguage;
  level: string;
  name: string;
  role: string;
  source: AnalysisSource;
}

const dimensionNames = {
  impact: { en: "Impact & achievements", es: "Impacto y logros" },
  clarity: { en: "Clarity & writing", es: "Claridad y escritura" },
  atsStructure: {
    en: "Structure & ATS readability",
    es: "Estructura y legibilidad ATS",
  },
  consistency: { en: "Consistency", es: "Consistencia" },
  domainSignal: {
    en: "Technical / domain signal",
    es: "Señal técnica / de dominio",
  },
} as const;

const dimensionOrder = [
  "impact",
  "clarity",
  "atsStructure",
  "consistency",
  "domainSignal",
] as const;

const outcomePriority: readonly CriterionFinding["outcome"][] = [
  "needs_improvement",
  "mixed",
  "not_evaluable",
  "meets",
];

function chooseRepresentativeFinding(
  findings: readonly CriterionFinding[],
): CriterionFinding {
  for (const outcome of outcomePriority) {
    const finding = findings.find((candidate) => candidate.outcome === outcome);
    if (finding) return finding;
  }

  throw new Error("A rubric dimension must contain at least one finding.");
}

function effectFor(outcome: CriterionFinding["outcome"]): FindingEffect {
  if (outcome === "meets") return "positive";
  if (outcome === "not_evaluable") return "not_evaluable";
  return "negative";
}

function safeGuidance(
  outcome: CriterionFinding["outcome"],
  language: DocumentLanguage,
): string {
  if (outcome === "not_evaluable") {
    return language === "es"
      ? "Volvé a exportar esa sección como texto legible para poder evaluarla sin hacer suposiciones."
      : "Export that section again as readable text so it can be evaluated without assumptions.";
  }

  if (outcome === "meets") {
    return language === "es"
      ? "Conservá esta evidencia concreta cuando edites o adaptes el CV."
      : "Preserve this concrete evidence when editing or tailoring the CV.";
  }

  return language === "es"
    ? "Revisá el fragmento citado y explicitá mejor la información que ya existe, sin agregar datos nuevos."
    : "Revise the cited fragment and make the existing information more explicit without adding new facts.";
}

export function createAnalysisPresentation(
  extraction: CvExtraction,
  rubric: RubricResult,
  metadata: PresentationMetadata,
): AnalysisPresentation | null {
  if (rubric.overallScore === null) return null;

  const language: DocumentLanguage =
    extraction.document.language === "undetermined"
      ? metadata.fallbackLanguage
      : extraction.document.language;

  const dimensions = dimensionOrder.map((dimensionKey) => {
    const findings = Object.values(extraction.dimensions[dimensionKey]);
    const representative = chooseRepresentativeFinding(findings);
    const quote =
      representative.evidence[0]?.quote ??
      representative.notEvaluableReason ??
      representative.explanation;

    return {
      name: dimensionNames[dimensionKey][language],
      score: rubric.dimensions[dimensionKey].score,
      effect: effectFor(representative.outcome),
      finding: representative.explanation,
      quote,
      recommendation: safeGuidance(representative.outcome, language),
    } satisfies PresentationDimension;
  });

  return {
    documentName: metadata.documentName,
    language,
    level: metadata.level,
    name: metadata.name,
    overallScore: rubric.overallScore,
    role: metadata.role,
    source: metadata.source,
    status: rubric.state === "complete" ? "success" : "partial",
    dimensions,
  };
}
