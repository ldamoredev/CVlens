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
  type DocumentLanguage,
  type FictionalExample,
  type FindingEffect,
  type MockDimension,
} from "@/data/fictional-examples";
import {
  formatFileSize,
  type PreviewState,
  validateUpload,
} from "@/lib/presentation-state";

type AppState = Exclude<PreviewState, "dragging">;

interface CVLensAppProps {
  initialPreviewState: PreviewState;
}

interface FileSnapshot {
  name: string;
  size: number;
  type: string;
}

const copy = {
  es: {
    tagline: "Análisis verificable de CVs",
    navPrivacy: "no almacena",
    cvLanguage: "idioma del CV",
    kicker: "Análisis auditable",
    title: "Analizamos el documento, no a la persona.",
    subtitle:
      "Un puntaje reproducible con evidencia citada y recomendaciones accionables sobre tu CV. Sin promesas, sin magia.",
    dropTitle: "Arrastrá o seleccioná tu CV",
    dropActive: "Soltá el archivo para revisarlo",
    fileMeta: "PDF · JPG · PNG — máx. 8 MB — 1–2 páginas",
    selectFile: "Seleccionar archivo",
    privacy: "Tu CV no se almacena. Se analiza y se descarta.",
    examplesLead: "o probá un CV ficticio — sin costo",
    fictionNote:
      "Personas y documentos completamente ficticios. Datos mock revisados, sin llamadas al modelo.",
    ready: "listo para analizar",
    remove: "Quitar archivo",
    analyze: "Analizar CV",
    analyzing: "Analizando",
    loadingNote: "El documento se mantiene sólo en esta sesión y se descarta al terminar.",
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
    mockBadge: "vista mock · Fase 1",
    evaluated: "dimensiones evaluadas",
    another: "Analizar otro CV",
    finding: "Hallazgo · interpretación",
    evidence: "Evidencia · cita textual del CV ficticio",
    recommendation: "Recomendación accionable",
    positive: "+ positivo",
    negative: "− a mejorar",
    notEvaluable: "◌ no evaluable",
    expand: "Mostrar evidencia",
    collapse: "Ocultar evidencia",
    footerPrinciple:
      "Extracción probabilística, puntaje determinístico — el modelo halla evidencia; TypeScript calcula.",
    footerPrivacy: "Tu CV no se almacena. Se analiza y se descarta.",
    fictional: "persona ficticia",
  },
  en: {
    tagline: "Verifiable CV analysis",
    navPrivacy: "never stored",
    cvLanguage: "CV language",
    kicker: "Auditable analysis",
    title: "We analyze the document, not the person.",
    subtitle:
      "A reproducible score with cited evidence and actionable recommendations for your CV. No promises, no magic.",
    dropTitle: "Drag or select your CV",
    dropActive: "Drop the file to review it",
    fileMeta: "PDF · JPG · PNG — max. 8 MB — 1–2 pages",
    selectFile: "Select file",
    privacy: "Your CV is never stored. It is analyzed and discarded.",
    examplesLead: "or try a fictional CV — free",
    fictionNote: "Fully fictional people and documents. Reviewed mock data, no model calls.",
    ready: "ready to analyze",
    remove: "Remove file",
    analyze: "Analyze CV",
    analyzing: "Analyzing",
    loadingNote: "The document stays in this session only and is discarded when finished.",
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
    mockBadge: "mock view · Phase 1",
    evaluated: "dimensions evaluated",
    another: "Analyze another CV",
    finding: "Finding · interpretation",
    evidence: "Evidence · verbatim fictional CV quote",
    recommendation: "Actionable recommendation",
    positive: "+ positive",
    negative: "− needs work",
    notEvaluable: "◌ not evaluable",
    expand: "Show evidence",
    collapse: "Hide evidence",
    footerPrinciple:
      "Probabilistic extraction, deterministic scoring — the model finds evidence; TypeScript computes.",
    footerPrivacy: "Your CV is never stored. It is analyzed and discarded.",
    fictional: "fictional person",
  },
} as const;

const errorCopy = {
  es: {
    insufficient: {
      icon: "∅",
      title: "Información insuficiente",
      message:
        "La interfaz de upload está lista, pero el pipeline real se conecta en la Fase 4. Este archivo no fue leído ni enviado.",
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
      message: "Probá de nuevo en aproximadamente 2 minutos. No hace falta volver a preparar el CV.",
      action: "Volver al inicio",
      tone: "warning",
    },
  },
  en: {
    insufficient: {
      icon: "∅",
      title: "Not enough information",
      message:
        "The upload interface is ready, but the real pipeline arrives in Phase 4. This file was not read or sent.",
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
      message: "Try again in about 2 minutes. You do not need to prepare the CV again.",
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
      ? { name: "cv-rivas.pdf", size: 1.2 * 1024 * 1024, type: "application/pdf" }
      : null,
  );
  const [activeExample, setActiveExample] = useState<FictionalExample | null>(() =>
    initialExampleFor(initialPreviewState),
  );
  const [progressStep, setProgressStep] = useState(0);
  const [openDimension, setOpenDimension] = useState(0);
  const t = copy[language];

  useEffect(() => {
    if (viewState !== "loading" || initialPreviewState === "loading") return;

    const verifyTimer = window.setTimeout(() => setProgressStep(1), 650);
    const rubricTimer = window.setTimeout(() => setProgressStep(2), 1_300);
    const resultTimer = window.setTimeout(() => {
      setViewState(activeExample ? activeExample.status : "insufficient");
    }, 2_100);

    return () => {
      window.clearTimeout(verifyTimer);
      window.clearTimeout(rubricTimer);
      window.clearTimeout(resultTimer);
    };
  }, [activeExample, initialPreviewState, viewState]);

  const reset = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setViewState("idle");
    setDragActive(false);
    setSelectedFile(null);
    setActiveExample(null);
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

    setActiveExample(null);
    setSelectedFile({ name: file.name, size: file.size, type: file.type });
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
    setActiveExample(example);
    setSelectedFile(null);
    setOpenDimension(0);
    setProgressStep(0);
    setViewState("loading");
  };

  const startSelectedFile = () => {
    setActiveExample(null);
    setProgressStep(0);
    setViewState("loading");
  };

  const result = activeExample ?? initialExampleFor(viewState);
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
            documentName={activeExample?.documentName ?? selectedFile?.name ?? "cv-ejemplo.pdf"}
            language={language}
            progressStep={progressStep}
          />
        ) : viewState === "success" || viewState === "partial" ? (
          result ? (
            <ResultView
              example={result}
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
  example,
  language,
  onReset,
  openDimension,
  onToggleDimension,
}: {
  example: FictionalExample;
  language: DocumentLanguage;
  onReset: () => void;
  openDimension: number;
  onToggleDimension: (index: number) => void;
}) {
  const t = copy[language];
  const evaluated = example.dimensions.filter((dimension) => dimension.score !== null).length;

  return (
    <section className="result-layout" aria-labelledby="result-title">
      <aside className={`score-summary is-${example.status}`}>
        <p className="score-label" id="result-title">{t.overall}</p>
        <ScoreMeter score={example.overallScore} />
        <span className={`result-status is-${example.status}`}>
          <i aria-hidden="true" />{example.status === "success" ? t.complete : t.partial}
        </span>
        <span className="mock-badge">{t.mockBadge}</span>
        <p className="score-note">{t.scoreNote}</p>
        <p className="evaluated-count">{evaluated}/5 {t.evaluated}</p>
        <button className="secondary-button full-width" type="button" onClick={onReset}>{t.another}</button>
      </aside>

      <div className="dimensions-list">
        <div className="result-document-meta">
          <div>
            <span>{example.language.toUpperCase()} · {example.level}</span>
            <strong>{example.name} · {example.role}</strong>
          </div>
          <span><i aria-hidden="true" />{language === "es" ? "documento ficticio" : "fictional document"}</span>
        </div>
        {example.dimensions.map((dimension, index) => (
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

function effectLabel(effect: FindingEffect, language: DocumentLanguage) {
  const t = copy[language];
  if (effect === "positive") return t.positive;
  if (effect === "negative") return t.negative;
  return t.notEvaluable;
}

function DimensionCard({
  dimension,
  language,
  open,
  onToggle,
}: {
  dimension: MockDimension;
  language: DocumentLanguage;
  open: boolean;
  onToggle: () => void;
}) {
  const t = copy[language];
  const evaluable = dimension.score !== null;

  return (
    <article className={`dimension-card is-${dimension.effect}`}>
      <button type="button" className="dimension-trigger" onClick={onToggle} aria-expanded={open}>
        <span className="dimension-heading">
          <span><strong>{dimension.name}</strong><em>{effectLabel(dimension.effect, language)}</em></span>
          <span className={`meter-track${evaluable ? "" : " is-empty"}`}>
            {evaluable ? <i style={{ width: `${dimension.score}%` }} /> : null}
          </span>
        </span>
        <span className="dimension-score">{dimension.score ?? "—"}</span>
        <span className="chevron" aria-hidden="true">{open ? "−" : "+"}</span>
        <span className="visually-hidden">{open ? t.collapse : t.expand}</span>
      </button>
      {open ? (
        <div className="dimension-detail">
          <div>
            <p className="detail-label">{t.finding}</p>
            <p>{dimension.finding}</p>
          </div>
          <blockquote className={`evidence-block is-${dimension.effect}`}>
            <p className="detail-label">{t.evidence}</p>
            <p>{dimension.quote}</p>
          </blockquote>
          <div>
            <p className="detail-label is-accent">{t.recommendation}</p>
            <p>{dimension.recommendation}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
