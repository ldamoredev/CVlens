import { scoreExtraction } from "../domain/rubric/rubric";
import {
  createAnalysisPresentation,
  type AnalysisPresentation,
  type DocumentLanguage,
} from "./analysis-presentation";
import {
  cachedExampleExtractions,
  type FictionalExampleId,
} from "./cached-example-extractions";

export type {
  AnalysisPresentation,
  DocumentLanguage,
  FindingEffect,
  PresentationDimension,
  PresentationFinding,
  ResultStatus,
} from "./analysis-presentation";

export interface FictionalExample extends AnalysisPresentation {
  fictionLabel: string;
  id: FictionalExampleId;
  source: "cached_example";
  sourcePath: string;
  tag: string;
}

interface FictionalExampleMetadata {
  documentName: string;
  fictionLabel: string;
  id: FictionalExampleId;
  level: string;
  name: string;
  role: string;
  sourcePath: string;
  tag: string;
}

const exampleMetadata: readonly FictionalExampleMetadata[] = [
  {
    id: "alex-kessler",
    level: "Junior",
    tag: "Task-based bullets",
    name: "Alex Kessler",
    role: "Frontend developer",
    documentName: "alex-kessler-cv.pdf",
    fictionLabel: "fictional person",
    sourcePath: "fixtures/cvs/alex-kessler-junior-en.md",
  },
  {
    id: "marina-rivas",
    level: "Senior",
    tag: "Problemas de formato ATS",
    name: "Marina Rivas",
    role: "Backend engineer",
    documentName: "marina-rivas-cv.pdf",
    fictionLabel: "persona ficticia",
    sourcePath: "fixtures/cvs/marina-rivas-senior-es.md",
  },
  {
    id: "dayo-okafor",
    level: "Mid-level",
    tag: "Date inconsistencies",
    name: "Dayo Okafor",
    role: "Full-stack engineer",
    documentName: "dayo-okafor-cv.pdf",
    fictionLabel: "fictional person",
    sourcePath: "fixtures/cvs/dayo-okafor-mid-en.md",
  },
];

function buildFictionalExample(
  metadata: FictionalExampleMetadata,
): FictionalExample {
  const extraction = cachedExampleExtractions[metadata.id];
  const analysis = createAnalysisPresentation(
    extraction,
    scoreExtraction(extraction),
    {
      documentName: metadata.documentName,
      fallbackLanguage: metadata.id === "marina-rivas" ? "es" : "en",
      level: metadata.level,
      name: metadata.name,
      role: metadata.role,
      source: "cached_example",
    },
  );

  if (!analysis) {
    throw new Error(`Cached example ${metadata.id} has insufficient rubric coverage.`);
  }

  return {
    ...analysis,
    fictionLabel: metadata.fictionLabel,
    id: metadata.id,
    source: "cached_example",
    sourcePath: metadata.sourcePath,
    tag: metadata.tag,
  };
}

/** Reviewed cached fixtures. Selecting one never performs a network or model call. */
export const fictionalExamples: readonly FictionalExample[] =
  exampleMetadata.map(buildFictionalExample);

export function getFallbackExample(language: DocumentLanguage): FictionalExample {
  return language === "es" ? fictionalExamples[1] : fictionalExamples[0];
}
