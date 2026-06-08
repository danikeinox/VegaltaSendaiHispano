const EXTRA_OFFSET = 12;

export function getHeaderOffset(): number {
  const header =
    document.getElementById("site-header") ??
    document.querySelector("header");
  return (header?.getBoundingClientRect().height ?? 72) + EXTRA_OFFSET;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(
  sectionId: string | null,
  behavior?: ScrollBehavior
): void {
  const scrollBehavior =
    behavior ?? (prefersReducedMotion() ? "auto" : "smooth");

  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
    return;
  }

  const target = document.getElementById(sectionId);
  if (!target) return;

  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    getHeaderOffset();

  window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior });
}

export function updateSectionHash(sectionId: string | null): void {
  const hash = sectionId ? `#${sectionId}` : "";
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${hash}`
  );
}

export function parseSectionHref(href: string): {
  path: string;
  sectionId: string | null;
} {
  const [path, hash] = href.split("#");
  return {
    path: path || "/",
    sectionId: hash || null,
  };
}

export function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}
