import type {
  CriterionFinding,
  CvExtraction,
  EvidenceQuote,
} from "../domain/extraction/contract";
import type {
  DimensionKey,
  RubricResult,
  ScoreState,
} from "../domain/rubric/rubric";

export type DocumentLanguage = "en" | "es";
export type ResultStatus = "partial" | "success";
export type FindingEffect = "negative" | "not_evaluable" | "positive";
export type AnalysisSource = "cached_example" | "live_upload";

export interface PresentationFinding {
  effect: FindingEffect;
  evidence: readonly EvidenceQuote[];
  explanation: string;
  id: string;
  label: string;
  notEvaluableReason: string | null;
  outcome: CriterionFinding["outcome"];
  outcomeLabel: string;
  points: number | null;
  recommendation: string;
  weight: number;
}

export interface PresentationDimension {
  coveragePercent: number;
  effect: FindingEffect;
  findings: readonly PresentationFinding[];
  name: string;
  score: number | null;
  state: ScoreState;
}

export interface AnalysisPresentation {
  coveragePercent: number;
  dimensions: readonly PresentationDimension[];
  documentName: string;
  language: DocumentLanguage;
  level: string;
  name: string;
  overallScore: number;
  role: string;
  source: AnalysisSource;
  status: ResultStatus;
}

export interface PresentationMetadata {
  documentName: string;
  fallbackLanguage: DocumentLanguage;
  level: string;
  name: string;
  role: string;
  source: AnalysisSource;
}

interface LocalizedText {
  en: string;
  es: string;
}

interface CriterionDefinition {
  action: LocalizedText;
  key: string;
  label: LocalizedText;
}

const dimensionNames: Record<DimensionKey, LocalizedText> = {
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
};

const criterionDefinitions = {
  impact: [
    {
      key: "resultOrientedBullets",
      label: { en: "Result-oriented bullets", es: "Bullets orientados a resultados" },
      action: {
        en: "Rewrite the cited bullet as action + object + a result already supported elsewhere in the CV. If no result is documented, keep the action factual and do not invent one.",
        es: "Reescribí el bullet citado como acción + objeto + un resultado ya respaldado en el CV. Si no hay un resultado documentado, conservá la acción factual sin inventarlo.",
      },
    },
    {
      key: "quantifiedAchievements",
      label: { en: "Quantified achievements", es: "Logros cuantificados" },
      action: {
        en: "Move an existing, verifiable number or scale indicator into the cited achievement. If the document contains none, describe the observable result without adding a metric.",
        es: "Llevá al logro citado un número o indicador de escala verificable que ya exista en el CV. Si no existe, describí el resultado observable sin agregar una métrica.",
      },
    },
    {
      key: "actionVerbOpenings",
      label: { en: "Action-verb openings", es: "Inicio con verbos de acción" },
      action: {
        en: "Start the cited bullet with the concrete action it already describes, then keep the existing object and context.",
        es: "Empezá el bullet citado con la acción concreta que ya describe y conservá el objeto y el contexto existentes.",
      },
    },
  ],
  clarity: [
    {
      key: "bulletLength",
      label: { en: "Scannable bullet length", es: "Longitud escaneable de bullets" },
      action: {
        en: "Split the cited text into one main action per bullet; retain only its existing context and result.",
        es: "Separá el texto citado en un bullet por acción principal; conservá únicamente su contexto y resultado existentes.",
      },
    },
    {
      key: "emptyJargon",
      label: { en: "Evidence instead of jargon", es: "Evidencia en lugar de jerga" },
      action: {
        en: "Replace the generic phrase with a concrete task, project, or result already described elsewhere in the CV; otherwise remove the claim.",
        es: "Reemplazá la frase genérica por una tarea, proyecto o resultado concreto que ya esté descrito en el CV; si no existe, eliminá la afirmación.",
      },
    },
    {
      key: "passiveVoice",
      label: { en: "Direct active voice", es: "Voz activa y directa" },
      action: {
        en: "Rewrite the cited sentence with the documented action first and the existing object second, without changing the facts.",
        es: "Reescribí la oración citada poniendo primero la acción documentada y luego el objeto existente, sin cambiar los hechos.",
      },
    },
    {
      key: "tenseConsistency",
      label: { en: "Verb-tense consistency", es: "Consistencia de tiempos verbales" },
      action: {
        en: "Use present tense only for a current role and past tense for completed roles; normalize the cited entry without changing its dates.",
        es: "Usá presente solo para el rol actual y pasado para roles finalizados; normalizá la entrada citada sin cambiar sus fechas.",
      },
    },
  ],
  atsStructure: [
    {
      key: "standardSections",
      label: { en: "Standard section headings", es: "Encabezados de sección estándar" },
      action: {
        en: "Rename existing content with standard headings such as Experience, Education, and Skills; do not create a section whose content is absent.",
        es: "Renombrá el contenido existente con encabezados estándar como Experiencia, Educación y Habilidades; no crees una sección cuyo contenido no exista.",
      },
    },
    {
      key: "reverseChronologicalOrder",
      label: { en: "Reverse chronological order", es: "Orden cronológico inverso" },
      action: {
        en: "Reorder the existing dated entries from newest to oldest while preserving every date and role exactly.",
        es: "Reordená las entradas fechadas existentes de la más reciente a la más antigua, conservando exactamente cada fecha y rol.",
      },
    },
    {
      key: "parserSafeFormat",
      label: { en: "Parser-safe format", es: "Formato seguro para parsers" },
      action: {
        en: "Move the cited content to a single-column, plain-text flow with standard bullets; remove layout-only tables, icons, and text boxes.",
        es: "Pasá el contenido citado a un flujo de texto plano en una sola columna y con bullets estándar; quitá tablas, iconos y cajas usados solo para maquetar.",
      },
    },
    {
      key: "completeContactInformation",
      label: { en: "Contact categories", es: "Categorías de contacto" },
      action: {
        en: "Present only the contact categories you choose to share in a clear text header. CVLens never reproduces their values in this report.",
        es: "Presentá solo las categorías de contacto que elijas compartir en un encabezado de texto claro. CVLens nunca reproduce sus valores en este informe.",
      },
    },
    {
      key: "appropriateLength",
      label: { en: "One-to-two-page length", es: "Extensión de una a dos páginas" },
      action: {
        en: "Remove repeated wording and keep the most relevant existing evidence so the document fits the supported one-to-two-page range.",
        es: "Eliminá redacciones repetidas y conservá la evidencia existente más relevante para que el documento entre en el rango admitido de una a dos páginas.",
      },
    },
  ],
  consistency: [
    {
      key: "unexplainedDateGaps",
      label: { en: "Explained timeline gaps", es: "Huecos temporales explicados" },
      action: {
        en: "Make the existing month/year ranges explicit. Add a brief gap label only when it is truthful and you want it in the CV; never fabricate an activity.",
        es: "Explicitá los rangos de mes y año existentes. Agregá una etiqueta breve para el hueco solo si es verdadera y querés incluirla; nunca inventes una actividad.",
      },
    },
    {
      key: "contradictoryDates",
      label: { en: "Non-contradictory dates", es: "Fechas no contradictorias" },
      action: {
        en: "Verify the cited dates against the source record, then correct the inaccurate one consistently everywhere it appears.",
        es: "Verificá las fechas citadas contra el registro original y corregí la inexacta de forma consistente en cada aparición.",
      },
    },
    {
      key: "overlappingDates",
      label: { en: "Clear overlapping roles", es: "Roles solapados claros" },
      action: {
        en: "If the overlap is accurate, label the existing role as concurrent, freelance, or part-time only when that description is true; otherwise correct the dates.",
        es: "Si el solapamiento es correcto, etiquetá el rol existente como simultáneo, freelance o part-time solo cuando sea verdad; de lo contrario, corregí las fechas.",
      },
    },
    {
      key: "dateFormatConsistency",
      label: { en: "Consistent date format", es: "Formato de fechas consistente" },
      action: {
        en: "Normalize every existing date to one format, for example MMM YYYY, without changing the underlying dates.",
        es: "Normalizá todas las fechas existentes a un único formato, por ejemplo MMM AAAA, sin modificar las fechas reales.",
      },
    },
  ],
  domainSignal: [
    {
      key: "experienceBackedSkills",
      label: { en: "Experience-backed skills", es: "Habilidades respaldadas por experiencia" },
      action: {
        en: "Connect the cited skill to a role or project where the CV already shows its use; if no such evidence exists, remove or qualify the skill.",
        es: "Vinculá la habilidad citada con un rol o proyecto donde el CV ya demuestre su uso; si no existe esa evidencia, quitá o matizá la habilidad.",
      },
    },
    {
      key: "unsupportedSkillList",
      label: { en: "Supported skill list", es: "Lista de habilidades respaldada" },
      action: {
        en: "Keep only skills supported by existing experience or projects, and place the strongest evidence next to the relevant role.",
        es: "Conservá solo habilidades respaldadas por experiencia o proyectos existentes y ubicá la evidencia más fuerte junto al rol relevante.",
      },
    },
  ],
} as const satisfies Record<DimensionKey, readonly CriterionDefinition[]>;

const dimensionOrder = [
  "impact",
  "clarity",
  "atsStructure",
  "consistency",
  "domainSignal",
] as const satisfies readonly DimensionKey[];

const outcomeLabels: Record<CriterionFinding["outcome"], LocalizedText> = {
  meets: { en: "Verified", es: "Verificado" },
  mixed: { en: "Mixed", es: "Mixto" },
  needs_improvement: { en: "Needs work", es: "A mejorar" },
  not_evaluable: { en: "Not evaluable", es: "No evaluable" },
};

function effectFor(outcome: CriterionFinding["outcome"]): FindingEffect {
  if (outcome === "meets") return "positive";
  if (outcome === "not_evaluable") return "not_evaluable";
  return "negative";
}

function dimensionEffect(findings: readonly PresentationFinding[]): FindingEffect {
  if (findings.some((finding) => finding.effect === "negative")) return "negative";
  if (findings.some((finding) => finding.effect === "not_evaluable")) {
    return "not_evaluable";
  }
  return "positive";
}

function recommendationFor(
  definition: CriterionDefinition,
  outcome: CriterionFinding["outcome"],
  language: DocumentLanguage,
): string {
  if (outcome === "meets") {
    return language === "es"
      ? "Conservá este tratamiento al editar el CV: el criterio ya está respaldado por evidencia."
      : "Preserve this treatment when editing the CV: the criterion is already supported by evidence.";
  }

  if (outcome === "not_evaluable") {
    if (definition.key === "completeContactInformation") {
      return definition.action[language];
    }

    return language === "es"
      ? "Revisá el motivo indicado. Si la información ya existe, hacela verificable en texto; si no existe, no la agregues salvo que sea verdadera y relevante."
      : "Review the stated reason. If the information already exists, make it verifiable as text; if it does not, add it only when it is true and relevant.";
  }

  const prefix =
    outcome === "mixed"
      ? language === "es"
        ? "Aplicá este ajuste a los casos débiles: "
        : "Apply this adjustment to the weaker cases: "
      : language === "es"
        ? "Aplicá este ajuste al fragmento citado: "
        : "Apply this adjustment to the cited fragment: ";

  return `${prefix}${definition.action[language]}`;
}

function buildDimension(
  dimensionKey: DimensionKey,
  extraction: CvExtraction,
  rubric: RubricResult,
  language: DocumentLanguage,
): PresentationDimension {
  const extractionFindings = extraction.dimensions[dimensionKey] as Record<
    string,
    CriterionFinding
  >;
  const criterionScores = rubric.dimensions[dimensionKey].criteria as Record<
    string,
    { points: number | null; weight: number }
  >;
  const findings = criterionDefinitions[dimensionKey].map((definition) => {
    const finding = extractionFindings[definition.key];
    const criterionScore = criterionScores[definition.key];

    if (!finding || !criterionScore) {
      throw new Error(`Missing presentation criterion ${dimensionKey}.${definition.key}.`);
    }

    return {
      effect: effectFor(finding.outcome),
      evidence: finding.evidence,
      explanation: finding.explanation,
      id: `${dimensionKey}.${definition.key}`,
      label: definition.label[language],
      notEvaluableReason: finding.notEvaluableReason,
      outcome: finding.outcome,
      outcomeLabel: outcomeLabels[finding.outcome][language],
      points: criterionScore.points,
      recommendation: recommendationFor(definition, finding.outcome, language),
      weight: criterionScore.weight,
    } satisfies PresentationFinding;
  });

  const dimensionScore = rubric.dimensions[dimensionKey];
  return {
    coveragePercent: dimensionScore.coveragePercent,
    effect: dimensionEffect(findings),
    findings,
    name: dimensionNames[dimensionKey][language],
    score: dimensionScore.score,
    state: dimensionScore.state,
  };
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

  return {
    coveragePercent: rubric.coveragePercent,
    dimensions: dimensionOrder.map((dimensionKey) =>
      buildDimension(dimensionKey, extraction, rubric, language),
    ),
    documentName: metadata.documentName,
    language,
    level: metadata.level,
    name: metadata.name,
    overallScore: rubric.overallScore,
    role: metadata.role,
    source: metadata.source,
    status: rubric.state === "complete" ? "success" : "partial",
  };
}
