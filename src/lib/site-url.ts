const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(rawSiteUrl: string | undefined): URL {
  const candidate = rawSiteUrl?.trim() || LOCAL_SITE_URL;
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("CVLENS_SITE_URL must use http or https.");
  }

  if (url.username || url.password) {
    throw new Error("CVLENS_SITE_URL must not include credentials.");
  }

  return new URL(url.origin);
}

export function getSiteUrl(): URL {
  return resolveSiteUrl(process.env.CVLENS_SITE_URL);
}
