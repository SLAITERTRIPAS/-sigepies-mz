import { doc, setDoc, getDocs, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { isSuperBossUser } from "./auth";
import { PeriodoPlanificacao } from "../types";

const currentYear = new Date().getFullYear();

export const DEFAULT_PLANNING_PERIOD: PeriodoPlanificacao = {
  id: "periodo_planificacao_atual",
  ano: currentYear,
  // Período de planificação dos setores por defeito: 1 de Abril a 30 de Abril (1 mês)
  dataInicioPlanificacao: `${currentYear}-04-01`,
  dataFimPlanificacao: `${currentYear}-04-30`,
  // Período de relatório por defeito: 1 de Janeiro a 31 de Março (3 meses)
  dataInicioRelatorioSemestral: `${currentYear}-01-01`,
  dataFimRelatorioSemestral: `${currentYear}-03-31`,
  status: "aberto",
  statusRelatorio: "aberto",
  definidoPor: "Chefe do DPEP / Técnico de Planificação",
  cargoDefinidor: "DPEP / Repartição de Planificação",
  setorDefinidor: "Repartição de Planificação",
  observacoes: "Período regulamentar de planificação e relatórios.",
  extensaoFase1Usada: false,
  extensaoFase2Usada: false,
  diasExtensaoTotal: 0,
  autoSubmetido: false,
  // Cronograma de Prazos e Tramitação programado por DPEP
  prazoSubmissaoSetorial: `${currentYear}-04-30`,
  prazoConsolidacaoDPEP: `${currentYear}-05-15`,
  prazoParecerTecnico: `${currentYear}-05-30`,
  prazoAprovacaoGeral: `${currentYear}-06-15`,
};

const LOCAL_STORAGE_KEY = "sigep_periodo_planificacao";

export function canManagePeriodoPlanificacao(user: any): boolean {
  if (!user) return false;
  if (isSuperBossUser(user)) return true;

  const role = String(user.role || "").toUpperCase();
  const cargo = String(user.cargo || "").toUpperCase();
  const cargoChefia = String(user.cargoChefia || "").toUpperCase();
  const dept = String(user.departamento || "").toUpperCase();
  const rep = String(user.reparticao || "").toUpperCase();
  const setor = String(user.setor || "").toUpperCase();
  const title = String(user.title || "").toUpperCase();

  // Chefe do DPEP ou Técnico de Planificação / Repartição de Planificação
  const isChefeDPEP =
    cargoChefia.includes("DPEP") ||
    cargo.includes("DPEP") ||
    title.includes("DPEP") ||
    cargoChefia.includes("GABINETE DO CHEFE") ||
    cargo.includes("GABINETE DO CHEFE") ||
    cargoChefia.includes("PLANIFICAÇÃO, ESTUDOS E PROJETOS") ||
    cargoChefia.includes("PLANIFICACAO, ESTUDOS E PROJECTOS") ||
    cargo.includes("CHEFE DO DPEP") ||
    cargo.includes("CHEFE DO DEPARTAMENTO DE PLANIFICAÇÃO") ||
    cargo.includes("CHEFE DO DEPARTAMENTO DE PLANIFICACAO") ||
    (dept.includes("PLANIFICAÇÃO") && (cargoChefia.includes("CHEFE") || cargo.includes("CHEFE") || user.isChefia));

  const isTecnicoPlanificacao =
    cargo.includes("TÉCNICO DE PLANIFICAÇÃO") ||
    cargo.includes("TECNICO DE PLANIFICACAO") ||
    cargo.includes("TÉCNICO DE PLANIFICAÇÃO E ESTATÍSTICA") ||
    cargo.includes("TECNICO DE PLANIFICACAO E ESTATISTICA") ||
    title.includes("PLANIFICAÇÃO") ||
    title.includes("PLANIFICACAO") ||
    role.includes("PLANIFICAÇÃO") ||
    role.includes("PLANIFICACAO") ||
    rep.includes("PLANIFICAÇÃO") ||
    rep.includes("PLANIFICACAO") ||
    setor.includes("PLANIFICAÇÃO") ||
    setor.includes("PLANIFICACAO") ||
    dept.includes("PLANIFICAÇÃO") ||
    dept.includes("PLANIFICACAO");

  return isChefeDPEP || isTecnicoPlanificacao;
}

// Verifica se o utilizador é Chefe do DPEP
export function isChefeDPEP(user: any): boolean {
  if (!user) return false;
  const cargo = String(user.cargo || "").toUpperCase();
  const cargoChefia = String(user.cargoChefia || "").toUpperCase();
  const title = String(user.title || "").toUpperCase();
  
  return (
    cargo.includes("CHEFE DO DPEP") ||
    cargoChefia.includes("CHEFE DO DPEP") ||
    title.includes("CHEFE DO DPEP") ||
    cargo.includes("CHEFE DO DEPARTAMENTO DE PLANIFICAÇÃO") ||
    cargo.includes("CHEFE DO DEPARTAMENTO DE PLANIFICACAO")
  );
}

export function isPlanificacaoAberta(periodo: PeriodoPlanificacao | null): { aberta: boolean; motivo?: string } {
  if (!periodo) {
    return { aberta: true };
  }

  if (periodo.status === "fechado") {
    return {
      aberta: false,
      motivo: "O período de planificação encerrado, aguarde a atualização do calendário, assim como o relatório semestral.",
    };
  }

  if (periodo.dataInicioPlanificacao && periodo.dataFimPlanificacao) {
    const today = new Date().toISOString().split("T")[0];
    if (today < periodo.dataInicioPlanificacao) {
      return {
        aberta: false,
        motivo: `O período de planificação encerrado, aguarde a atualização do calendário, assim como o relatório semestral.`,
      };
    }
    if (today > periodo.dataFimPlanificacao) {
      return {
        aberta: false,
        motivo: "O período de planificação encerrado, aguarde a atualização do calendário, assim como o relatório semestral.",
      };
    }
  }

  return { aberta: true };
}

export function isRelatorioSemestralAberto(periodo: PeriodoPlanificacao | null): { aberto: boolean; motivo?: string } {
  if (!periodo) {
    return { aberto: true };
  }

  if (periodo.statusRelatorio === "fechado") {
    return {
      aberto: false,
      motivo: "O período de relatório semestral encontra-se encerrado. Aguarde a atualização do calendário.",
    };
  }

  if (periodo.dataInicioRelatorioSemestral && periodo.dataFimRelatorioSemestral) {
    const today = new Date().toISOString().split("T")[0];
    if (today < periodo.dataInicioRelatorioSemestral) {
      return {
        aberto: false,
        motivo: `O período de relatório semestral ainda não iniciou (Inicia em ${periodo.dataInicioRelatorioSemestral}).`,
      };
    }
    if (today > periodo.dataFimRelatorioSemestral) {
      return {
        aberto: false,
        motivo: "O período de relatório semestral encontra-se encerrado. Aguarde a atualização do calendário.",
      };
    }
  }

  return { aberto: true };
}

export function subscribePeriodoPlanificacao(callback: (periodo: PeriodoPlanificacao) => void, departamentoId?: string): () => void {
  const docPath = departamentoId 
    ? `configuracoes/periodo_planificacao_${departamentoId.toLowerCase().replace(/\s+/g, "_")}`
    : "configuracoes/periodo_planificacao";
  
  const docRef = doc(db, docPath.split("/")[0], docPath.split("/")[1]);

  // Initial local storage read
  try {
    const localKey = departamentoId ? `${LOCAL_STORAGE_KEY}_${departamentoId}` : LOCAL_STORAGE_KEY;
    const local = localStorage.getItem(localKey);
    if (local) {
      callback({ ...DEFAULT_PLANNING_PERIOD, ...JSON.parse(local) });
    } else {
      callback(DEFAULT_PLANNING_PERIOD);
    }
  } catch (e) {
    callback(DEFAULT_PLANNING_PERIOD);
  }

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PeriodoPlanificacao;
        const merged = { ...DEFAULT_PLANNING_PERIOD, ...data, id: snapshot.id };
        try {
          const localKey = departamentoId ? `${LOCAL_STORAGE_KEY}_${departamentoId}` : LOCAL_STORAGE_KEY;
          localStorage.setItem(localKey, JSON.stringify(merged));
        } catch (_) {}
        callback(merged);
      } else {
        // Se não existir um específico para o departamento, tenta o global se estivermos buscando um específico
        if (departamentoId) {
          const globalRef = doc(db, "configuracoes", "periodo_planificacao");
          onSnapshot(globalRef, (globalSnap) => {
             if (globalSnap.exists()) {
               const gData = globalSnap.data() as PeriodoPlanificacao;
               callback({ ...DEFAULT_PLANNING_PERIOD, ...gData, id: globalSnap.id });
             } else {
               callback(DEFAULT_PLANNING_PERIOD);
             }
          });
        } else {
          callback(DEFAULT_PLANNING_PERIOD);
        }
      }
    },
    (error) => {
      console.warn("Aviso ao subscrever período de planificação:", error);
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          callback({ ...DEFAULT_PLANNING_PERIOD, ...JSON.parse(local) });
        } else {
          callback(DEFAULT_PLANNING_PERIOD);
        }
      } catch (_) {
        callback(DEFAULT_PLANNING_PERIOD);
      }
    }
  );
}

export async function savePeriodoPlanificacao(
  periodo: Partial<PeriodoPlanificacao>,
  user?: any
): Promise<void> {
  const docRef = doc(db, "configuracoes", "periodo_planificacao");
  const payload: Partial<PeriodoPlanificacao> = {
    ...periodo,
    ano: periodo.ano || new Date().getFullYear(),
    definidoPor: user?.nome || user?.name || user?.email || periodo.definidoPor || "Chefe do DPEP / Técnico de Planificação",
    cargoDefinidor: user?.cargo || user?.cargoChefia || periodo.cargoDefinidor || "DPEP / Repartição de Planificação",
    setorDefinidor: user?.departamento || user?.reparticao || user?.setor || periodo.setorDefinidor || "Repartição de Planificação",
    updatedAt: serverTimestamp(),
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...DEFAULT_PLANNING_PERIOD, ...payload }));
  } catch (_) {}

  await setDoc(docRef, payload, { merge: true });

  try {
    const eventDocRef = doc(db, "calendar_events", "evento_periodo_planificacao");
    await setDoc(
      eventDocRef,
      {
        title: `Período Oficial de Planificação Setorial - ${payload.ano || new Date().getFullYear()}`,
        type: "Início e Fechamento de Atividade",
        agenda: `Período Oficial de Abertura e Fechamento do Ciclo de Planificação Setorial. Status: ${payload.status === "aberto" ? "Aberto (30 Dias)" : "Encerrado"}. Datas: ${payload.dataInicioPlanificacao} até ${payload.dataFimPlanificacao}`,
        date: payload.dataInicioPlanificacao || `${new Date().getFullYear()}-04-01`,
        startTime: "07:30",
        endTime: "15:30",
        location: "DPEP / Todas Unidades Orgânicas",
        participants: "Todos os Setores, Repartições, Departamentos e Direções",
        isPlanningPeriodEvent: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Aviso ao sincronizar evento no calendário:", err);
  }
}

// Ativa a contagem de 30 dias a partir do dia do clique para a planificação
export async function ativarContagem30DiasPlanificacao(user?: any): Promise<void> {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  await savePeriodoPlanificacao(
    {
      dataInicioPlanificacao: startStr,
      dataFimPlanificacao: endStr,
      status: "aberto",
      observacoes: `Período de planificação ativado em ${startStr} com duração de 30 dias (término em ${endStr}).`,
    },
    user
  );
}

// Ativa a contagem de 3 meses para o relatório (1 de Janeiro a 31 de Março ou 90 dias a partir de hoje)
export async function ativarPeriodoRelatorio(user?: any): Promise<void> {
  const currentYr = new Date().getFullYear();
  // Por regra: 1 de Janeiro a 31 de Março do ano atual (3 meses)
  const startStr = `${currentYr}-01-01`;
  const endStr = `${currentYr}-03-31`;

  await savePeriodoPlanificacao(
    {
      dataInicioRelatorioSemestral: startStr,
      dataFimRelatorioSemestral: endStr,
      statusRelatorio: "aberto",
      observacoes: `Período de relatórios semestrais ativado para o intervalo de 1 de Janeiro a 31 de Março de ${currentYr}.`,
    },
    user
  );
}

export interface EstagioCiclo {
  mesNumero: 1 | 2 | 3;
  mesNome: string;
  mesCod: string; // e.g., '01', '04'
  fase: string;
  descricao: string;
  responsavel: string;
  acaoEsperada: string;
}

export function getCicloRelatorioEstrutura(ano: number = currentYear): EstagioCiclo[] {
  return [
    {
      mesNumero: 1,
      mesNome: "Janeiro",
      mesCod: `${ano}-01`,
      fase: "Produção e Envio Setorial",
      descricao: "Produção de relatórios por cada setor e envio à Repartição / Setor de Relatórios.",
      responsavel: "Todos os Setores, Repartições e Departamentos",
      acaoEsperada: "Elaboração e envio dos relatórios de desempenho setoriais.",
    },
    {
      mesNumero: 2,
      mesNome: "Fevereiro",
      mesCod: `${ano}-02`,
      fase: "Compilação Institucional",
      descricao: "O setor de relatórios compila todas as contribuições e transforma no Relatório Institucional.",
      responsavel: "Setor / Repartição de Relatórios & DPEP",
      acaoEsperada: "Consolidação e harmonização dos relatórios no documento institucional único.",
    },
    {
      mesNumero: 3,
      mesNome: "Março",
      mesCod: `${ano}-03`,
      fase: "Submissão, Aprovação e Impressão",
      descricao: "Submissão para aprovação superior e impressão final do Relatório Institucional.",
      responsavel: "Direção Geral & DPEP",
      acaoEsperada: "Aprovação final, chancela institucional e impressão.",
    },
  ];
}

export function getCicloPlanoEstrutura(ano: number = currentYear): EstagioCiclo[] {
  return [
    {
      mesNumero: 1,
      mesNome: "Abril",
      mesCod: `${ano}-04`,
      fase: "Planificação Setorial e Envio",
      descricao: "Planificação setorial pelas unidades e envio ao setor de planificação (DPEP).",
      responsavel: "Todos os Setores, Repartições e Departamentos",
      acaoEsperada: "Inserção das atividades, metas e orçamentos setoriais (30 dias).",
    },
    {
      mesNumero: 2,
      mesNome: "Maio",
      mesCod: `${ano}-05`,
      fase: "Compilação e Plano Institucional",
      descricao: "O setor de planificação compila as propostas e transforma no Plano Institucional.",
      responsavel: "Repartição de Planificação & DPEP",
      acaoEsperada: "Análise técnica, alocação de programas e elaboração da Matriz Institucional.",
    },
    {
      mesNumero: 3,
      mesNome: "Junho",
      mesCod: `${ano}-06`,
      fase: "Submissão, Aprovação e Publicação",
      descricao: "Submissão formal, aprovação pelas instâncias superiores e publicação oficial do Plano.",
      responsavel: "Direção Geral & DPEP",
      acaoEsperada: "Aprovação do Plano de Atividades e publicação para execução.",
    },
  ];
}

/**
 * Retorna o estágio atual do ciclo de relatórios ou planificação com base na data do sistema.
 */
export function getEstagioAtualRelatorio(date: Date = new Date()): EstagioCiclo | null {
  const month = date.getMonth() + 1; // 1-12
  const ano = date.getFullYear();
  const estrutura = getCicloRelatorioEstrutura(ano);

  if (month === 1) return estrutura[0];
  if (month === 2) return estrutura[1];
  if (month === 3) return estrutura[2];
  return null;
}

export function getEstagioAtualPlano(date: Date = new Date()): EstagioCiclo | null {
  const month = date.getMonth() + 1; // 1-12
  const ano = date.getFullYear();
  const estrutura = getCicloPlanoEstrutura(ano);

  if (month === 4) return estrutura[0];
  if (month === 5) return estrutura[1];
  if (month === 6) return estrutura[2];
  return null;
}


export async function alternarStatusRelatorio(statusAtual: "aberto" | "fechado", user?: any): Promise<void> {
  const novoStatus = statusAtual === "aberto" ? "fechado" : "aberto";
  await savePeriodoPlanificacao({ statusRelatorio: novoStatus }, user);
}

/**
 * Extensão do prazo de planificação em duas fases:
 * - 1ª Fase: +7 Dias
 * - 2ª Fase: +5 Dias
 * Após a utilização das duas fases, o prazo não pode mais ser estendido.
 */
export async function estenderPrazoPlanificacao(
  fase: 1 | 2,
  periodoAtual: PeriodoPlanificacao,
  user?: any
): Promise<{ success: boolean; message: string }> {
  if (fase === 1) {
    if (periodoAtual.extensaoFase1Usada) {
      return { success: false, message: "A extensão da 1ª Fase (7 dias) já foi utilizada anteriormente." };
    }

    const currentEndDateStr = periodoAtual.dataFimPlanificacao || new Date().toISOString().split("T")[0];
    const currentEndDate = new Date(currentEndDateStr);
    currentEndDate.setDate(currentEndDate.getDate() + 7);
    const newEndStr = currentEndDate.toISOString().split("T")[0];

    const totalExt = (periodoAtual.diasExtensaoTotal || 0) + 7;

    await savePeriodoPlanificacao(
      {
        dataFimPlanificacao: newEndStr,
        status: "aberto",
        extensaoFase1Usada: true,
        diasExtensaoTotal: totalExt,
        observacoes: `Prazo estendido (1ª Fase - +7 Dias). Novo término: ${newEndStr}.`,
      },
      user
    );

    return {
      success: true,
      message: `Sucesso! O prazo de planificação foi estendido em 7 dias até ${newEndStr} (1ª Fase).`,
    };
  }

  if (fase === 2) {
    if (!periodoAtual.extensaoFase1Usada) {
      return {
        success: false,
        message: "Deve utilizar primeiro a extensão da 1ª Fase (7 dias) antes de aplicar a 2ª Fase.",
      };
    }
    if (periodoAtual.extensaoFase2Usada) {
      return {
        success: false,
        message: "A extensão da 2ª Fase (5 dias) já foi utilizada. Todas as fases de extensão foram esgotadas.",
      };
    }

    const currentEndDateStr = periodoAtual.dataFimPlanificacao || new Date().toISOString().split("T")[0];
    const currentEndDate = new Date(currentEndDateStr);
    currentEndDate.setDate(currentEndDate.getDate() + 5);
    const newEndStr = currentEndDate.toISOString().split("T")[0];

    const totalExt = (periodoAtual.diasExtensaoTotal || 0) + 5;

    await savePeriodoPlanificacao(
      {
        dataFimPlanificacao: newEndStr,
        status: "aberto",
        extensaoFase2Usada: true,
        diasExtensaoTotal: totalExt,
        observacoes: `Prazo estendido (2ª Fase Final - +5 Dias). Novo término definitivo: ${newEndStr}.`,
      },
      user
    );

    return {
      success: true,
      message: `Sucesso! O prazo de planificação foi estendido em 5 dias adicionais até ${newEndStr} (2ª e Última Fase).`,
    };
  }

  return { success: false, message: "Fase de extensão inválida." };
}

/**
 * Zera todos os prazos e contadores de extensão de prazo do sistema (0 dias de extensão).
 */
export async function zerarTodosOsPrazos(user?: any): Promise<{ success: boolean; message: string }> {
  const year = new Date().getFullYear();
  await savePeriodoPlanificacao(
    {
      extensaoFase1Usada: false,
      extensaoFase2Usada: false,
      diasExtensaoTotal: 0,
      autoSubmetido: false,
      dataInicioPlanificacao: `${year}-04-01`,
      dataFimPlanificacao: `${year}-04-30`,
      dataInicioRelatorioSemestral: `${year}-01-01`,
      dataFimRelatorioSemestral: `${year}-03-31`,
      status: "aberto",
      statusRelatorio: "aberto",
      observacoes: "Prazos zerados e redefinidos para o estado padrão.",
    },
    user
  );
  return {
    success: true,
    message: "Todos os prazos e extensões foram zerados com sucesso (0 dias de extensão de prazo).",
  };
}

/**
 * Validação de sobreposição de períodos (RN: Impede sobreposições de ciclos de Planificação ou Relatórios).
 */
export function validarSobreposicaoPeriodos(
  novoPeriodo: {
    dataInicio: string;
    dataFim: string;
    tipoCiclo?: "Planificação" | "Relatórios" | "Geral";
    ano?: number;
    idExcluir?: string;
  },
  periodosExistentes: PeriodoPlanificacao[] = []
): { hasOverlap: boolean; message?: string } {
  if (!novoPeriodo.dataInicio || !novoPeriodo.dataFim) {
    return { hasOverlap: false };
  }

  const novaInicio = new Date(novoPeriodo.dataInicio).getTime();
  const novaFim = new Date(novoPeriodo.dataFim).getTime();

  if (novaFim < novaInicio) {
    return {
      hasOverlap: true,
      message: "A data final do período não pode ser anterior à data de início.",
    };
  }

  const tipoAlvo = novoPeriodo.tipoCiclo || "Planificação";
  const anoAlvo = novoPeriodo.ano || new Date(novoPeriodo.dataInicio).getFullYear();

  for (const p of periodosExistentes) {
    if (!p || (novoPeriodo.idExcluir && p.id === novoPeriodo.idExcluir)) continue;

    // Verificar mesmo tipo de ciclo e mesmo ano
    const pTipo = p.tipoCiclo || "Planificação";
    if (pTipo !== tipoAlvo) continue;

    const pInicioStr = pTipo === "Relatórios" ? (p.dataInicioRelatorioSemestral || p.dataInicioPlanificacao) : p.dataInicioPlanificacao;
    const pFimStr = pTipo === "Relatórios" ? (p.dataFimRelatorioSemestral || p.dataFimPlanificacao) : p.dataFimPlanificacao;

    if (!pInicioStr || !pFimStr) continue;

    const pInicio = new Date(pInicioStr).getTime();
    const pFim = new Date(pFimStr).getTime();

    // Verificação de sobreposição de intervalos: max(startA, startB) <= min(endA, endB)
    const overlap = Math.max(novaInicio, pInicio) <= Math.min(novaFim, pFim);
    if (overlap) {
      return {
        hasOverlap: true,
        message: `Sobreposição de período detectada: Já existe um ciclo de ${tipoAlvo} registado entre ${pInicioStr} e ${pFimStr}. Altere as datas para evitar conflitos no calendário institucional.`,
      };
    }
  }

  return { hasOverlap: false };
}

/**
 * Submissão automática completa para o status de 'Consolidação' na hierarquia institucional.
 * Itera sobre todos os registros pendentes preenchidos e move-os automaticamente para 'Consolidação'.
 */
export async function executarSubmissaoAutomaticaParaConsolidacao(
  periodoAtual: PeriodoPlanificacao | null,
  motivoCustomizado?: string,
  user?: any
): Promise<{
  submetidas: number;
  detalhes: { atividades: number; planos: number; requisicoes: number };
}> {
  let countAtividades = 0;
  let countPlanos = 0;
  let countRequisicoes = 0;

  const timestampIso = new Date().toISOString();
  const motivo =
    motivoCustomizado ||
    "Encerramento de período oficial pelo Chefe do DPEP: submissão automática e encaminhamento institucional para Consolidação.";

  try {
    // 1. Processar 'matrix_activities' (Atividades da Matriz e Planos Setoriais)
    const snapActivities = await getDocs(collection(db, "matrix_activities")).catch(() => null);
    const updates: Promise<any>[] = [];

    if (snapActivities && !snapActivities.empty) {
      snapActivities.forEach((docSnap) => {
        const data = docSnap.data();
        const hasContent = Boolean(
          (data.descricao && data.descricao.trim()) ||
          (data.atividade && data.atividade.trim()) ||
          (data.acao && data.acao.trim()) ||
          (data.produto && data.produto.trim()) ||
          (data.rubricas && Array.isArray(data.rubricas) && data.rubricas.length > 0)
        );

        // Deve ter conteúdo preenchido e estar em estado pendente/rascunho/setorial
        const currentStatus = String(data.status || "setorial").toLowerCase();
        const isPending =
          !data.submetido ||
          data.submetido === false ||
          currentStatus === "rascunho" ||
          currentStatus === "setorial" ||
          currentStatus === "pendente" ||
          currentStatus === "reparticao" ||
          currentStatus === "departamento" ||
          currentStatus === "direcao";

        if (hasContent && isPending && currentStatus !== "consolidacao" && currentStatus !== "aprovado") {
          updates.push(
            setDoc(
              docSnap.ref,
              {
                status: "Consolidação",
                etapaHierarquica: "Consolidação DPEP",
                submetido: true,
                submetidoAutomaticamente: true,
                dataSubmissaoAutomatica: timestampIso,
                motivoSubmissaoAutomatica: motivo,
                encaminhadoPara: "Chefe do DPEP / Repartição de Planificação",
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            )
          );
          countAtividades++;
        }
      });
    }

    // 2. Processar 'planos_atividades' (Planos Gerais e Propostas)
    const snapPlanos = await getDocs(collection(db, "planos_atividades")).catch(() => null);
    if (snapPlanos && !snapPlanos.empty) {
      snapPlanos.forEach((docSnap) => {
        const data = docSnap.data();
        const hasContent = Boolean(
          (data.titulo && data.titulo.trim()) ||
          (data.descricao && data.descricao.trim()) ||
          (Array.isArray(data.atividades) && data.atividades.length > 0) ||
          (Array.isArray(data.linhas) && data.linhas.length > 0)
        );
        const st = String(data.status || "pendente").toLowerCase();
        if (hasContent && (st === "pendente" || st === "rascunho" || st === "em elaboração")) {
          updates.push(
            setDoc(
              docSnap.ref,
              {
                status: "Consolidação",
                submetido: true,
                submetidoAutomaticamente: true,
                dataSubmissaoAutomatica: timestampIso,
                motivoSubmissaoAutomatica: motivo,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            )
          );
          countPlanos++;
        }
      });
    }

    // 3. Processar 'requisicoes_internas' pendentes preenchidas
    const snapReqs = await getDocs(collection(db, "requisicoes_internas")).catch(() => null);
    if (snapReqs && !snapReqs.empty) {
      snapReqs.forEach((docSnap) => {
        const data = docSnap.data();
        const hasContent = Boolean(
          (data.objeto && data.objeto.trim()) ||
          (Array.isArray(data.itens) && data.itens.length > 0)
        );
        const st = String(data.status || "pendente").toLowerCase();
        if (hasContent && (st === "pendente" || st === "rascunho")) {
          updates.push(
            setDoc(
              docSnap.ref,
              {
                status: "Consolidação",
                submetido: true,
                submetidoAutomaticamente: true,
                dataSubmissaoAutomatica: timestampIso,
                motivoSubmissaoAutomatica: motivo,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            )
          );
          countRequisicoes++;
        }
      });
    }

    // Executar todas as gravações em paralelo
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // Atualizar no localStorage local também para feedback instantâneo na UI
    try {
      const localMatrix = localStorage.getItem("sigep_local_matrix_activities");
      if (localMatrix) {
        const parsed = JSON.parse(localMatrix);
        if (Array.isArray(parsed)) {
          const updatedLocal = parsed.map((item: any) => {
            const hasContent = Boolean(
              (item.descricao && item.descricao.trim()) ||
              (item.atividade && item.atividade.trim()) ||
              (item.produto && item.produto.trim())
            );
            if (hasContent && (!item.submetido || item.status !== "Consolidação")) {
              return {
                ...item,
                status: "Consolidação",
                etapaHierarquica: "Consolidação DPEP",
                submetido: true,
                submetidoAutomaticamente: true,
                dataSubmissaoAutomatica: timestampIso,
              };
            }
            return item;
          });
          localStorage.setItem("sigep_local_matrix_activities", JSON.stringify(updatedLocal));
          window.dispatchEvent(new CustomEvent("matrix_activities_updated", { detail: updatedLocal }));
        }
      }
    } catch (_) {}

    const totalSubmetidas = countAtividades + countPlanos + countRequisicoes;

    // Registar no período as estatísticas da submissão automática
    const definidor = user?.nome || user?.name || user?.email || "Chefe do DPEP";
    await savePeriodoPlanificacao(
      {
        autoSubmetido: true,
        dataAutoSubmissao: timestampIso,
        totalRegistosConsolidados: (periodoAtual?.totalRegistosConsolidados || 0) + totalSubmetidas,
        detalhesSubmissaoAutomatica: {
          totalAtividades: countAtividades,
          totalPlanos: countPlanos,
          totalRequisicoes: countRequisicoes,
          timestamp: timestampIso,
          executadoPor: definidor,
        },
      },
      user
    );

    return {
      submetidas: totalSubmetidas,
      detalhes: {
        atividades: countAtividades,
        planos: countPlanos,
        requisicoes: countRequisicoes,
      },
    };
  } catch (err) {
    console.warn("Erro ao executar submissão automática para consolidação:", err);
    return {
      submetidas: 0,
      detalhes: { atividades: 0, planos: 0, requisicoes: 0 },
    };
  }
}

/**
 * Função mantida para retrocompatibilidade
 */
export async function executarSubmissaoAutomaticaSePrazoExpirado(
  periodoAtual: PeriodoPlanificacao | null
): Promise<{ submetidas: number }> {
  if (!periodoAtual) return { submetidas: 0 };
  const check = isPlanificacaoAberta(periodoAtual);
  if (check.aberta) return { submetidas: 0 };

  const res = await executarSubmissaoAutomaticaParaConsolidacao(periodoAtual);
  return { submetidas: res.submetidas };
}

/**
 * Ações Personalizadas do Chefe do DPEP no Calendário Institucional:
 */

// 1. Criar Novo Ciclo / Período com Validação de Sobreposição
export async function criarNovoCicloPeriodoDPEP(params: {
  tipoCiclo: "Planificação" | "Relatórios";
  modalidade: "Trimestral" | "Semestral" | "Anual" | "Mensal";
  titulo?: string;
  dataInicio: string;
  dataFim: string;
  observacoes?: string;
  user: any;
}): Promise<{ success: boolean; message: string; periodo?: PeriodoPlanificacao }> {
  const { tipoCiclo, modalidade, titulo, dataInicio, dataFim, observacoes, user } = params;

  if (!dataInicio || !dataFim) {
    return { success: false, message: "As datas de início e fim são de preenchimento obrigatório." };
  }

  // Validação de sobreposição
  const overlapCheck = validarSobreposicaoPeriodos({
    dataInicio,
    dataFim,
    tipoCiclo,
    ano: new Date(dataInicio).getFullYear(),
  });

  if (overlapCheck.hasOverlap) {
    return { success: false, message: overlapCheck.message || "Sobreposição de período detectada." };
  }

  const payload: Partial<PeriodoPlanificacao> = {
    ano: new Date(dataInicio).getFullYear(),
    tipoCiclo,
    modalidade,
    tituloCiclo: titulo || `Ciclo ${modalidade} de ${tipoCiclo} - ${new Date(dataInicio).getFullYear()}`,
    status: "aberto",
    statusRelatorio: "aberto",
    observacoes: observacoes || `Novo ciclo configurado pelo Chefe do DPEP.`,
    autoSubmetido: false,
    extensaoFase1Usada: false,
    extensaoFase2Usada: false,
    diasExtensaoTotal: 0,
  };

  if (tipoCiclo === "Relatórios") {
    payload.dataInicioRelatorioSemestral = dataInicio;
    payload.dataFimRelatorioSemestral = dataFim;
  } else {
    payload.dataInicioPlanificacao = dataInicio;
    payload.dataFimPlanificacao = dataFim;
  }

  await savePeriodoPlanificacao(payload, user);

  return {
    success: true,
    message: `Novo ciclo de ${tipoCiclo} (${dataInicio} a ${dataFim}) criado e ativado com sucesso no calendário institucional!`,
  };
}

// 2. Reabrir Período Encerrado
export async function reabrirPeriodoDPEP(params: {
  periodoAtual: PeriodoPlanificacao;
  novaDataFim: string;
  motivo: string;
  user: any;
}): Promise<{ success: boolean; message: string }> {
  const { periodoAtual, novaDataFim, motivo, user } = params;

  if (!novaDataFim) {
    return { success: false, message: "Informe a nova data final para a reabertura do período." };
  }
  if (!motivo || !motivo.trim()) {
    return { success: false, message: "O motivo / justificativa para a reabertura do período é obrigatório." };
  }

  const today = new Date().toISOString().split("T")[0];
  if (novaDataFim <= today) {
    return { success: false, message: "A nova data final deve ser posterior à data de hoje." };
  }

  const payload: Partial<PeriodoPlanificacao> = {
    status: "aberto",
    statusRelatorio: "aberto",
    dataFimPlanificacao: novaDataFim,
    dataFimRelatorioSemestral: novaDataFim,
    autoSubmetido: false,
    motivoReabertura: motivo.trim(),
    dataReabertura: new Date().toISOString(),
    observacoes: `Período reaberto pelo Chefe do DPEP até ${novaDataFim}. Motivo: ${motivo.trim()}`,
  };

  await savePeriodoPlanificacao(payload, user);

  return {
    success: true,
    message: `Período reaberto com sucesso até ${novaDataFim}! Os setores já podem submeter os seus registos regulamentares.`,
  };
}

// 3. Prorrogar Período
export async function prorrogarPeriodoDPEP(params: {
  periodoAtual: PeriodoPlanificacao;
  novaDataFim: string;
  diasAdicionados?: number;
  motivo: string;
  user: any;
}): Promise<{ success: boolean; message: string }> {
  const { periodoAtual, novaDataFim, diasAdicionados, motivo, user } = params;

  if (!novaDataFim) {
    return { success: false, message: "Defina a nova data de prorrogação." };
  }
  if (!motivo || !motivo.trim()) {
    return { success: false, message: "A justificativa da prorrogação é obrigatória (RN-DPEP)." };
  }

  const autorNome = user?.nome || user?.name || user?.email || "Chefe do DPEP";
  const prorrogacaoRegistro = {
    id: `prorr_${Date.now()}`,
    data: new Date().toISOString(),
    diasAdicionados: diasAdicionados || 0,
    novaDataFim,
    motivo: motivo.trim(),
    autorNome,
    autorCargo: user?.cargo || user?.cargoChefia || "Chefe do DPEP",
  };

  const historico = Array.isArray(periodoAtual.historicoProrrogacoes)
    ? [...periodoAtual.historicoProrrogacoes, prorrogacaoRegistro]
    : [prorrogacaoRegistro];

  const payload: Partial<PeriodoPlanificacao> = {
    status: "prorrogado",
    dataFimPlanificacao: novaDataFim,
    dataFimRelatorioSemestral: novaDataFim,
    justificativaProrrogacao: motivo.trim(),
    historicoProrrogacoes: historico,
    diasExtensaoTotal: (periodoAtual.diasExtensaoTotal || 0) + (diasAdicionados || 0),
    observacoes: `Prazo prorrogado até ${novaDataFim} pelo Chefe do DPEP. Justificativa: ${motivo.trim()}`,
  };

  await savePeriodoPlanificacao(payload, user);

  return {
    success: true,
    message: `Prazo prorrogado com sucesso até ${novaDataFim}! O calendário institucional foi atualizado.`,
  };
}

// 4. Encerrar Período e Executar Submissão Automática para Consolidação
export async function encerrarPeriodoDPEP(params: {
  periodoAtual: PeriodoPlanificacao;
  motivo?: string;
  user: any;
}): Promise<{ success: boolean; message: string; submetidas: number }> {
  const { periodoAtual, motivo, user } = params;

  const encerramentoMotivo =
    motivo?.trim() || "Período encerrado pelo Chefe do DPEP no calendário institucional.";

  // 1. Atualizar status para fechado
  await savePeriodoPlanificacao(
    {
      status: "fechado",
      statusRelatorio: "fechado",
      justificativaEncerramento: encerramentoMotivo,
      observacoes: `Período encerrado em ${new Date().toISOString().split("T")[0]}. ${encerramentoMotivo}`,
    },
    user
  );

  // 2. Executar a submissão automática de todos os registos pendentes preenchidos para 'Consolidação'
  const resultado = await executarSubmissaoAutomaticaParaConsolidacao(
    periodoAtual,
    `Período encerrado: ${encerramentoMotivo}`,
    user
  );

  return {
    success: true,
    submetidas: resultado.submetidas,
    message: `Período encerrado com sucesso! Foram movidos automaticamente ${resultado.submetidas} registo(s) pendente(s) preenchido(s) para o status de 'Consolidação'.`,
  };
}

// 5. Verificação contínua: se atingiu a data final, encerra e submete para Consolidação
export async function verificarEExecutarEncerramentoPorData(
  periodoAtual: PeriodoPlanificacao | null
): Promise<{ encerrou: boolean; submetidas: number }> {
  if (!periodoAtual) return { encerrou: false, submetidas: 0 };

  const today = new Date().toISOString().split("T")[0];
  const dataFim = periodoAtual.dataFimPlanificacao;

  // Se a data final foi ultrapassada e o período ainda consta como aberto/prorrogado
  if (dataFim && today > dataFim && (periodoAtual.status === "aberto" || periodoAtual.status === "prorrogado")) {
    console.log(`⏰ Data final (${dataFim}) atingida! Disparando encerramento automático e submissão para Consolidação...`);
    
    await savePeriodoPlanificacao({
      status: "fechado",
      statusRelatorio: "fechado",
      observacoes: `Encerramento automático pelo sistema: data final regulamentar (${dataFim}) expirada em ${today}.`,
    });

    const res = await executarSubmissaoAutomaticaParaConsolidacao(
      periodoAtual,
      `Encerramento automático: Data final do ciclo regulamentar (${dataFim}) expirada.`
    );

    return { encerrou: true, submetidas: res.submetidas };
  }

  return { encerrou: false, submetidas: 0 };
}


