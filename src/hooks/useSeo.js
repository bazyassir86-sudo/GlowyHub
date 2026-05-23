import { useEffect } from "react";

export function useSeo({ title, description, path = "/" }) {
  useEffect(() => {
    const siteTitle = title ? `${title} | GlowyHub` : "GlowyHub";
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    document.title = siteTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description || "Discover and download indie games on GlowyHub.");

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${siteUrl}${path}`);
  }, [description, path, title]);
}
