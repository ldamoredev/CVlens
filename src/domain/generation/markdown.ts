import type {
  GeneratedClaim,
  GeneratedCv,
  GeneratedEntity,
} from "./contract";

function entity(value: GeneratedEntity | null): string | null {
  return value?.text ?? null;
}

function claims(values: readonly GeneratedClaim[]): string[] {
  return values.map((value) => `- ${value.text}`);
}

function heading(title: string, body: readonly string[]): string[] {
  return body.length === 0 ? [] : [`## ${title}`, "", ...body, ""];
}

export function generatedCvToMarkdown(cv: GeneratedCv): string {
  const lines: string[] = [];
  const name = entity(cv.header.name);
  lines.push(`# ${name ?? (cv.language === "es" ? "Currículum" : "Résumé")}`, "");

  if (cv.header.headline) lines.push(cv.header.headline.text, "");
  if (cv.header.contact.length > 0) {
    lines.push(cv.header.contact.map((item) => item.text).join(" · "), "");
  }

  lines.push(
    ...heading(cv.language === "es" ? "Perfil" : "Profile", claims(cv.summary)),
  );

  const experienceLines = cv.experience.flatMap((entry) => {
    const context = [entity(entry.organization), entity(entry.location)]
      .filter((value): value is string => value !== null)
      .join(" · ");
    const title = context ? `### ${entry.role.text} — ${context}` : `### ${entry.role.text}`;
    return [
      title,
      ...(entry.dates ? [`*${entry.dates.text}*`] : []),
      ...claims(entry.bullets),
      "",
    ];
  });
  lines.push(...heading(cv.language === "es" ? "Experiencia" : "Experience", experienceLines));

  const projectLines = cv.projects.flatMap((project) => [
    `### ${project.name.text}${project.context ? ` — ${project.context.text}` : ""}`,
    ...(project.dates ? [`*${project.dates.text}*`] : []),
    ...claims(project.bullets),
    "",
  ]);
  lines.push(...heading(cv.language === "es" ? "Proyectos" : "Projects", projectLines));

  const educationLines = cv.education.flatMap((entry) => {
    const institution = entity(entry.institution);
    return [
      `### ${entry.credential.text}${institution ? ` — ${institution}` : ""}`,
      ...(entry.dates ? [`*${entry.dates.text}*`] : []),
      ...claims(entry.details),
      "",
    ];
  });
  lines.push(...heading(cv.language === "es" ? "Educación" : "Education", educationLines));

  lines.push(
    ...heading(
      cv.language === "es" ? "Habilidades" : "Skills",
      cv.skills.length > 0 ? [cv.skills.map((skill) => skill.text).join(" · ")] : [],
    ),
  );

  for (const section of cv.additionalSections) {
    lines.push(...heading(section.title, claims(section.items)));
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
