import type { JobMatchExtraction } from "../domain/job-match/contract";
import type { FictionalExampleId } from "./cached-example-extractions";

export interface CachedJobMatchFixture {
  extraction: JobMatchExtraction;
  jobPath: string;
  jobTitle: string;
}

export const cachedJobMatchFixtures: Record<
  FictionalExampleId,
  CachedJobMatchFixture
> = {
  "alex-kessler": {
    jobPath: "fixtures/jobs/alex-frontend-en.md",
    jobTitle: "Junior Frontend Developer",
    extraction: {
      schemaVersion: "1.0",
      requirements: [
        {
          requirement: "Hands-on React and TypeScript experience",
          priority: "required",
          requirementEvidence: {
            quote: "We require hands-on React and TypeScript experience.",
            location: "Requirements",
          },
          coverage: "covered",
          explanation: "The project evidence explicitly shows React and TypeScript use.",
          cvEvidence: [{
            quote: "Built a responsive events directory with React and TypeScript.",
            location: "Projects — Community Events Board",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Accessible keyboard interactions",
          priority: "required",
          requirementEvidence: {
            quote: "You must have experience building accessible keyboard interactions.",
            location: "Requirements",
          },
          coverage: "covered",
          explanation: "The same project explicitly documents keyboard navigation and accessibility checks.",
          cvEvidence: [{
            quote: "Added keyboard navigation and automated accessibility checks.",
            location: "Projects — Community Events Board",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Next.js experience",
          priority: "preferred",
          requirementEvidence: {
            quote: "Next.js experience is preferred.",
            location: "Requirements",
          },
          coverage: "partial",
          explanation: "Next.js appears in the skills list, but the CV does not connect it to a role or project.",
          cvEvidence: [{
            quote: "React, TypeScript, Next.js, Node.js, PostgreSQL, Docker, Git, Playwright",
            location: "Skills",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Production analytics experience",
          priority: "preferred",
          requirementEvidence: {
            quote: "Experience running production analytics is preferred.",
            location: "Requirements",
          },
          coverage: "not_demonstrated",
          explanation: "Supporting production analytics evidence was not found in this CV.",
          cvEvidence: [],
          notEvaluableReason: null,
        },
      ],
    },
  },
  "marina-rivas": {
    jobPath: "fixtures/jobs/marina-backend-es.md",
    jobTitle: "Senior Backend Engineer",
    extraction: {
      schemaVersion: "1.0",
      requirements: [
        {
          requirement: "Experiencia con Node.js y TypeScript",
          priority: "required",
          requirementEvidence: {
            quote: "Experiencia comprobable con Node.js y TypeScript es obligatoria.",
            location: "Requisitos",
          },
          coverage: "partial",
          explanation: "Node.js y TypeScript figuran en habilidades, pero el CV no los vincula explícitamente con una experiencia.",
          cvEvidence: [{
            quote: "Node.js / TypeScript",
            location: "Habilidades",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Contenedores y despliegues",
          priority: "required",
          requirementEvidence: {
            quote: "Se requiere experiencia con contenedores y despliegues.",
            location: "Requisitos",
          },
          coverage: "covered",
          explanation: "La experiencia cita una migración del pipeline a contenedores y su impacto en despliegues.",
          cvEvidence: [{
            quote: "Reduje el tiempo de despliegue de 40 a 12 minutos migrando el pipeline a contenedores.",
            location: "Experiencia — Senior Backend Engineer",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Mejoras medibles de rendimiento",
          priority: "required",
          requirementEvidence: {
            quote: "Debe demostrar mejoras medibles de rendimiento.",
            location: "Requisitos",
          },
          coverage: "covered",
          explanation: "El CV documenta una reducción cuantificada de latencia.",
          cvEvidence: [{
            quote: "Diseñé una estrategia de caché que redujo la latencia p95 un 31%.",
            location: "Experiencia — Senior Backend Engineer",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Experiencia con GraphQL",
          priority: "preferred",
          requirementEvidence: {
            quote: "Se valora experiencia con GraphQL.",
            location: "Requisitos",
          },
          coverage: "not_demonstrated",
          explanation: "No se encontró evidencia de GraphQL en este CV.",
          cvEvidence: [],
          notEvaluableReason: null,
        },
      ],
    },
  },
  "dayo-okafor": {
    jobPath: "fixtures/jobs/dayo-fullstack-en.md",
    jobTitle: "Full-stack Engineer",
    extraction: {
      schemaVersion: "1.0",
      requirements: [
        {
          requirement: "React and TypeScript experience",
          priority: "required",
          requirementEvidence: {
            quote: "React and TypeScript experience is required.",
            location: "Requirements",
          },
          coverage: "covered",
          explanation: "The CV explicitly documents maintaining portals built with both technologies.",
          cvEvidence: [{
            quote: "Maintained customer portals built with React and TypeScript.",
            location: "Experience — Software Engineer",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Backend development with Node.js",
          priority: "required",
          requirementEvidence: {
            quote: "Backend development with Node.js is required.",
            location: "Requirements",
          },
          coverage: "covered",
          explanation: "The CV shows typed API work across a Node.js application.",
          cvEvidence: [{
            quote: "Introduced typed API contracts across the React and Node.js applications.",
            location: "Experience — Full-stack Engineer",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "PostgreSQL experience",
          priority: "required",
          requirementEvidence: {
            quote: "PostgreSQL experience is required.",
            location: "Requirements",
          },
          coverage: "covered",
          explanation: "The CV explicitly documents creating PostgreSQL reports.",
          cvEvidence: [{
            quote: "Created PostgreSQL reports for the operations team.",
            location: "Experience — Software Engineer",
          }],
          notEvaluableReason: null,
        },
        {
          requirement: "Kubernetes experience",
          priority: "preferred",
          requirementEvidence: {
            quote: "Experience with Kubernetes is preferred.",
            location: "Requirements",
          },
          coverage: "not_demonstrated",
          explanation: "Supporting Kubernetes evidence was not found in this CV.",
          cvEvidence: [],
          notEvaluableReason: null,
        },
      ],
    },
  },
};
