import { getSystemLogo } from "./logoService";

/**
 * Utilitário centralizado para obter o logótipo da instituição ativa,
 * garantindo injeção dinâmica no cabeçalho e rodapé de todos os documentos gerados no SIGEP,
 * assim como em todas as áreas afetadas (órgão, direção, departamento, repartição e setor).
 */
export function getActiveInstitutionLogo(activeInst?: any, currentUser?: any): string {
  if (activeInst?.logoUrl && typeof activeInst.logoUrl === "string" && !activeInst.logoUrl.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad")) {
    return activeInst.logoUrl;
  }
  if (activeInst?.logo && typeof activeInst.logo === "string" && !activeInst.logo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad")) {
    return activeInst.logo;
  }
  if (currentUser?.logoUrl && typeof currentUser.logoUrl === "string") {
    return currentUser.logoUrl;
  }
  if (currentUser?.instituicaoLogo && typeof currentUser.instituicaoLogo === "string") {
    return currentUser.instituicaoLogo;
  }
  if (typeof window !== "undefined") {
    const keys = ["sigep_active_institution", "activeInstitution", "sigep_institution"];
    for (const k of keys) {
      const stored = localStorage.getItem(k);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const foundLogo = parsed?.logo || parsed?.logoUrl || parsed?.logotipo;
          if (foundLogo && typeof foundLogo === "string" && !foundLogo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad")) {
            return foundLogo;
          }
        } catch (_) {}
      }
    }
    const adminLogo = localStorage.getItem("sigep_system_logo");
    if (adminLogo) return adminLogo;
  }
  return getSystemLogo() || "/sigep-official-logo.svg";
}

export function getActiveInstitutionName(activeInst?: any, currentUser?: any): string {
  if (activeInst?.name || activeInst?.nome) {
    return activeInst.name || activeInst.nome;
  }
  if (currentUser?.instituicao || currentUser?.institutionName || currentUser?.instituicaoNome) {
    return currentUser.instituicao || currentUser.institutionName || currentUser.instituicaoNome;
  }
  if (typeof window !== "undefined") {
    const keys = ["sigep_active_institution", "activeInstitution", "sigep_institution"];
    for (const k of keys) {
      const stored = localStorage.getItem(k);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.name || parsed?.nome) {
            return parsed.name || parsed.nome;
          }
        } catch (e) {}
      }
    }
  }
  return "Instituto Superior Politécnico de Songo";
}

export function getActiveProvinceName(activeInst?: any, currentUser?: any): string {
  if (activeInst?.province || activeInst?.provincia) {
    return activeInst.province || activeInst.provincia;
  }
  if (currentUser?.provincia || currentUser?.province) {
    return currentUser.provincia || currentUser.province;
  }
  if (typeof window !== "undefined") {
    const keys = ["sigep_active_institution", "activeInstitution", "sigep_institution"];
    for (const k of keys) {
      const stored = localStorage.getItem(k);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.province || parsed?.provincia) {
            return parsed.province || parsed.provincia;
          }
        } catch (e) {}
      }
    }
  }
  return "Tete";
}
