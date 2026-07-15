import sharp from "sharp";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";
const strategies = ["ats_focused", "ats_focused", "ats_focused"];

const fictionalCvSvg = Buffer.from(`<svg width="900" height="1200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  <g fill="#111827" font-family="Arial, sans-serif">
    <text x="70" y="90" font-size="38" font-weight="700">Alex Example</text>
    <text x="70" y="132" font-size="22">Frontend Developer</text>
    <text x="70" y="205" font-size="25" font-weight="700">PROFILE</text>
    <text x="70" y="242" font-size="19">Frontend developer building accessible product interfaces.</text>
    <text x="70" y="315" font-size="25" font-weight="700">EXPERIENCE</text>
    <text x="70" y="355" font-size="21" font-weight="700">Frontend Developer — Northwind Studio</text>
    <text x="70" y="387" font-size="18">January 2023–Present</text>
    <text x="85" y="430" font-size="18">• Built reusable React components for the customer account area.</text>
    <text x="85" y="465" font-size="18">• Improved checkout completion by 18% through clearer form feedback.</text>
    <text x="70" y="545" font-size="25" font-weight="700">PROJECTS</text>
    <text x="70" y="585" font-size="21" font-weight="700">Community Events Board</text>
    <text x="85" y="625" font-size="18">• Added keyboard navigation and automated accessibility checks.</text>
    <text x="70" y="705" font-size="25" font-weight="700">SKILLS</text>
    <text x="70" y="745" font-size="19">TypeScript · React · CSS · Accessibility testing</text>
    <text x="70" y="825" font-size="25" font-weight="700">EDUCATION</text>
    <text x="70" y="865" font-size="19">Web Development Certificate — Fictional Technology Institute — 2022</text>
  </g>
</svg>`);

const png = await sharp(fictionalCvSvg).png().toBuffer();
const sourceFile = new File([png], "fictional-generation-smoke.png", {
  type: "image/png",
});

async function post(path, fields) {
  const formData = new FormData();
  for (const [name, value] of fields) formData.append(name, value);
  const response = await fetch(`${baseUrl}${path}`, { method: "POST", body: formData });
  const body = await response.json();
  if (!response.ok) {
    const code = typeof body?.error?.code === "string" ? body.error.code : "unknown";
    throw new Error(`${path} failed with HTTP ${response.status} (${code})`);
  }
  return body;
}

const analysis = await post("/api/analyze", [["file", sourceFile]]);
let session = analysis.generationSession;
const results = [];

for (const strategy of strategies) {
  const response = await post("/api/generate", [
    ["file", sourceFile],
    ["generationToken", session.token],
    ["strategy", strategy],
  ]);
  session = response.session;
  results.push({
    strategy: response.generation.strategy,
    generationIsArray: Array.isArray(response.generation),
    count: session.count,
    remaining: session.remaining,
    usedStrategies: session.usedStrategies,
  });
}

console.log(JSON.stringify({
  analysis: {
    hasGenerationToken: typeof analysis.generationSession?.token === "string",
    initialCount: analysis.generationSession?.count,
    initialRemaining: analysis.generationSession?.remaining,
  },
  generations: results,
}, null, 2));
