import type {
  CriterionFinding,
  CvExtraction,
} from "../domain/extraction/contract";

export type FictionalExampleId =
  | "alex-kessler"
  | "dayo-okafor"
  | "marina-rivas";

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

function unavailable(
  explanation: string,
  reason: string,
): CriterionFinding {
  return {
    outcome: "not_evaluable",
    explanation,
    evidence: [],
    notEvaluableReason: reason,
  };
}

const alexKesslerExtraction: CvExtraction = {
  schemaVersion: "1.0",
  document: {
    language: "en",
    languageEvidence: [
      {
        quote: "Junior frontend developer interested in accessible interfaces and product engineering.",
        location: "Summary",
      },
    ],
    languageReason: null,
  },
  dimensions: {
    impact: {
      resultOrientedBullets: finding(
        "mixed",
        "Some bullets name a concrete deliverable, while most describe duties without an outcome.",
        "Built reusable React components for the customer account area.",
        "Experience — Northwind Studio",
      ),
      quantifiedAchievements: finding(
        "needs_improvement",
        "The inspected bullets do not establish scale, metrics, or a measurable result.",
        "Worked on frontend features and fixed bugs for the product.",
        "Experience — Northwind Studio",
      ),
      actionVerbOpenings: finding(
        "meets",
        "The concrete project and experience bullets generally begin with direct action verbs.",
        "Added keyboard navigation and automated accessibility checks.",
        "Projects — Community Events Board",
      ),
    },
    clarity: {
      bulletLength: finding(
        "meets",
        "The bullets are concise and easy to scan.",
        "Wrote documentation for the design-system components.",
        "Experience — Paper Street Labs",
      ),
      emptyJargon: finding(
        "needs_improvement",
        "A responsibility statement uses generic wording without specifying the work performed.",
        "Responsible for helping the team with different development tasks.",
        "Experience — Northwind Studio",
      ),
      passiveVoice: finding(
        "meets",
        "The stronger bullets use direct active constructions.",
        "Built a responsive events directory with React and TypeScript.",
        "Projects — Community Events Board",
      ),
      tenseConsistency: finding(
        "meets",
        "Experience and project bullets consistently describe completed actions in past tense.",
        "Helped maintain landing pages and internal tools.",
        "Experience — Paper Street Labs",
      ),
    },
    atsStructure: {
      standardSections: finding(
        "meets",
        "The CV uses recognizable Summary, Experience, Projects, Education, and Skills sections.",
        "## Experience",
        "Section heading",
      ),
      reverseChronologicalOrder: finding(
        "meets",
        "The current role appears before the earlier internship.",
        "June 2025 – Present",
        "Experience — Northwind Studio",
      ),
      parserSafeFormat: finding(
        "meets",
        "The source uses a simple linear hierarchy with plain bullets.",
        "## Skills",
        "Section heading",
      ),
      completeContactInformation: unavailable(
        "Contact values are present in the source header but are deliberately excluded from analysis output.",
        "Completeness cannot be evidenced without reproducing private contact values.",
      ),
      appropriateLength: finding(
        "meets",
        "The document is concise for a junior profile and covers the expected core sections.",
        "Diploma in Web Development — Example Technical Institute, 2024",
        "Education",
      ),
    },
    consistency: {
      unexplainedDateGaps: finding(
        "meets",
        "The internship ends immediately before the current role begins.",
        "January 2025 – May 2025",
        "Experience — Paper Street Labs",
      ),
      contradictoryDates: finding(
        "meets",
        "The visible education and employment dates form a coherent sequence.",
        "June 2025 – Present",
        "Experience — Northwind Studio",
      ),
      overlappingDates: finding(
        "meets",
        "The two employment periods do not overlap.",
        "January 2025 – May 2025",
        "Experience — Paper Street Labs",
      ),
      dateFormatConsistency: finding(
        "meets",
        "Employment dates use a consistent month-year range format.",
        "June 2025 – Present",
        "Experience — Northwind Studio",
      ),
    },
    domainSignal: {
      experienceBackedSkills: finding(
        "mixed",
        "React and TypeScript are evidenced, while several listed technologies are not tied to work or projects.",
        "Built a responsive events directory with React and TypeScript.",
        "Projects — Community Events Board",
      ),
      unsupportedSkillList: finding(
        "needs_improvement",
        "The skills list is broader than the technologies supported in the document narrative.",
        "React, TypeScript, Next.js, Node.js, PostgreSQL, Docker, Git, Playwright",
        "Skills",
      ),
    },
  },
};

const marinaRivasExtraction: CvExtraction = {
  schemaVersion: "1.0",
  document: {
    language: "es",
    languageEvidence: [
      {
        quote: "Backend engineer con experiencia en sistemas de pagos, observabilidad y plataformas internas.",
        location: "Perfil",
      },
    ],
    languageReason: null,
  },
  dimensions: {
    impact: {
      resultOrientedBullets: finding(
        "meets",
        "Los bullets conectan acciones concretas con resultados operativos.",
        "Lideré la migración gradual de seis servicios sin interrupciones para clientes.",
        "Experiencia — Faro Pagos",
      ),
      quantifiedAchievements: finding(
        "meets",
        "El CV incluye métricas específicas de tiempo, latencia y alertas.",
        "Diseñé una estrategia de caché que redujo la latencia p95 un 31%.",
        "Experiencia — Faro Pagos",
      ),
      actionVerbOpenings: finding(
        "meets",
        "Los bullets comienzan consistentemente con verbos de acción directos.",
        "Implementé trazabilidad distribuida en servicios críticos de facturación.",
        "Experiencia — Nube Sur",
      ),
    },
    clarity: {
      bulletLength: finding(
        "meets",
        "Los bullets son breves y mantienen una sola idea principal.",
        "Reduje un 24% las alertas sin acción mediante nuevos umbrales y runbooks.",
        "Experiencia — Nube Sur",
      ),
      emptyJargon: finding(
        "meets",
        "Las afirmaciones principales están acompañadas por acciones o contexto técnico.",
        "Desarrollé APIs internas para conciliación y reportes operativos.",
        "Experiencia — Taller Digital",
      ),
      passiveVoice: finding(
        "meets",
        "La experiencia está redactada en voz activa.",
        "Diseñé una estrategia de caché que redujo la latencia p95 un 31%.",
        "Experiencia — Faro Pagos",
      ),
      tenseConsistency: finding(
        "meets",
        "Los logros mantienen el pretérito de manera consistente.",
        "Implementé trazabilidad distribuida en servicios críticos de facturación.",
        "Experiencia — Nube Sur",
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
        "Las posiciones están presentadas desde la más reciente hacia la más antigua.",
        "2022 – actualidad",
        "Experiencia — Faro Pagos",
      ),
      parserSafeFormat: finding(
        "needs_improvement",
        "La tabla y los indicadores visuales de habilidades pueden romper el orden de lectura ATS.",
        "| Tecnología | Nivel visual |",
        "Habilidades",
      ),
      completeContactInformation: unavailable(
        "Los valores de contacto del encabezado se excluyen deliberadamente del resultado.",
        "No se puede demostrar completitud sin reproducir datos de contacto privados.",
      ),
      appropriateLength: finding(
        "meets",
        "La extensión es razonable para tres experiencias y una sección técnica.",
        "Ingeniería en Sistemas — Universidad Ejemplo, 2018",
        "Educación",
      ),
    },
    consistency: {
      unexplainedDateGaps: unavailable(
        "Las fechas dañadas impiden determinar de forma confiable si existen huecos.",
        "Dos rangos laborales contienen caracteres ilegibles.",
      ),
      contradictoryDates: unavailable(
        "No es posible comparar todos los rangos sin asumir los dígitos faltantes.",
        "Las fechas incompletas no permiten verificar contradicciones.",
      ),
      overlappingDates: unavailable(
        "Los finales de dos períodos no son legibles y no permiten verificar solapamientos.",
        "Faltan datos de fecha necesarios para evaluar este criterio.",
      ),
      dateFormatConsistency: finding(
        "needs_improvement",
        "Dos rangos contienen caracteres ilegibles y rompen la consistencia de fechas.",
        "2021 – ▢▢▢▢",
        "Experiencia — Nube Sur",
      ),
    },
    domainSignal: {
      experienceBackedSkills: finding(
        "mixed",
        "Contenedores y observabilidad aparecen respaldados, pero no todo el stack listado se vincula a experiencias.",
        "Implementé trazabilidad distribuida en servicios críticos de facturación.",
        "Experiencia — Nube Sur",
      ),
      unsupportedSkillList: finding(
        "mixed",
        "La tabla enumera tecnologías con niveles visuales, pero parte de ellas carece de evidencia narrativa directa.",
        "| Node.js / TypeScript | ▰▰▰▰▰ |",
        "Habilidades",
      ),
    },
  },
};

const dayoOkaforExtraction: CvExtraction = {
  schemaVersion: "1.0",
  document: {
    language: "en",
    languageEvidence: [
      {
        quote: "Full-stack engineer building commerce workflows and operational tools.",
        location: "Summary",
      },
    ],
    languageReason: null,
  },
  dimensions: {
    impact: {
      resultOrientedBullets: finding(
        "meets",
        "Multiple bullets describe a shipped outcome or a concrete operational use.",
        "Built an internal dashboard used by support to trace failed orders.",
        "Experience — Northstar Labs",
      ),
      quantifiedAchievements: finding(
        "mixed",
        "One achievement is quantified, while the remaining bullets describe unmeasured outcomes.",
        "Reduced checkout errors by 18% after redesigning client-side validation.",
        "Experience — Northstar Labs",
      ),
      actionVerbOpenings: finding(
        "meets",
        "Experience bullets consistently begin with direct action verbs.",
        "Introduced typed API contracts across the React and Node.js applications.",
        "Experience — Northstar Labs",
      ),
    },
    clarity: {
      bulletLength: finding(
        "meets",
        "The bullets are concise and scannable.",
        "Created PostgreSQL reports for the operations team.",
        "Experience — Meridian Apps",
      ),
      emptyJargon: finding(
        "meets",
        "The document uses concrete product and engineering language instead of generic claims.",
        "Implemented product-page features and maintained integration tests.",
        "Experience — Bright Market",
      ),
      passiveVoice: finding(
        "meets",
        "The bullets consistently use active constructions.",
        "Maintained customer portals built with React and TypeScript.",
        "Experience — Meridian Apps",
      ),
      tenseConsistency: finding(
        "meets",
        "Completed work is described consistently in past tense.",
        "Created PostgreSQL reports for the operations team.",
        "Experience — Meridian Apps",
      ),
    },
    atsStructure: {
      standardSections: finding(
        "meets",
        "The source contains Summary, Experience, Projects, Skills, and Education.",
        "## Projects",
        "Section heading",
      ),
      reverseChronologicalOrder: finding(
        "meets",
        "Roles are listed from the current position back to the earliest role.",
        "March 2023 – Present",
        "Experience — Northstar Labs",
      ),
      parserSafeFormat: finding(
        "meets",
        "The CV uses a simple single-flow structure without tables or visual skill meters.",
        "## Skills",
        "Section heading",
      ),
      completeContactInformation: unavailable(
        "Contact values are intentionally excluded from the cached analysis.",
        "Completeness cannot be evidenced without reproducing private contact values.",
      ),
      appropriateLength: finding(
        "meets",
        "The document remains concise across three roles, one project, skills, and education.",
        "BSc Computer Science — Example Metropolitan University, 2021",
        "Education",
      ),
    },
    consistency: {
      unexplainedDateGaps: finding(
        "meets",
        "The employment sequence has no uncovered gap between the listed roles.",
        "July 2021 – December 2022",
        "Experience — Bright Market",
      ),
      contradictoryDates: finding(
        "needs_improvement",
        "The project description explicitly says its framework version postdates the stated project year.",
        "Built a queue inspection tool using a framework version released after the stated project date.",
        "Projects — Queue Inspector",
      ),
      overlappingDates: finding(
        "needs_improvement",
        "The Meridian and Northstar roles overlap from March through August 2023 without explanation.",
        "January 2023 – August 2023",
        "Experience — Meridian Apps",
      ),
      dateFormatConsistency: finding(
        "meets",
        "Employment ranges consistently use full month and year labels.",
        "March 2023 – Present",
        "Experience — Northstar Labs",
      ),
    },
    domainSignal: {
      experienceBackedSkills: finding(
        "mixed",
        "React, TypeScript, Node.js, and PostgreSQL are evidenced, while other listed tools are not tied to work.",
        "Introduced typed API contracts across the React and Node.js applications.",
        "Experience — Northstar Labs",
      ),
      unsupportedSkillList: finding(
        "needs_improvement",
        "Redis, Docker, Terraform, and GraphQL are listed without supporting experience or project evidence.",
        "React, TypeScript, Node.js, PostgreSQL, Redis, Docker, Terraform, GraphQL",
        "Skills",
      ),
    },
  },
};

/**
 * Reviewed, fictional, zero-cost demo extractions. These objects are served directly and
 * must never trigger Anthropic calls.
 */
export const cachedExampleExtractions: Readonly<
  Record<FictionalExampleId, CvExtraction>
> = {
  "alex-kessler": alexKesslerExtraction,
  "marina-rivas": marinaRivasExtraction,
  "dayo-okafor": dayoOkaforExtraction,
};
