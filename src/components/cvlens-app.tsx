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
import { scoreExtraction } from "@/domain/rubric/rubric";
import { apiErrorState } from "@/lib/api-error-state";
import {
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
    positive: "+ positivo",
    negative: "− a mejorar",
    partialDimension: "◐ parcial",
    notEvaluable: "◌ no evaluable",
    expand: "Mostrar evidencia",
    collapse: "Ocultar evidencia",
    footerPrinciple:
      "Extracción probabilística, puntaje determinístico — el modelo halla evidencia; TypeScript calcula.",
    footerPrivacy: "CVLens no guarda tu CV; Anthropic lo procesa para realizar el análisis.",
    fictional: "persona ficticia",
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
    positive: "+ positive",
    negative: "− needs work",
    partialDimension: "◐ partial",
    notEvaluable: "◌ not evaluable",
    expand: "Show evidence",
    collapse: "Hide evidence",
    footerPrinciple:
      "Probabilistic extraction, deterministic scoring — the model finds evidence; TypeScript computes.",
    footerPrivacy: "CVLens does not store your CV; Anthropic processes it for the analysis.",
    fictional: "fictional person",
  },
} as const;

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

function isErrorState(
  state: AppState,
): state is "file_too_large" | "insufficient" | "invalid_format" | "rate_limited" | "technical_error" {
  return [
    "file_too_large",
    "insufficient",
    "invalid_format",
    "rate_limited",
    "technical_error",
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
  const [progressStep, setProgressStep] = useState(0);
  const [openDimension, setOpenDimension] = useState(0);
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
    setProgressStep(0);
    setOpenDimension(0);
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
      });

      if (!result) {
        setViewState("insufficient");
        return;
      }

      setLanguage(result.language);
      setActiveResult(result);
      setOpenDimension(0);
      setViewState(result.status);
    } catch {
      setViewState("technical_error");
    } finally {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleTheme = () => {
    const currentTheme: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const result = activeResult ?? initialExampleFor(viewState);
  const documentFlow = viewState === "loading" || viewState === "partial" || viewState === "success";

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
            <div className="language-switch" aria-label="Idioma de la interfaz">
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

            <div className="examples-section">
              <p className="examples-lead">{t.examplesLead}</p>
              <div className="examples-grid">
                {fictionalExamples.map((example) => (
                  <ExampleCard key={example.id} example={example} onSelect={selectExample} />
                ))}
              </div>
              <p className="fiction-note">{t.fictionNote}</p>
            </div>
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
}: {
  file: FileSnapshot;
  language: DocumentLanguage;
  onAnalyze: () => void;
  onRemove: () => void;
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
      <button className="primary-button selected-analyze" type="button" onClick={onAnalyze}>
        {t.analyze}
      </button>
      <p className="selected-privacy"><ShieldIcon aria-hidden="true" />{t.privacy}</p>
    </div>
  );
}

function StatusPanel({
  state,
  language,
  onReset,
}: {
  state: "file_too_large" | "insufficient" | "invalid_format" | "rate_limited" | "technical_error";
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
      <p className="eyebrow" id="loading-title">{t.analyzing}</p>
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
}: {
  analysis: AnalysisPresentation;
  language: DocumentLanguage;
  onReset: () => void;
  openDimension: number;
  onToggleDimension: (index: number) => void;
}) {
  const t = copy[language];
  const evaluated = analysis.dimensions.filter((dimension) => dimension.score !== null).length;
  const sourceBadge =
    analysis.source === "cached_example" ? t.cachedBadge : t.liveBadge;

  return (
    <section className="result-layout" aria-labelledby="result-title">
      <aside className={`score-summary is-${analysis.status}`}>
        <p className="score-label" id="result-title">{t.overall}</p>
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
                ? "archivo descartado"
                : "file discarded"}
          </span>
        </div>
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
    <article className={`dimension-card is-${dimension.effect}`}>
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
