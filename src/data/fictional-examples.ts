export type DocumentLanguage = "en" | "es";
export type ResultStatus = "partial" | "success";
export type FindingEffect = "negative" | "not_evaluable" | "positive";

export interface MockDimension {
  effect: FindingEffect;
  finding: string;
  name: string;
  quote: string;
  recommendation: string;
  score: number | null;
}

export interface FictionalExample {
  documentName: string;
  fictionLabel: string;
  id: "alex-kessler" | "dayo-okafor" | "marina-rivas";
  language: DocumentLanguage;
  level: string;
  name: string;
  overallScore: number;
  role: string;
  sourcePath: string;
  status: ResultStatus;
  tag: string;
  dimensions: readonly MockDimension[];
}

const alexDimensions: readonly MockDimension[] = [
  {
    name: "Impact & achievements",
    score: 42,
    effect: "negative",
    finding: "Most bullets describe responsibilities without a measurable outcome.",
    quote: '“Worked on frontend features and fixed bugs for the product.”',
    recommendation:
      "Name the user or business outcome for work already described, without inventing a metric.",
  },
  {
    name: "Clarity & writing",
    score: 66,
    effect: "negative",
    finding: "The writing is readable, but several bullets begin with passive or generic phrasing.",
    quote: '“Responsible for helping the team with different development tasks.”',
    recommendation: "Start each bullet with the concrete action you took and remove filler wording.",
  },
  {
    name: "Structure & ATS readability",
    score: 86,
    effect: "positive",
    finding: "Standard headings and a single-column layout make the document straightforward to parse.",
    quote: '“EXPERIENCE · PROJECTS · EDUCATION · SKILLS”',
    recommendation: "Keep this simple hierarchy when adding future roles or projects.",
  },
  {
    name: "Consistency",
    score: 84,
    effect: "positive",
    finding: "Dates and role order follow a consistent reverse-chronological pattern.",
    quote: '“Jun 2025 – Present · Jan 2025 – May 2025”',
    recommendation: "Keep the same month-year format across future entries.",
  },
  {
    name: "Technical / domain signal",
    score: 58,
    effect: "negative",
    finding: "The skills list is broader than the technologies evidenced in experience bullets.",
    quote: '“React, TypeScript, Next.js, Node.js, PostgreSQL, Docker”',
    recommendation: "Connect each skill you already used to the project or role where you used it.",
  },
];

const marinaDimensions: readonly MockDimension[] = [
  {
    name: "Impacto y logros",
    score: 88,
    effect: "positive",
    finding: "La experiencia cuantifica resultados y explica claramente la intervención realizada.",
    quote: '“Reduje el tiempo de despliegue de 40 a 12 minutos migrando el pipeline a contenedores.”',
    recommendation: "Mantené esta estructura de acción, cambio y resultado en los logros nuevos.",
  },
  {
    name: "Claridad y escritura",
    score: 82,
    effect: "positive",
    finding: "Los bullets son concretos y usan verbos de acción con resultados observables.",
    quote: '“Diseñé una estrategia de caché que redujo la latencia p95 un 31%.”',
    recommendation: "Acortá el resumen profesional a tres líneas para preservar el mismo ritmo de lectura.",
  },
  {
    name: "Estructura y legibilidad ATS",
    score: 54,
    effect: "negative",
    finding: "La tabla de habilidades y los indicadores gráficos pueden romper parsers ATS.",
    quote: '“[Tabla de dos columnas · Skill | Nivel · indicadores de barras]”',
    recommendation: "Convertí la tabla a una lista lineal de texto plano, sin iconos ni columnas.",
  },
  {
    name: "Consistencia",
    score: null,
    effect: "not_evaluable",
    finding: "Dos fechas no son legibles en la exportación prevista del documento.",
    quote: '“2021 – ▢▢▢▢ · 20▢9 – 2020”',
    recommendation: "Exportá nuevamente las fechas como texto seleccionable para verificar la cronología.",
  },
  {
    name: "Señal técnica / de dominio",
    score: 91,
    effect: "positive",
    finding: "El stack declarado aparece respaldado por decisiones y resultados en experiencias concretas.",
    quote: '“Node.js, TypeScript, PostgreSQL y Docker en servicios de pagos y observabilidad.”',
    recommendation: "Agrupá el stack por categoría para acelerar el escaneo sin quitar evidencia.",
  },
];

const dayoDimensions: readonly MockDimension[] = [
  {
    name: "Impact & achievements",
    score: 78,
    effect: "positive",
    finding: "Several bullets connect engineering work to measurable product outcomes.",
    quote: '“Reduced checkout errors by 18% after redesigning client-side validation.”',
    recommendation: "Add the already-known outcome to the remaining infrastructure bullet.",
  },
  {
    name: "Clarity & writing",
    score: 81,
    effect: "positive",
    finding: "Bullets are concise, active, and consistent in tone.",
    quote: '“Built an internal dashboard used by support to trace failed orders.”',
    recommendation: "Keep the same verb-first structure throughout the projects section.",
  },
  {
    name: "Structure & ATS readability",
    score: 82,
    effect: "positive",
    finding: "The document uses standard headings and a clean single-column reading order.",
    quote: '“SUMMARY · EXPERIENCE · PROJECTS · SKILLS · EDUCATION”',
    recommendation: "Retain the plain-text section labels in future revisions.",
  },
  {
    name: "Consistency",
    score: 34,
    effect: "negative",
    finding: "Two roles overlap and one project date predates the technology history described in the CV.",
    quote: '“Northstar Labs · Mar 2023–Present / Meridian Apps · Jan–Aug 2023”',
    recommendation: "Clarify whether the overlap was contract work and correct the conflicting project year.",
  },
  {
    name: "Technical / domain signal",
    score: 74,
    effect: "positive",
    finding: "Core technologies are supported by concrete product and platform work.",
    quote: '“React, TypeScript, Node.js and PostgreSQL across checkout and operations tooling.”',
    recommendation: "Move less-supported tools into an ‘Exposure’ group or tie them to an existing project.",
  },
];

/**
 * Phase 1 presentation fixtures only. Scores are deliberately marked as mock in the UI;
 * Phase 3 will replace them with deterministic rubric output.
 */
export const fictionalExamples: readonly FictionalExample[] = [
  {
    id: "alex-kessler",
    language: "en",
    level: "Junior",
    tag: "Task-based bullets",
    name: "Alex Kessler",
    role: "Frontend developer",
    documentName: "alex-kessler-cv.pdf",
    fictionLabel: "fictional person",
    sourcePath: "fixtures/cvs/alex-kessler-junior-en.md",
    overallScore: 65,
    status: "success",
    dimensions: alexDimensions,
  },
  {
    id: "marina-rivas",
    language: "es",
    level: "Senior",
    tag: "Problemas de formato ATS",
    name: "Marina Rivas",
    role: "Backend engineer",
    documentName: "marina-rivas-cv.pdf",
    fictionLabel: "persona ficticia",
    sourcePath: "fixtures/cvs/marina-rivas-senior-es.md",
    overallScore: 78,
    status: "partial",
    dimensions: marinaDimensions,
  },
  {
    id: "dayo-okafor",
    language: "en",
    level: "Mid-level",
    tag: "Date inconsistencies",
    name: "Dayo Okafor",
    role: "Full-stack engineer",
    documentName: "dayo-okafor-cv.pdf",
    fictionLabel: "fictional person",
    sourcePath: "fixtures/cvs/dayo-okafor-mid-en.md",
    overallScore: 69,
    status: "success",
    dimensions: dayoDimensions,
  },
];

export function getFallbackExample(language: DocumentLanguage): FictionalExample {
  return language === "es" ? fictionalExamples[1] : fictionalExamples[0];
}
