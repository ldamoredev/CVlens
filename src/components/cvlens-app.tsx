"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type SVGProps,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  fictionalExamples,
  type AnalysisPresentation,
  type DocumentLanguage,
  type FictionalExample,
  type PresentationDimension,
  type PresentationFinding,
} from "@/data/fictional-examples";
import { createAnalysisPresentation } from "@/data/analysis-presentation";
import { cvExtractionSchema } from "@/domain/extraction/contract";
import {
  GENERATION_STRATEGIES,
  generationApiErrorSchema,
  generationApiResponseSchema,
  generationSessionStateSchema,
  type GeneratedClaim,
  type GeneratedCv,
  type GenerationEvidence,
  type GenerationApiErrorCode,
  type GenerationSessionState,
  type GenerationStrategy,
} from "@/domain/generation/contract";
import { generatedCvToMarkdown } from "@/domain/generation/markdown";
import { jobMatchExtractionSchema } from "@/domain/job-match/contract";
import {
  MAX_JOB_DESCRIPTION_CHARACTERS,
  MIN_JOB_DESCRIPTION_CHARACTERS,
  validateOptionalJobDescription,
} from "@/domain/job-match/job-description";
import { scoreJobMatch } from "@/domain/job-match/score";
import { scoreExtraction } from "@/domain/rubric/rubric";
import { apiErrorState } from "@/lib/api-error-state";
import {
  type AnalysisErrorState,
  type AppState,
  formatFileSize,
  type PreviewState,
  validateUpload,
} from "@/lib/presentation-state";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

interface CVLensAppProps {
  initialPreviewState: PreviewState;
}

interface FileSnapshot {
  file: File | null;
  name: string;
  size: number;
  type: string;
}

interface GenerationSource {
  file: File;
  jobDescription: string | null;
}

interface GenerationViewState {
  busy: boolean;
  current: GeneratedCv | null;
  error: string | null;
  session: GenerationSessionState;
  strategy: GenerationStrategy;
  onDownload: () => void;
  onGenerate: () => void;
  onStrategyChange: (strategy: GenerationStrategy) => void;
}

const copy = {
  es: {
    tagline: "Análisis verificable de CVs",
    navPrivacy: "no almacena",
    cvLanguage: "idioma del CV",
    changeTheme: "Cambiar tema",
    useDarkTheme: "Usar tema oscuro",
    useLightTheme: "Usar tema claro",
    kicker: "Análisis auditable",
    title: "Analizamos el documento, no a la persona.",
    subtitle:
      "Un puntaje reproducible con evidencia citada y recomendaciones accionables sobre tu CV. Sin promesas, sin magia.",
    dropTitle: "Arrastrá o seleccioná tu CV",
    dropActive: "Soltá el archivo para revisarlo",
    fileMeta: "PDF · JPG · PNG — máx. 8 MB — 1–2 páginas",
    selectFile: "Seleccionar archivo",
    privacy:
      "CVLens no guarda tu CV. Lo envía a Anthropic para analizarlo y elimina su copia temporal al terminar.",
    jobLabel: "Oferta laboral (opcional)",
    jobPlaceholder: "Pegá aquí los requisitos y responsabilidades del puesto…",
    jobHelp:
      "Si la agregás, comparamos requisitos explícitos con citas del CV. No se almacena ni modifica el puntaje del documento.",
    jobTooShort: `Ingresá al menos ${MIN_JOB_DESCRIPTION_CHARACTERS} caracteres o dejá el campo vacío.`,
    examplesLead: "o probá un CV ficticio — sin costo",
    fictionNote:
      "Personas y documentos completamente ficticios. Resultados cacheados y revisados, sin llamadas al modelo.",
    ready: "listo para analizar",
    remove: "Quitar archivo",
    analyze: "Analizar CV",
    analyzing: "Analizando",
    loadingNote:
      "El documento se envía a Anthropic sólo para este análisis; CVLens elimina su copia temporal al terminar.",
    steps: [
      "Inspeccionando la estructura del documento",
      "Verificando la evidencia citada",
      "Aplicando la rúbrica determinística",
    ],
    wait: "espera",
    done: "listo",
    active: "en curso",
    overall: "Puntaje general",
    complete: "Análisis completo",
    partial: "Resultado parcial",
    scoreNote:
      "El puntaje evalúa el documento, no a la persona. Es una guía reproducible, no una verdad absoluta.",
    cachedBadge: "fixture verificado · sin API",
    liveBadge: "análisis real · no almacenado",
    evaluated: "dimensiones evaluadas",
    coverage: "cobertura de evidencia",
    criteria: "criterios auditados",
    criterionWeight: "peso en la dimensión",
    scoreEffect: "resultado del criterio",
    excludedEffect: "excluido del cálculo",
    citedAt: "ubicación",
    unavailableEvidence: "Sin cita: este criterio no pudo verificarse.",
    dimensionCoverage: "cobertura",
    another: "Analizar otro CV",
    finding: "Hallazgo · interpretación",
    evidence: "Evidencia · cita textual del CV",
    recommendation: "Recomendación accionable",
    matchTitle: "Ajuste al puesto",
    matchScore: "Cobertura de requisitos",
    matchScoreNote:
      "Resultado separado del puntaje del CV. “No demostrado” significa únicamente que este documento no aporta evidencia.",
    requirementEvidence: "Requisito · cita textual de la oferta",
    cvMatchEvidence: "Soporte · cita textual del CV",
    noCvMatchEvidence: "No se encontró soporte textual en este CV.",
    matchFinding: "Comparación basada en evidencia",
    priority: "Prioridad",
    positive: "+ positivo",
    negative: "− a mejorar",
    partialDimension: "◐ parcial",
    notEvaluable: "◌ no evaluable",
    expand: "Mostrar evidencia",
    collapse: "Ocultar evidencia",
    footerPrinciple:
      "Extracción probabilística, puntaje determinístico — el modelo halla evidencia; TypeScript calcula.",
    footerPrivacy:
      "CVLens no guarda tu CV; Anthropic lo procesa sólo para cada operación solicitada.",
    fictional: "persona ficticia",
    generation: {
      title: "Generá una versión mejorada",
      intro:
        "Elegí una estrategia. CVLens genera un solo CV por vez y permite hasta tres generaciones para este análisis.",
      strategies: {
        ats_focused: ["Enfoque ATS", "Estructura convencional y términos explícitos del CV."],
        impact_focused: ["Enfoque en impacto", "Prioriza resultados y contribuciones respaldadas por citas."],
        concise: ["Versión concisa", "Reduce repetición y conserva sólo evidencia relevante."],
      },
      generate: "Generar un CV",
      generating: "Generando una versión",
      count: "generaciones usadas",
      remaining: "disponibles",
      current: "Vista previa de la última generación",
      download: "Descargar Markdown",
      evidence: "Ver fuente",
      source: "cita textual del CV",
      privacy:
        "El archivo permanece sólo en la memoria de este navegador para las generaciones solicitadas; el servidor descarta cada copia temporal.",
      complete: "Alcanzaste el máximo de tres generaciones para este análisis.",
    },
  },
  en: {
    tagline: "Verifiable CV analysis",
    navPrivacy: "CVLens doesn't store",
    cvLanguage: "CV language",
    changeTheme: "Change theme",
    useDarkTheme: "Use dark theme",
    useLightTheme: "Use light theme",
    kicker: "Auditable analysis",
    title: "We analyze the document, not the person.",
    subtitle:
      "A reproducible score with cited evidence and actionable recommendations for your CV. No promises, no magic.",
    dropTitle: "Drag or select your CV",
    dropActive: "Drop the file to review it",
    fileMeta: "PDF · JPG · PNG — max. 8 MB — 1–2 pages",
    selectFile: "Select file",
    privacy:
      "CVLens does not store your CV. It sends it to Anthropic for analysis and deletes its temporary copy when finished.",
    jobLabel: "Job description (optional)",
    jobPlaceholder: "Paste the role requirements and responsibilities here…",
    jobHelp:
      "When provided, explicit requirements are compared with cited CV evidence. It is not stored and does not change the document score.",
    jobTooShort: `Enter at least ${MIN_JOB_DESCRIPTION_CHARACTERS} characters or leave the field empty.`,
    examplesLead: "or try a fictional CV — free",
    fictionNote: "Fully fictional people and documents. Reviewed cached results, no model calls.",
    ready: "ready to analyze",
    remove: "Remove file",
    analyze: "Analyze CV",
    analyzing: "Analyzing",
    loadingNote:
      "The document is sent to Anthropic only for this analysis; CVLens deletes its temporary copy when finished.",
    steps: [
      "Inspecting document structure",
      "Verifying cited evidence",
      "Applying the deterministic rubric",
    ],
    wait: "waiting",
    done: "done",
    active: "in progress",
    overall: "Overall score",
    complete: "Analysis complete",
    partial: "Partial result",
    scoreNote:
      "The score evaluates the document, not the person. It is a reproducible guide, not an absolute truth.",
    cachedBadge: "reviewed fixture · no API",
    liveBadge: "live analysis · not stored",
    evaluated: "dimensions evaluated",
    coverage: "evidence coverage",
    criteria: "audited criteria",
    criterionWeight: "dimension weight",
    scoreEffect: "criterion result",
    excludedEffect: "excluded from calculation",
    citedAt: "location",
    unavailableEvidence: "No quote: this criterion could not be verified.",
    dimensionCoverage: "coverage",
    another: "Analyze another CV",
    finding: "Finding · interpretation",
    evidence: "Evidence · verbatim CV quote",
    recommendation: "Actionable recommendation",
    matchTitle: "Job match",
    matchScore: "Requirement coverage",
    matchScoreNote:
      "Separate from the CV score. “Not demonstrated” means only that this document does not provide supporting evidence.",
    requirementEvidence: "Requirement · verbatim job quote",
    cvMatchEvidence: "Support · verbatim CV quote",
    noCvMatchEvidence: "No textual support was found in this CV.",
    matchFinding: "Evidence-based comparison",
    priority: "Priority",
    positive: "+ positive",
    negative: "− needs work",
    partialDimension: "◐ partial",
    notEvaluable: "◌ not evaluable",
    expand: "Show evidence",
    collapse: "Hide evidence",
    footerPrinciple:
      "Probabilistic extraction, deterministic scoring — the model finds evidence; TypeScript computes.",
    footerPrivacy:
      "CVLens does not store your CV; Anthropic processes it only for each requested operation.",
    fictional: "fictional person",
    generation: {
      title: "Generate an improved version",
      intro:
        "Choose a strategy. CVLens generates one CV at a time and allows up to three generations for this analysis.",
      strategies: {
        ats_focused: ["ATS focus", "Uses conventional structure and explicit terms from the CV."],
        impact_focused: ["Impact focus", "Prioritizes outcomes and contributions backed by quotes."],
        concise: ["Concise version", "Removes repetition and keeps only relevant evidence."],
      },
      generate: "Generate one CV",
      generating: "Generating one version",
      count: "generations used",
      remaining: "available",
      current: "Latest generation preview",
      download: "Download Markdown",
      evidence: "View source",
      source: "verbatim CV quote",
      privacy:
        "The file remains only in this browser's memory for requested generations; the server discards each temporary copy.",
      complete: "You reached the maximum of three generations for this analysis.",
    },
  },
} as const;

const generationErrorCopy: Record<
  DocumentLanguage,
  Record<GenerationApiErrorCode, string>
> = {
  es: {
    file_too_large: "El archivo supera el límite permitido.",
    generation_in_progress: "Ya hay una generación en curso. Esperá a que termine.",
    generation_limit: "Ya usaste las tres generaciones disponibles.",
    insufficient: "No se pudo producir una versión con evidencia suficiente.",
    invalid_format: "El archivo ya no tiene un formato válido.",
    invalid_request: "No se pudo validar la solicitud de generación.",
    invalid_session: "La sesión expiró o no corresponde a este archivo. Volvé a analizar el CV.",
    provider_busy: "El proveedor está ocupado. Podés reintentar esta generación.",
    provider_unavailable: "El proveedor no está disponible. Podés reintentar más tarde.",
    rate_limited: "Alcanzaste el límite temporal de generaciones. Esperá unos minutos.",
    technical_error: "No pudimos completar la generación. Podés reintentar.",
    timeout: "La generación tardó demasiado. Podés reintentar.",
  },
  en: {
    file_too_large: "The file exceeds the allowed limit.",
    generation_in_progress: "A generation is already in progress. Wait for it to finish.",
    generation_limit: "You already used all three available generations.",
    insufficient: "A version with sufficient evidence could not be produced.",
    invalid_format: "The file no longer has a valid format.",
    invalid_request: "The generation request could not be validated.",
    invalid_session: "The session expired or does not match this file. Analyze the CV again.",
    provider_busy: "The provider is busy. You can retry this generation.",
    provider_unavailable: "The provider is unavailable. You can retry later.",
    rate_limited: "You reached the temporary generation limit. Wait a few minutes.",
    technical_error: "The generation could not be completed. You can retry.",
    timeout: "The generation took too long. You can retry.",
  },
};

const errorCopy = {
  es: {
    insufficient: {
      icon: "∅",
      title: "Información insuficiente",
      message:
        "No hubo evidencia legible suficiente para publicar un puntaje general. El archivo ya fue descartado.",
      action: "Probar un CV ficticio",
      tone: "warning",
    },
    invalid_format: {
      icon: "!",
      title: "Formato no admitido",
      message: "Usá un archivo PDF, JPG o PNG. El archivo fue rechazado antes de procesarse.",
      action: "Elegir otro archivo",
      tone: "danger",
    },
    file_too_large: {
      icon: "⇧",
      title: "Archivo demasiado grande",
      message: "El límite para esta experiencia es de 8 MB. Reducí el archivo e intentá de nuevo.",
      action: "Elegir otro archivo",
      tone: "danger",
    },
    provider_busy: {
      icon: "◷",
      title: "El proveedor está ocupado",
      message:
        "El análisis fue rechazado temporalmente. Esperá unos segundos y reintentá; tu archivo no se almacenó.",
      action: "Reintentar",
      tone: "warning",
    },
    provider_unavailable: {
      icon: "◷",
      title: "El proveedor no está disponible",
      message:
        "No pudimos conectar con el proveedor. Probá de nuevo en unos minutos; tu archivo no se almacenó.",
      action: "Reintentar",
      tone: "warning",
    },
    technical_error: {
      icon: "×",
      title: "Algo falló de nuestro lado",
      message: "No pudimos completar el análisis. Tu archivo no se almacenó.",
      action: "Reintentar",
      tone: "danger",
    },
    rate_limited: {
      icon: "◷",
      title: "Límite temporal alcanzado",
      message: "Esperá unos minutos y probá de nuevo. No hace falta volver a preparar el CV.",
      action: "Volver al inicio",
      tone: "warning",
    },
    timeout: {
      icon: "◷",
      title: "El análisis tardó demasiado",
      message:
        "La solicitud superó el tiempo máximo. Podés reintentar; tu archivo no se almacenó.",
      action: "Reintentar",
      tone: "warning",
    },
  },
  en: {
    insufficient: {
      icon: "∅",
      title: "Not enough information",
      message:
        "There was not enough readable evidence to publish an overall score. The file has already been discarded.",
      action: "Try a fictional CV",
      tone: "warning",
    },
    invalid_format: {
      icon: "!",
      title: "Unsupported format",
      message: "Use a PDF, JPG, or PNG file. The file was rejected before processing.",
      action: "Choose another file",
      tone: "danger",
    },
    file_too_large: {
      icon: "⇧",
      title: "File is too large",
      message: "The limit for this experience is 8 MB. Reduce the file size and try again.",
      action: "Choose another file",
      tone: "danger",
    },
    provider_busy: {
      icon: "◷",
      title: "The provider is busy",
      message:
        "The analysis was temporarily rejected. Wait a few seconds and retry; your file was not stored.",
      action: "Try again",
      tone: "warning",
    },
    provider_unavailable: {
      icon: "◷",
      title: "The provider is unavailable",
      message:
        "We could not connect to the provider. Try again in a few minutes; your file was not stored.",
      action: "Try again",
      tone: "warning",
    },
    technical_error: {
      icon: "×",
      title: "Something failed on our side",
      message: "We could not complete the analysis. Your file was not stored.",
      action: "Try again",
      tone: "danger",
    },
    rate_limited: {
      icon: "◷",
      title: "Temporary limit reached",
      message: "Wait a few minutes and try again. You do not need to prepare the CV again.",
      action: "Back to start",
      tone: "warning",
    },
    timeout: {
      icon: "◷",
      title: "The analysis took too long",
      message: "The request exceeded its time limit. You can retry; your file was not stored.",
      action: "Try again",
      tone: "warning",
    },
  },
} as const;

function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 16V4m0 0L7 9m5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M6 2h8l4 4v16H6V2Z" strokeLinejoin="round" />
      <path d="M14 2v4h4" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M20 15.5A8 8 0 0 1 8.5 4a8.2 8.2 0 1 0 11.5 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isErrorState(state: AppState): state is AnalysisErrorState {
  return [
    "file_too_large",
    "insufficient",
    "invalid_format",
    "provider_busy",
    "provider_unavailable",
    "rate_limited",
    "technical_error",
    "timeout",
  ].includes(state);
}

function initialExampleFor(state: PreviewState): FictionalExample | null {
  if (state === "partial" || state === "loading") return fictionalExamples[1];
  if (state === "success") return fictionalExamples[0];
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function CVLensApp({ initialPreviewState }: CVLensAppProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<DocumentLanguage>(
    initialPreviewState === "success" ? "en" : "es",
  );
  const [viewState, setViewState] = useState<AppState>(
    initialPreviewState === "dragging" ? "idle" : initialPreviewState,
  );
  const [dragActive, setDragActive] = useState(initialPreviewState === "dragging");
  const [selectedFile, setSelectedFile] = useState<FileSnapshot | null>(
    initialPreviewState === "selected"
      ? {
          file: null,
          name: "cv-rivas.pdf",
          size: 1.2 * 1024 * 1024,
          type: "application/pdf",
        }
      : null,
  );
  const [activeResult, setActiveResult] = useState<AnalysisPresentation | null>(() =>
    initialExampleFor(initialPreviewState),
  );
  const [pendingExample, setPendingExample] = useState<FictionalExample | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [progressStep, setProgressStep] = useState(0);
  const [openDimension, setOpenDimension] = useState(0);
  const [generationSource, setGenerationSource] = useState<GenerationSource | null>(null);
  const [generationSession, setGenerationSession] = useState<GenerationSessionState | null>(null);
  const [generationStrategy, setGenerationStrategy] = useState<GenerationStrategy>("ats_focused");
  const [generatedCv, setGeneratedCv] = useState<GeneratedCv | null>(null);
  const [generationBusy, setGenerationBusy] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const t = copy[language];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
      document.documentElement.dataset.theme = event.matches ? "light" : "dark";
    };

    preference.addEventListener("change", syncSystemTheme);
    return () => preference.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (viewState !== "loading" || initialPreviewState === "loading") return;

    const verifyTimer = window.setTimeout(() => setProgressStep(1), 650);
    const rubricTimer = window.setTimeout(() => setProgressStep(2), 1_300);
    return () => {
      window.clearTimeout(verifyTimer);
      window.clearTimeout(rubricTimer);
    };
  }, [initialPreviewState, viewState]);

  useEffect(() => {
    if (viewState !== "loading" || !pendingExample) return;

    const resultTimer = window.setTimeout(() => {
      setActiveResult(pendingExample);
      setPendingExample(null);
      setViewState(pendingExample.status);
    }, 900);

    return () => window.clearTimeout(resultTimer);
  }, [pendingExample, viewState]);

  const reset = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setViewState("idle");
    setDragActive(false);
    setSelectedFile(null);
    setActiveResult(null);
    setPendingExample(null);
    setJobDescription("");
    setProgressStep(0);
    setOpenDimension(0);
    setGenerationSource(null);
    setGenerationSession(null);
    setGenerationStrategy("ats_focused");
    setGeneratedCv(null);
    setGenerationBusy(false);
    setGenerationError(null);
  };

  const acceptFile = (file: File) => {
    const validation = validateUpload(file);

    if (!validation.valid) {
      setSelectedFile(null);
      setViewState(validation.reason);
      return;
    }

    setActiveResult(null);
    setPendingExample(null);
    setGenerationSource(null);
    setGenerationSession(null);
    setGeneratedCv(null);
    setGenerationError(null);
    setSelectedFile({ file, name: file.name, size: file.size, type: file.type });
    setViewState("selected");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) acceptFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) acceptFile(file);
  };

  const selectExample = (example: FictionalExample) => {
    setLanguage(example.language);
    setActiveResult(null);
    setPendingExample(example);
    setSelectedFile(null);
    setGenerationSource(null);
    setGenerationSession(null);
    setGeneratedCv(null);
    setGenerationError(null);
    setOpenDimension(0);
    setProgressStep(0);
    setViewState("loading");
  };

  const startSelectedFile = async () => {
    const upload = selectedFile?.file;
    if (!upload) {
      setViewState("insufficient");
      return;
    }

    setActiveResult(null);
    setPendingExample(null);
    setProgressStep(0);
    setViewState("loading");

    const formData = new FormData();
    formData.append("file", upload);
    const validatedJobDescription = validateOptionalJobDescription(jobDescription);
    if (!validatedJobDescription.ok) return;
    if (validatedJobDescription.value !== null) {
      formData.append("jobDescription", validatedJobDescription.value);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        setViewState(apiErrorState(body));
        return;
      }

      const extractionCandidate = isRecord(body) ? body.extraction : undefined;
      const parsed = cvExtractionSchema.safeParse(extractionCandidate);
      if (!parsed.success) {
        setViewState("technical_error");
        return;
      }

      const rubric = scoreExtraction(parsed.data);
      const submittedJob = validatedJobDescription.value !== null;
      const jobMatchCandidate = isRecord(body) && isRecord(body.jobMatch)
        ? body.jobMatch.extraction
        : undefined;
      const parsedJobMatch = submittedJob
        ? jobMatchExtractionSchema.safeParse(jobMatchCandidate)
        : null;
      if (parsedJobMatch !== null && !parsedJobMatch.success) {
        setViewState("technical_error");
        return;
      }
      const sessionCandidate = isRecord(body) ? body.generationSession : undefined;
      const parsedSession = generationSessionStateSchema.safeParse(sessionCandidate);
      if (!parsedSession.success) {
        setViewState("technical_error");
        return;
      }
      const resultLanguage: DocumentLanguage =
        parsed.data.document.language === "undetermined"
          ? language
          : parsed.data.document.language;
      const result = createAnalysisPresentation(parsed.data, rubric, {
        documentName: upload.name,
        fallbackLanguage: resultLanguage,
        level: resultLanguage === "es" ? "CV propio" : "Your CV",
        name: upload.name,
        role: resultLanguage === "es" ? "Documento subido" : "Uploaded document",
        source: "live_upload",
      }, parsedJobMatch?.success
        ? {
            extraction: parsedJobMatch.data,
            jobTitle: resultLanguage === "es" ? "Oferta comparada" : "Compared job description",
            score: scoreJobMatch(parsedJobMatch.data),
          }
        : null);

      if (!result) {
        setViewState("insufficient");
        return;
      }

      setLanguage(result.language);
      setActiveResult(result);
      setGenerationSource({
        file: upload,
        jobDescription: validatedJobDescription.value,
      });
      setGenerationSession(parsedSession.data);
      setGenerationStrategy("ats_focused");
      setGeneratedCv(null);
      setGenerationError(null);
      setOpenDimension(0);
      setViewState(result.status);
    } catch {
      setViewState("technical_error");
    } finally {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const generateOneCv = async () => {
    if (!generationSource || !generationSession || generationBusy) return;
    if (generationSession.remaining === 0) return;

    setGenerationBusy(true);
    setGenerationError(null);
    const formData = new FormData();
    formData.append("file", generationSource.file);
    formData.append("generationToken", generationSession.token);
    formData.append("strategy", generationStrategy);
    if (generationSource.jobDescription !== null) {
      formData.append("jobDescription", generationSource.jobDescription);
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const parsedError = generationApiErrorSchema.safeParse(body);
        setGenerationError(
          parsedError.success
            ? generationErrorCopy[language][parsedError.data.error.code]
            : generationErrorCopy[language].technical_error,
        );
        return;
      }

      const parsed = generationApiResponseSchema.safeParse(body);
      if (!parsed.success) {
        setGenerationError(generationErrorCopy[language].technical_error);
        return;
      }

      setGeneratedCv(parsed.data.generation);
      setGenerationSession(parsed.data.session);
    } catch {
      setGenerationError(generationErrorCopy[language].technical_error);
    } finally {
      setGenerationBusy(false);
    }
  };

  const downloadGeneratedCv = () => {
    if (!generatedCv || !generationSession) return;
    const blob = new Blob([generatedCvToMarkdown(generatedCv)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cvlens-version-${generationSession.count}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    const currentTheme: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const result = activeResult ?? initialExampleFor(viewState);
  const documentFlow = viewState === "loading" || viewState === "partial" || viewState === "success";
  const jobDescriptionValidation = validateOptionalJobDescription(jobDescription);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CVLens, inicio">
          <span>CV</span><span>Lens</span>
        </a>
        <span className="header-tagline">{t.tagline}</span>
        <div className="header-controls">
          <span className="privacy-indicator"><span aria-hidden="true" />{t.navPrivacy}</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            title={t.changeTheme}
          >
            <SunIcon className="theme-icon theme-icon-sun" aria-hidden="true" />
            <MoonIcon className="theme-icon theme-icon-moon" aria-hidden="true" />
            <span className="theme-action theme-action-light">{t.useLightTheme}</span>
            <span className="theme-action theme-action-dark">{t.useDarkTheme}</span>
          </button>
          {documentFlow ? (
            <span className="document-language">{t.cvLanguage} · {language.toUpperCase()}</span>
          ) : (
            <div
              className="language-switch"
              aria-label={language === "es" ? "Idioma de la interfaz" : "Interface language"}
            >
              {(["es", "en"] as const).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={language === option ? "is-active" : undefined}
                  aria-pressed={language === option}
                  onClick={() => setLanguage(option)}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="top" className="main-content">
        {viewState === "loading" ? (
          <LoadingView
            documentName={
              pendingExample?.documentName ??
              activeResult?.documentName ??
              selectedFile?.name ??
              "cv-ejemplo.pdf"
            }
            language={language}
            progressStep={progressStep}
          />
        ) : viewState === "success" || viewState === "partial" ? (
          result ? (
            <ResultView
              analysis={result}
              language={language}
              onReset={reset}
              openDimension={openDimension}
              onToggleDimension={(index) => setOpenDimension((current) => current === index ? -1 : index)}
              generation={generationSource && generationSession ? {
                busy: generationBusy,
                current: generatedCv,
                error: generationError,
                session: generationSession,
                strategy: generationStrategy,
                onDownload: downloadGeneratedCv,
                onGenerate: generateOneCv,
                onStrategyChange: setGenerationStrategy,
              } : null}
            />
          ) : null
        ) : (
          <section className="workspace" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">{t.kicker}</p>
              <h1 id="hero-title">{t.title}</h1>
              <p className="hero-subtitle">{t.subtitle}</p>
            </div>

            {isErrorState(viewState) ? (
              <StatusPanel state={viewState} language={language} onReset={reset} />
            ) : viewState === "selected" && selectedFile ? (
                <SelectedFilePanel
                file={selectedFile}
                language={language}
                onAnalyze={startSelectedFile}
                  onRemove={reset}
                  analyzeDisabled={!jobDescriptionValidation.ok}
                />
            ) : (
              <div
                className={`dropzone${dragActive ? " is-dragging" : ""}`}
                onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false);
                }}
                onDrop={handleDrop}
              >
                <div className="upload-icon" aria-hidden="true"><UploadIcon /></div>
                <h2>{dragActive ? t.dropActive : t.dropTitle}</h2>
                <p className="file-meta">{t.fileMeta}</p>
                <input
                  ref={fileInputRef}
                  id={inputId}
                  className="visually-hidden"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                />
                <label className="primary-button" htmlFor={inputId}>{t.selectFile}</label>
                <p className="privacy-copy"><ShieldIcon aria-hidden="true" />{t.privacy}</p>
              </div>
            )}

            {!isErrorState(viewState) ? (
              <JobDescriptionField
                language={language}
                value={jobDescription}
                onChange={setJobDescription}
                valid={jobDescriptionValidation.ok}
              />
            ) : null}

            <section className="examples-section" aria-labelledby="examples-title">
              <h2 className="examples-lead" id="examples-title">{t.examplesLead}</h2>
              <div className="examples-grid">
                {fictionalExamples.map((example) => (
                  <ExampleCard key={example.id} example={example} onSelect={selectExample} />
                ))}
              </div>
              <p className="fiction-note">{t.fictionNote}</p>
            </section>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>{t.footerPrinciple}</p>
        <p><ShieldIcon aria-hidden="true" />{t.footerPrivacy}</p>
      </footer>
      <div className="visually-hidden" aria-live="polite">
        {viewState === "loading" ? t.steps[progressStep] : viewState.replaceAll("_", " ")}
      </div>
    </div>
  );
}

function ExampleCard({
  example,
  onSelect,
}: {
  example: FictionalExample;
  onSelect: (example: FictionalExample) => void;
}) {
  return (
    <button className="example-card" type="button" onClick={() => onSelect(example)}>
      <span className="example-card-meta">
        <span className="language-badge">{example.language.toUpperCase()}</span>
        <span>{example.level}</span>
      </span>
      <strong>{example.tag}</strong>
      <span>{example.name} · {example.role}</span>
      <small><i aria-hidden="true" />{example.fictionLabel}</small>
    </button>
  );
}

function SelectedFilePanel({
  file,
  language,
  onAnalyze,
  onRemove,
  analyzeDisabled,
}: {
  file: FileSnapshot;
  language: DocumentLanguage;
  onAnalyze: () => void;
  onRemove: () => void;
  analyzeDisabled: boolean;
}) {
  const t = copy[language];

  return (
    <div className="selected-file-panel">
      <div className="selected-file-icon"><DocumentIcon aria-hidden="true" /></div>
      <div className="selected-file-copy">
        <span className="selected-kicker">{t.ready}</span>
        <strong>{file.name}</strong>
        <span>{file.type === "application/pdf" ? "PDF" : "IMAGE"} · {formatFileSize(file.size, language)}</span>
      </div>
      <button className="icon-button" type="button" onClick={onRemove} aria-label={t.remove}>
        <CloseIcon aria-hidden="true" />
      </button>
      <button className="primary-button selected-analyze" type="button" onClick={onAnalyze} disabled={analyzeDisabled}>
        {t.analyze}
      </button>
      <p className="selected-privacy"><ShieldIcon aria-hidden="true" />{t.privacy}</p>
    </div>
  );
}

function JobDescriptionField({
  language,
  onChange,
  valid,
  value,
}: {
  language: DocumentLanguage;
  onChange: (value: string) => void;
  valid: boolean;
  value: string;
}) {
  const t = copy[language];
  const descriptionId = useId();
  const helpId = `${descriptionId}-help`;
  const errorId = `${descriptionId}-error`;

  return (
    <section className="job-description-field" aria-labelledby={`${descriptionId}-label`}>
      <div className="job-description-heading">
        <label id={`${descriptionId}-label`} htmlFor={descriptionId}>{t.jobLabel}</label>
        <span>{value.length}/{MAX_JOB_DESCRIPTION_CHARACTERS}</span>
      </div>
      <textarea
        id={descriptionId}
        value={value}
        maxLength={MAX_JOB_DESCRIPTION_CHARACTERS}
        rows={5}
        placeholder={t.jobPlaceholder}
        aria-describedby={`${helpId}${valid ? "" : ` ${errorId}`}`}
        aria-invalid={!valid}
        onChange={(event) => onChange(event.target.value)}
      />
      <p id={helpId}>{t.jobHelp}</p>
      {!valid ? <p className="field-error" id={errorId}>{t.jobTooShort}</p> : null}
    </section>
  );
}

function StatusPanel({
  state,
  language,
  onReset,
}: {
  state: AnalysisErrorState;
  language: DocumentLanguage;
  onReset: () => void;
}) {
  const status = errorCopy[language][state];

  return (
    <div className={`status-panel is-${status.tone}`} role="alert">
      <span className="status-icon" aria-hidden="true">{status.icon}</span>
      <div>
        <p className="status-key">{state.replaceAll("_", " ")}</p>
        <h2>{status.title}</h2>
        <p>{status.message}</p>
        <button className="secondary-button" type="button" onClick={onReset}>{status.action}</button>
      </div>
    </div>
  );
}

function LoadingView({
  documentName,
  language,
  progressStep,
}: {
  documentName: string;
  language: DocumentLanguage;
  progressStep: number;
}) {
  const t = copy[language];

  return (
    <section className="loading-view" aria-labelledby="loading-title">
      <h1 className="eyebrow" id="loading-title">{t.analyzing}</h1>
      <p className="loading-document">{documentName} · {language === "es" ? "documento ficticio o local" : "fictional or local document"}</p>
      <ol className="progress-list">
        {t.steps.map((step, index) => {
          const complete = index < progressStep;
          const active = index === progressStep;
          return (
            <li key={step} className={complete ? "is-complete" : active ? "is-active" : undefined}>
              <span className="progress-dot" aria-hidden="true" />
              <span>{step}</span>
              <small>{complete ? t.done : active ? t.active : t.wait}</small>
            </li>
          );
        })}
      </ol>
      <div className="flow-line" aria-hidden="true" />
      <p className="loading-note">{t.loadingNote}</p>
    </section>
  );
}

function ResultView({
  analysis,
  language,
  onReset,
  openDimension,
  onToggleDimension,
  generation,
}: {
  analysis: AnalysisPresentation;
  language: DocumentLanguage;
  onReset: () => void;
  openDimension: number;
  onToggleDimension: (index: number) => void;
  generation: GenerationViewState | null;
}) {
  const t = copy[language];
  const evaluated = analysis.dimensions.filter((dimension) => dimension.score !== null).length;
  const sourceBadge =
    analysis.source === "cached_example" ? t.cachedBadge : t.liveBadge;

  return (
    <section className="result-layout" aria-labelledby="result-title">
      <aside className={`score-summary is-${analysis.status}`}>
        <h1 className="score-label" id="result-title">{t.overall}</h1>
        <ScoreMeter score={analysis.overallScore} />
        <span className={`result-status is-${analysis.status}`}>
          <i aria-hidden="true" />{analysis.status === "success" ? t.complete : t.partial}
        </span>
        <span className="source-badge">{sourceBadge}</span>
        <p className="score-note">{t.scoreNote}</p>
        <div className="result-audit-stats">
          <span><strong>{evaluated}/5</strong>{t.evaluated}</span>
          <span><strong>{analysis.coveragePercent}%</strong>{t.coverage}</span>
        </div>
        <button className="secondary-button full-width" type="button" onClick={onReset}>{t.another}</button>
      </aside>

      <div className="dimensions-list">
        <div className="result-document-meta">
          <div>
            <span>{analysis.language.toUpperCase()} · {analysis.level}</span>
            <strong>{analysis.name} · {analysis.role}</strong>
          </div>
          <span>
            <i aria-hidden="true" />
            {analysis.source === "cached_example"
              ? language === "es"
                ? "documento ficticio"
                : "fictional document"
              : language === "es"
                ? "copia del servidor descartada"
                : "server copy discarded"}
          </span>
        </div>
        {analysis.jobMatch ? (
          <JobMatchCard analysis={analysis.jobMatch} language={language} />
        ) : null}
        {generation ? (
          <GenerationPanel generation={generation} language={language} />
        ) : null}
        {analysis.dimensions.map((dimension, index) => (
          <DimensionCard
            key={dimension.name}
            dimension={dimension}
            language={language}
            open={openDimension === index}
            onToggle={() => onToggleDimension(index)}
          />
        ))}
      </div>
    </section>
  );
}

function GenerationPanel({
  generation,
  language,
}: {
  generation: GenerationViewState;
  language: DocumentLanguage;
}) {
  const t = copy[language].generation;
  const limitReached = generation.session.remaining === 0;

  return (
    <section className="generation-panel" aria-labelledby="generation-title">
      <div className="generation-heading">
        <div>
          <p className="eyebrow">CV · 1 → 3</p>
          <h2 id="generation-title">{t.title}</h2>
          <p>{t.intro}</p>
        </div>
        <div className="generation-counter" aria-label={`3 ${t.count}`}>
          <strong>{generation.session.count}/3</strong>
          <span>{t.count}</span>
          <small>{generation.session.remaining} {t.remaining}</small>
        </div>
      </div>

      <fieldset className="strategy-grid" disabled={generation.busy || limitReached}>
        <legend className="visually-hidden">{t.title}</legend>
        {GENERATION_STRATEGIES.map((strategy) => {
          const [label, description] = t.strategies[strategy];
          return (
            <button
              key={strategy}
              type="button"
              className={generation.strategy === strategy ? "is-selected" : undefined}
              aria-pressed={generation.strategy === strategy}
              disabled={generation.busy || limitReached}
              onClick={() => generation.onStrategyChange(strategy)}
            >
              <strong>{label}</strong>
              <span>{description}</span>
            </button>
          );
        })}
      </fieldset>

      <button
        className="primary-button generation-action"
        type="button"
        disabled={generation.busy || limitReached}
        onClick={generation.onGenerate}
      >
        {generation.busy ? t.generating : t.generate}
      </button>
      <p className="generation-privacy"><ShieldIcon aria-hidden="true" />{t.privacy}</p>
      {limitReached ? <p className="generation-complete">{t.complete}</p> : null}
      {generation.error ? <p className="generation-error" role="alert">{generation.error}</p> : null}

      {generation.current ? (
        <div className="generation-result">
          <div className="generation-result-heading">
            <p className="eyebrow">{t.current}</p>
            <button className="secondary-button" type="button" onClick={generation.onDownload}>
              {t.download}
            </button>
          </div>
          <GeneratedCvPreview cv={generation.current} language={language} />
        </div>
      ) : null}
    </section>
  );
}

function EvidenceDetails({
  evidence,
  language,
}: {
  evidence: readonly GenerationEvidence[];
  language: DocumentLanguage;
}) {
  const t = copy[language].generation;
  return (
    <details className="generation-evidence">
      <summary>{t.evidence} · {evidence.length}</summary>
      {evidence.map((item, index) => (
        <blockquote key={`${item.location}-${index}`}>
          <p>“{item.quote}”</p>
          <cite>{t.source} · {item.location}</cite>
        </blockquote>
      ))}
    </details>
  );
}

function GeneratedClaimList({
  claims,
  language,
}: {
  claims: readonly GeneratedClaim[];
  language: DocumentLanguage;
}) {
  return (
    <ul>
      {claims.map((claim, index) => (
        <li key={`${claim.text}-${index}`}>
          <span>{claim.text}</span>
          <EvidenceDetails evidence={claim.evidence} language={language} />
        </li>
      ))}
    </ul>
  );
}

function GeneratedCvPreview({
  cv,
  language,
}: {
  cv: GeneratedCv;
  language: DocumentLanguage;
}) {
  const headingId = useId();
  const headerEvidence = [
    ...(cv.header.name?.evidence ?? []),
    ...(cv.header.headline?.evidence ?? []),
    ...cv.header.contact.flatMap((item) => item.evidence),
  ];

  return (
    <article className="generated-cv" aria-labelledby={headingId} lang={cv.language}>
      <header>
        <h3 id={headingId}>{cv.header.name?.text ?? (cv.language === "es" ? "Currículum" : "Résumé")}</h3>
        {cv.header.headline ? <p>{cv.header.headline.text}</p> : null}
        {cv.header.contact.length > 0 ? (
          <address>{cv.header.contact.map((item) => item.text).join(" · ")}</address>
        ) : null}
        {headerEvidence.length > 0 ? (
          <EvidenceDetails evidence={headerEvidence} language={language} />
        ) : null}
      </header>

      {cv.summary.length > 0 ? (
        <section>
          <h4>{cv.language === "es" ? "Perfil" : "Profile"}</h4>
          <GeneratedClaimList claims={cv.summary} language={language} />
        </section>
      ) : null}

      {cv.experience.length > 0 ? (
        <section>
          <h4>{cv.language === "es" ? "Experiencia" : "Experience"}</h4>
          {cv.experience.map((entry, index) => (
            <div className="generated-entry" key={`${entry.role.text}-${index}`}>
              <h5>{entry.role.text}{entry.organization ? ` — ${entry.organization.text}` : ""}</h5>
              <p>{[entry.dates?.text, entry.location?.text].filter(Boolean).join(" · ")}</p>
              <EvidenceDetails
                evidence={[
                  ...entry.role.evidence,
                  ...(entry.organization?.evidence ?? []),
                  ...(entry.dates?.evidence ?? []),
                  ...(entry.location?.evidence ?? []),
                ]}
                language={language}
              />
              <GeneratedClaimList claims={entry.bullets} language={language} />
            </div>
          ))}
        </section>
      ) : null}

      {cv.projects.length > 0 ? (
        <section>
          <h4>{cv.language === "es" ? "Proyectos" : "Projects"}</h4>
          {cv.projects.map((project, index) => (
            <div className="generated-entry" key={`${project.name.text}-${index}`}>
              <h5>{project.name.text}{project.context ? ` — ${project.context.text}` : ""}</h5>
              {project.dates ? <p>{project.dates.text}</p> : null}
              <EvidenceDetails
                evidence={[
                  ...project.name.evidence,
                  ...(project.context?.evidence ?? []),
                  ...(project.dates?.evidence ?? []),
                ]}
                language={language}
              />
              <GeneratedClaimList claims={project.bullets} language={language} />
            </div>
          ))}
        </section>
      ) : null}

      {cv.education.length > 0 ? (
        <section>
          <h4>{cv.language === "es" ? "Educación" : "Education"}</h4>
          {cv.education.map((entry, index) => (
            <div className="generated-entry" key={`${entry.credential.text}-${index}`}>
              <h5>{entry.credential.text}{entry.institution ? ` — ${entry.institution.text}` : ""}</h5>
              {entry.dates ? <p>{entry.dates.text}</p> : null}
              <EvidenceDetails
                evidence={[
                  ...entry.credential.evidence,
                  ...(entry.institution?.evidence ?? []),
                  ...(entry.dates?.evidence ?? []),
                ]}
                language={language}
              />
              <GeneratedClaimList claims={entry.details} language={language} />
            </div>
          ))}
        </section>
      ) : null}

      {cv.skills.length > 0 ? (
        <section>
          <h4>{cv.language === "es" ? "Habilidades" : "Skills"}</h4>
          <p>{cv.skills.map((skill) => skill.text).join(" · ")}</p>
          <EvidenceDetails evidence={cv.skills.flatMap((skill) => skill.evidence)} language={language} />
        </section>
      ) : null}

      {cv.additionalSections.map((section, index) => (
        <section key={`${section.title}-${index}`}>
          <h4>{section.title}</h4>
          <GeneratedClaimList claims={section.items} language={language} />
        </section>
      ))}
    </article>
  );
}

function JobMatchCard({
  analysis,
  language,
}: {
  analysis: NonNullable<AnalysisPresentation["jobMatch"]>;
  language: DocumentLanguage;
}) {
  const t = copy[language];

  return (
    <section className="job-match-card" aria-labelledby="job-match-title">
      <div className="job-match-summary">
        <div>
          <p className="eyebrow">{t.matchTitle}</p>
          <h2 id="job-match-title">{analysis.jobTitle}</h2>
          <p>{t.matchScoreNote}</p>
        </div>
        <div className="job-match-score" aria-label={`${t.matchScore}: ${analysis.coverageScore ?? "—"} / 100`}>
          <strong>{analysis.coverageScore ?? "—"}</strong>
          <span>/ 100</span>
          <small>{t.matchScore}</small>
        </div>
      </div>
      <p className="job-match-coverage">
        {analysis.requirements.length} {language === "es" ? "requisitos citados" : "cited requirements"} · {analysis.evidenceCoveragePercent}% {t.coverage}
      </p>
      <ol className="job-requirement-list">
        {analysis.requirements.map((requirement, index) => (
          <li className={`job-requirement is-${requirement.effect}`} key={`${requirement.requirement}-${index}`}>
            <details>
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{requirement.requirement}</strong>
                <em>{requirement.coverageLabel}</em>
              </summary>
              <div className="job-requirement-detail">
                <p className="requirement-priority">{t.priority} · {requirement.priorityLabel}</p>
                <blockquote>
                  <p className="detail-label">{t.requirementEvidence}</p>
                  <p>“{requirement.requirementEvidence.quote}”</p>
                  <cite>{t.citedAt} · {requirement.requirementEvidence.location}</cite>
                </blockquote>
                <div>
                  <p className="detail-label">{t.matchFinding}</p>
                  <p>{requirement.explanation}</p>
                </div>
                {requirement.cvEvidence.length > 0 ? requirement.cvEvidence.map((evidence, evidenceIndex) => (
                  <blockquote className="job-cv-evidence" key={`${evidence.location}-${evidenceIndex}`}>
                    <p className="detail-label">{t.cvMatchEvidence}</p>
                    <p>“{evidence.quote}”</p>
                    <cite>{t.citedAt} · {evidence.location}</cite>
                  </blockquote>
                )) : (
                  <p className="job-no-evidence">{requirement.notEvaluableReason ?? t.noCvMatchEvidence}</p>
                )}
                <div className="finding-recommendation">
                  <p className="detail-label is-accent">{t.recommendation}</p>
                  <p>{requirement.recommendation}</p>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 70;
  const arc = (score / 100) * circumference;

  return (
    <div className="score-meter" role="img" aria-label={`${score} / 100`}>
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <circle className="score-track" cx="80" cy="80" r="70" />
        <circle
          className="score-value"
          cx="80"
          cy="80"
          r="70"
          strokeDasharray={`${arc} ${circumference}`}
        />
      </svg>
      <span><strong>{score}</strong><small>/ 100</small></span>
    </div>
  );
}

function DimensionCard({
  dimension,
  language,
  open,
  onToggle,
}: {
  dimension: PresentationDimension;
  language: DocumentLanguage;
  open: boolean;
  onToggle: () => void;
}) {
  const t = copy[language];
  const headingId = useId();
  const evaluable = dimension.score !== null;
  const evaluatedFindings = dimension.findings.filter(
    (finding) => finding.outcome !== "not_evaluable",
  ).length;
  const dimensionLabel = !evaluable
    ? t.notEvaluable
    : dimension.effect === "negative"
      ? t.negative
      : dimension.state === "partial"
        ? t.partialDimension
        : t.positive;

  return (
    <article className={`dimension-card is-${dimension.effect}`} aria-labelledby={headingId}>
      <h2 className="visually-hidden" id={headingId}>{dimension.name}</h2>
      <button type="button" className="dimension-trigger" onClick={onToggle} aria-expanded={open}>
        <span className="dimension-heading">
          <span>
            <strong>{dimension.name}</strong>
            <em>{dimensionLabel}</em>
          </span>
          <span className={`meter-track${evaluable ? "" : " is-empty"}`}>
            {evaluable ? <i style={{ width: `${dimension.score}%` }} /> : null}
          </span>
          <small>
            {evaluatedFindings}/{dimension.findings.length} {t.criteria} · {dimension.coveragePercent}% {t.dimensionCoverage}
          </small>
        </span>
        <span className="dimension-score">{dimension.score ?? "—"}</span>
        <span className="chevron" aria-hidden="true">{open ? "−" : "+"}</span>
        <span className="visually-hidden">{open ? t.collapse : t.expand}</span>
      </button>
      {open ? (
        <div className="dimension-detail">
          <ol className="finding-list">
            {dimension.findings.map((finding, index) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                language={language}
                ordinal={index + 1}
              />
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}

function FindingCard({
  finding,
  language,
  ordinal,
}: {
  finding: PresentationFinding;
  language: DocumentLanguage;
  ordinal: number;
}) {
  const t = copy[language];

  return (
    <li className={`finding-card is-${finding.effect}`}>
      <div className="finding-card-header">
        <div>
          <span className="finding-index" aria-hidden="true">{String(ordinal).padStart(2, "0")}</span>
          <h3>{finding.label}</h3>
        </div>
        <span className="finding-outcome">{finding.outcomeLabel}</span>
      </div>

      <div className="finding-audit">
        <span>{t.criterionWeight} · <strong>{finding.weight}%</strong></span>
        <span>
          {finding.points === null
            ? t.excludedEffect
            : `${t.scoreEffect} · ${finding.points}/100`}
        </span>
      </div>

      <div className="finding-interpretation">
        <p className="detail-label">{t.finding}</p>
        <p>{finding.explanation}</p>
      </div>

      {finding.evidence.length > 0 ? (
        <div className="finding-evidence-list">
          {finding.evidence.map((evidence, index) => (
            <blockquote className={`evidence-block is-${finding.effect}`} key={`${evidence.location}-${index}`}>
              <p className="detail-label">{t.evidence}</p>
              <p>“{evidence.quote}”</p>
              <cite>{t.citedAt} · {evidence.location}</cite>
            </blockquote>
          ))}
        </div>
      ) : (
        <div className="unavailable-evidence">
          <p className="detail-label">{t.evidence}</p>
          <p>{finding.notEvaluableReason ?? t.unavailableEvidence}</p>
        </div>
      )}

      <div className="finding-recommendation">
        <p className="detail-label is-accent">{t.recommendation}</p>
        <p>{finding.recommendation}</p>
      </div>
    </li>
  );
}
