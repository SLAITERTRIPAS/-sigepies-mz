export function getSystemLogo(): string {
  return "/sigep-official-logo.svg";
}

export function updateBrowserFavicon() {
  if (typeof document === "undefined") return;

  try {
    const logoToApply = "/sigep-official-logo.svg";

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }

    link.href = logoToApply;
    appleLink.href = logoToApply;
  } catch (err) {
    console.warn("Aviso ao atualizar favicon do navegador:", err);
  }
}

export function initFaviconSync() {
  if (typeof window === "undefined") return;
  updateBrowserFavicon();
}
