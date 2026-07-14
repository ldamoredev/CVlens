import type {
  CriterionFinding,
  CvExtraction,
} from "../domain/extraction/contract";
import type { ScoreState } from "../domain/rubric/rubric";
import { cachedExampleExtractions } from "./cached-example-extractions";

/**
 * Phase 7 launch regression corpus. Every fixture is fictional, schema-valid, and paired
 * with the fictional source CV that backs its verbatim quotes. The corpus is deterministic
 * and never performs a network or model call. The three cached demo extractions are reused
 * here and joined by two regression-only fixtures that pin the complete and
 * insufficient-information paths the bundled demos do not otherwise exercise.
 */

function finding(
  outcome: Exclude<CriterionFinding["outcome"], "not_evaluable">,
  explanation: string,
  quote: string,
  location: string,
): CriterionFinding {
  return {
    outcome,
    explanation,
    evidence: [{ quote, location }],
    notEvaluableReason: null,
  };
}

function unavailable(explanation: string, reason: string): CriterionFinding {
  return {
    outcome: "not_evaluable",
    explanation,
    evidence: [],
    notEvaluableReason: reason,
  };
}

// Fictional Spanish CV with full evidence coverage, exercising the complete state.
const luciaFernandezExtraction: CvExtraction = {
  schemaVersion: "1.0",
  document: {
    language: "es",
    languageEvidence: [
      {
        quote:
          "Ingeniera de calidad de datos enfocada en pruebas automatizadas y observabilidad de tuberías.",
        location: "Perfil",
      },
    ],
    languageReason: null,
  },
  dimensions: {
    impact: {
      resultOrientedBullets: finding(
        "meets",
        "Los bullets conectan la acción con un resultado operativo verificable.",
        "Lideré la automatización de pruebas que habilitó despliegues diarios sin regresiones.",
        "Experiencia — DataFlux",
      ),
      quantifiedAchievements: finding(
        "meets",
        "El logro principal incluye una métrica de tiempo concreta.",
        "Reduje el tiempo de ejecución de la suite de pruebas de 40 a 12 minutos.",
        "Experiencia — DataFlux",
      ),
      actionVerbOpenings: finding(
        "meets",
        "Los bullets comienzan con verbos de acción directos.",
        "Construí paneles de calidad de datos para el equipo de analítica.",
        "Experiencia — Mareograma",
      ),
    },
    clarity: {
      bulletLength: finding(
        "meets",
        "Los bullets son breves y mantienen una sola idea.",
        "Documenté los flujos de validación para el equipo de datos.",
        "Experiencia — Mareograma",
      ),
      emptyJargon: finding(
        "meets",
        "Las afirmaciones están respaldadas por acciones técnicas concretas.",
        "Diseñé verificaciones de integridad para tablas de facturación.",
        "Experiencia — Mareograma",
      ),
      passiveVoice: finding(
        "meets",
        "La experiencia está redactada en voz activa.",
        "Automaticé la generación de reportes de cobertura de pruebas.",
        "Experiencia — DataFlux",
      ),
      tenseConsistency: finding(
        "meets",
        "Los logros mantienen el pretérito de manera consistente.",
        "Mantuve los entornos de prueba y los datos sintéticos.",
        "Experiencia — Puerto Software",
      ),
    },
    atsStructure: {
      standardSections: finding(
        "meets",
        "El documento presenta Perfil, Experiencia, Habilidades y Educación.",
        "## Experiencia",
        "Encabezado de sección",
      ),
      reverseChronologicalOrder: finding(
        "meets",
        "Las posiciones van desde la más reciente hacia la más antigua.",
        "2021 – actualidad",
        "Experiencia — DataFlux",
      ),
      parserSafeFormat: finding(
        "meets",
        "El documento usa una jerarquía lineal simple sin tablas ni medidores visuales.",
        "## Habilidades",
        "Encabezado de sección",
      ),
      completeContactInformation: finding(
        "meets",
        "El encabezado etiqueta las categorías de contacto sin exponer sus valores.",
        "Categorías de contacto: email · GitHub",
        "Encabezado — etiquetas seguras",
      ),
      appropriateLength: finding(
        "meets",
        "La extensión es razonable para tres experiencias y una sección técnica.",
        "Ingeniería en Informática — Universidad Ejemplo, 2016",
        "Educación",
      ),
    },
    consistency: {
      unexplainedDateGaps: finding(
        "meets",
        "Los períodos laborales son contiguos y no dejan huecos sin explicar.",
        "2019 – 2021",
        "Experiencia — Mareograma",
      ),
      contradictoryDates: finding(
        "meets",
        "Las fechas visibles forman una secuencia coherente.",
        "2021 – actualidad",
        "Experiencia — DataFlux",
      ),
      overlappingDates: finding(
        "meets",
        "Los tres períodos laborales no se solapan.",
        "2016 – 2019",
        "Experiencia — Puerto Software",
      ),
      dateFormatConsistency: finding(
        "meets",
        "Los rangos usan un formato de años consistente.",
        "2019 – 2021",
        "Experiencia — Mareograma",
      ),
    },
    domainSignal: {
      experienceBackedSkills: finding(
        "meets",
        "Python y SQL aparecen respaldados por experiencia narrada.",
        "Implementé validaciones en Python y SQL para tuberías de datos.",
        "Experiencia — DataFlux",
      ),
      unsupportedSkillList: finding(
        "mixed",
        "Parte del stack listado se respalda en la experiencia, pero varias herramientas no.",
        "Python, SQL, dbt, Airflow, Playwright, Grafana",
        "Habilidades",
      ),
    },
  },
};

// Fictional low-quality scan. Most of the body is illegible, so the majority of criteria
// are genuinely not evaluable and the overall coverage falls below the publication
// threshold, exercising the insufficient-information path end to end.
const noorHassanExtraction: CvExtraction = {
  schemaVersion: "1.0",
  document: {
    language: "en",
    languageEvidence: [
      {
        quote: "Software engineer available for backend and platform roles.",
        location: "Summary",
      },
    ],
    languageReason: null,
  },
  dimensions: {
    impact: {
      resultOrientedBullets: unavailable(
        "The scanned experience bullets are not legible enough to judge result orientation.",
        "The body text under each role is largely obscured in the scan.",
      ),
      quantifiedAchievements: unavailable(
        "No legible metric or measurable outcome can be read from the document.",
        "The scanned achievement lines cannot be read reliably.",
      ),
      actionVerbOpenings: unavailable(
        "Only one bullet is legible, which is not enough to assess bullet openings.",
        "Most bullet text is obscured in the scan.",
      ),
    },
    clarity: {
      bulletLength: finding(
        "meets",
        "The single legible bullet is concise and scannable.",
        "Maintained backend services and internal tools.",
        "Experience",
      ),
      emptyJargon: unavailable(
        "There is not enough legible prose to assess generic or empty wording.",
        "The scanned experience prose is largely unreadable.",
      ),
      passiveVoice: unavailable(
        "Too little legible text is available to assess voice.",
        "The scanned bullets cannot be read reliably.",
      ),
      tenseConsistency: unavailable(
        "A single legible bullet cannot establish tense consistency.",
        "The remaining bullets are obscured in the scan.",
      ),
    },
    atsStructure: {
      standardSections: finding(
        "meets",
        "Recognizable section headings are present even where the body is unreadable.",
        "## Experience",
        "Section heading",
      ),
      reverseChronologicalOrder: unavailable(
        "The role dates are illegible, so ordering cannot be verified.",
        "The date lines render as unreadable blocks.",
      ),
      parserSafeFormat: unavailable(
        "Scan quality prevents a reliable read of the document structure.",
        "The body text is degraded across the document.",
      ),
      completeContactInformation: unavailable(
        "Contact completeness cannot be evidenced without reproducing private values.",
        "No privacy-safe contact category labels are present in the document.",
      ),
      appropriateLength: finding(
        "meets",
        "The document is a single concise page covering the expected core sections.",
        "Computer Science studies — Example University.",
        "Education",
      ),
    },
    consistency: {
      unexplainedDateGaps: unavailable(
        "The employment dates are unreadable, so gaps cannot be assessed.",
        "Every date range renders as an unreadable block.",
      ),
      contradictoryDates: unavailable(
        "Illegible dates cannot be compared for contradictions.",
        "The scanned date ranges cannot be read.",
      ),
      overlappingDates: unavailable(
        "Illegible dates cannot be checked for overlap.",
        "The scanned date ranges cannot be read.",
      ),
      dateFormatConsistency: unavailable(
        "No legible dates are available to compare formats.",
        "Every date range renders as an unreadable block.",
      ),
    },
    domainSignal: {
      experienceBackedSkills: unavailable(
        "The skills list is illegible, so it cannot be tied to experience.",
        "The skills section renders as unreadable blocks.",
      ),
      unsupportedSkillList: unavailable(
        "The skills list cannot be read, so unsupported entries cannot be identified.",
        "The skills section renders as unreadable blocks.",
      ),
    },
  },
};

export interface RegressionFixture {
  id: string;
  label: string;
  sourcePath: string;
  language: CvExtraction["document"]["language"];
  expectedState: ScoreState;
  extraction: CvExtraction;
}

export const regressionFixtures: readonly RegressionFixture[] = [
  {
    id: "alex-kessler",
    label: "Junior EN CV — full coverage, complete state",
    sourcePath: "fixtures/cvs/alex-kessler-junior-en.md",
    language: "en",
    expectedState: "complete",
    extraction: cachedExampleExtractions["alex-kessler"],
  },
  {
    id: "marina-rivas",
    label: "Senior ES CV — ATS format issues, partial state",
    sourcePath: "fixtures/cvs/marina-rivas-senior-es.md",
    language: "es",
    expectedState: "partial",
    extraction: cachedExampleExtractions["marina-rivas"],
  },
  {
    id: "dayo-okafor",
    label: "Mid EN CV — date inconsistencies, partial state",
    sourcePath: "fixtures/cvs/dayo-okafor-mid-en.md",
    language: "en",
    expectedState: "partial",
    extraction: cachedExampleExtractions["dayo-okafor"],
  },
  {
    id: "lucia-fernandez",
    label: "Senior ES CV — full coverage, complete state",
    sourcePath: "fixtures/cvs/lucia-fernandez-senior-es.md",
    language: "es",
    expectedState: "complete",
    extraction: luciaFernandezExtraction,
  },
  {
    id: "noor-hassan",
    label: "Low-quality EN scan — insufficient information state",
    sourcePath: "fixtures/cvs/noor-hassan-sparse-en.md",
    language: "en",
    expectedState: "insufficient_information",
    extraction: noorHassanExtraction,
  },
];
