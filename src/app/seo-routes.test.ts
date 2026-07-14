import { afterEach, describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

const originalSiteUrl = process.env.CVLENS_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.CVLENS_SITE_URL;
  } else {
    process.env.CVLENS_SITE_URL = originalSiteUrl;
  }
});

describe("SEO metadata routes", () => {
  it("publishes crawl rules against the configured origin", () => {
    process.env.CVLENS_SITE_URL = "https://cvlens.up.railway.app";

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/health"],
      },
      sitemap: "https://cvlens.up.railway.app/sitemap.xml",
      host: "https://cvlens.up.railway.app",
    });
  });

  it("lists only the canonical public home page", () => {
    process.env.CVLENS_SITE_URL = "https://cvlens.up.railway.app";

    expect(sitemap()).toEqual([
      {
        url: "https://cvlens.up.railway.app/",
        changeFrequency: "monthly",
        priority: 1,
      },
    ]);
  });
});
