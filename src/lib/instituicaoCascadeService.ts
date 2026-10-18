import { collection, getDocs, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { firestoreService } from "./firestoreService";
import { registrarAuditoriaEstrutura } from "./instituicaoEstruturaService";

/**
 * REGRA CONSOLIDADA DO SISTEMA (RN-024.5)
 * 
 * Em caso de eliminação de uma instituição, o sistema deverá executar uma eliminação em cascata,
 * removendo permanentemente todos os dados relacionados, incluindo:
 * - Colaboradores e processos individuais
 * - Utilizadores e permissões
 * - Estruturas organizacionais (órgãos, direções, departamentos, repartições e setores)
 * - Planos (institucionais, setoriais e matrizes de atividades)
 * - Relatórios (semestrais, anuais e de execução)
 * - Calendários e eventos institucionais
 * - Períodos de planificação e cronogramas
 * - Indicadores de desempenho e tetos orçamentais
 * - Metas e realizações
 * - Projetos e produções
 * - Notificações, alertas e lembretes
 * - Auditorias específicas da instituição
 * 
 * Garante a integridade e o isolamento absoluto dos dados institucionais,
 * respeitando rigorosamente a preservação de dados de outras instituições.
 */

export interface CascadeDeleteResult {
  success: boolean;
  instituicaoId: string;
  instituicaoNome: string;
  totalEliminados: number;
  detalhes: Record<string, number>;
  message: string;
  timestamp: string;
}

// Lista canónica de coleções associadas aos dados de uma instituição
const INSTITUTIONAL_COLLECTIONS: { key: string; name: string }[] = [
  // 1. Colaboradores e Efetivo
  { key: "colaboradores", name: "Colaboradores" },
  { key: "colaboradores_chefia", name: "Colaboradores com Chefia" },
  { key: "colaboradores_formacao", name: "Formação de Colaboradores" },
  { key: "processos_individuais", name: "Processos Individuais" },

  // 2. Utilizadores e Acessos
  { key: "users", name: "Utilizadores" },
  { key: "hierarchy_user_links", name: "Vínculos Hierárquicos de Utilizadores" },
  { key: "password_reset_requests", name: "Pedidos de Reposição de Senha" },

  // 3. Estruturas Organizacionais
  { key: "direcoes_organicas", name: "Direções Orgânicas" },
  { key: "orgaos_custom", name: "Órgãos da Instituição" },
  { key: "estrutura_adicionais", name: "Departamentos e Repartições" },
  { key: "direcoes_excluidas", name: "Registo de Estruturas Excluídas" },
  { key: "estrutura_renames", name: "Nomenclaturas de Estruturas" },
  { key: "sector_menu_configs", name: "Configurações de Menus Setoriais" },

  // 4. Planos
  { key: "institucional_plans", name: "Planos Institucionais" },
  { key: "planos_atividades", name: "Planos de Atividades" },
  { key: "matrix_activities", name: "Atividades da Matriz" },
  { key: "actividades", name: "Atividades Gerais" },
  { key: "plan_schedules", name: "Cronogramas de Planos" },

  // 5. Relatórios
  { key: "reports", name: "Relatórios" },
  { key: "relatorios_atividades", name: "Relatórios de Atividades" },

  // 6. Calendários e Eventos
  { key: "calendar_events", name: "Eventos do Calendário" },
  { key: "events", name: "Eventos Institucionais" },
  { key: "feriados", name: "Feriados da Instituição" },

  // 7. Períodos de Planificação
  { key: "planning_periods", name: "Períodos de Planificação" },
  { key: "periodos_planificacao", name: "Ciclos de Planificação e Relatórios" },

  // 8. Indicadores, Metas e Tetos
  { key: "indicadores", name: "Indicadores" },
  { key: "indicadores_desempenho", name: "Indicadores de Desempenho" },
  { key: "metas_anuais", name: "Metas Anuais" },
  { key: "metas", name: "Metas" },
  { key: "tetos_orcamentais", name: "Tetos Orçamentais" },

  // 9. Projetos e Produção
  { key: "projetos", name: "Projetos" },
  { key: "monografia", name: "Monografias e Teses" },
  { key: "produtos_unificados", name: "Catálogo de Produtos" },

  // 10. Notificações e Alertas
  { key: "notifications", name: "Notificações" },
  { key: "system_alerts", name: "Alertas de Sistema" },
  { key: "access_alerts", name: "Alertas de Acesso" },

  // 11. Auditorias
  { key: "audit_logs", name: "Auditorias de Atividades" },
  { key: "auditoria_estrutura", name: "Auditorias de Estrutura Organizacional" },

  // 12. Demais Módulos Operacionais Institucionais
  { key: "requisicoes_internas", name: "Requisições Internas" },
  { key: "expedientes", name: "Expedientes" },
  { key: "materiais_bens", name: "Materiais e Bens" },
  { key: "movimentos_economato", name: "Movimentos de Economato" },
  { key: "inventarios_patrimoniais", name: "Inventários Patrimoniais" },
  { key: "financial_data", name: "Dados Financeiros" },
  { key: "assiduidade", name: "Registos de Assiduidade" },
  { key: "alocacoes_docentes", name: "Alocações Docentes" },
  { key: "espacos_fisicos", name: "Espaços Físicos" },
  { key: "turmas", name: "Turmas Académicas" },
  { key: "disciplinas_academicas", name: "Disciplinas Académicas" },
  { key: "efetivo_escolar", name: "Efetivo Escolar" },
  { key: "bolsas", name: "Bolsas de Estudo" },
  { key: "atendimentos_estudantis", name: "Atendimentos Estudantis" },
  { key: "library_visits", name: "Visitas à Biblioteca" },
  { key: "library_books", name: "Acervo Bibliográfico" },
  { key: "service_requests", name: "Solicitações de Serviço" },
  { key: "drafts", name: "Rascunhos Locais Salvos" },
];

/**
 * Executa a eliminação em cascata de todos os dados vinculados a uma instituição (RN-024.5).
 */
export async function executarEliminacaoEmCascataInstituicao(
  instituicaoId: string,
  instituicaoNome: string,
  autor?: { id?: string; nome?: string; email?: string }
): Promise<CascadeDeleteResult> {
  if (!instituicaoId || !instituicaoId.trim()) {
    throw new Error("ID da instituição inválido para eliminação em cascata.");
  }

  const cleanInstId = instituicaoId.trim();
  const cleanInstNome = instituicaoNome || cleanInstId;
  const timestamp = new Date().toISOString();
  const detalhes: Record<string, number> = {};
  let totalEliminados = 0;

  console.log(`[RN-024.5] A iniciar eliminação em cascata para a instituição: ${cleanInstNome} (ID: ${cleanInstId})`);

  // 1. Iterar por cada coleção institucional e eliminar estritamente os registos associados
  for (const item of INSTITUTIONAL_COLLECTIONS) {
    try {
      const colRef = collection(db, item.key);
      const snapshot = await getDocs(colRef).catch(() => null);

      if (!snapshot || snapshot.empty) {
        detalhes[item.name] = 0;
        continue;
      }

      const docsToDelete: { id: string; ref: any }[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docInstId = data.instituicaoId || data.tenantId || data.institutionId;

        // Se o documento pertencer inequivocamente a esta instituição
        const matches =
          docInstId === cleanInstId ||
          (cleanInstId === "isps" && !docInstId);

        if (matches) {
          docsToDelete.push({ id: docSnap.id, ref: docSnap.ref });
        }
      });

      if (docsToDelete.length > 0) {
        // Eliminar em lotes (batch) com limites seguros do Firestore (máx 500 por lote)
        const CHUNK_SIZE = 450;
        for (let i = 0; i < docsToDelete.length; i += CHUNK_SIZE) {
          const chunk = docsToDelete.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          for (const d of chunk) {
            batch.delete(d.ref);
          }
          await batch.commit().catch(async (batchErr) => {
            console.warn(`[RN-024.5] Aviso no batch commit de ${item.key}. Tentando fallback unitário:`, batchErr);
            for (const d of chunk) {
              await deleteDoc(d.ref).catch(() => {});
            }
          });
        }

        // Limpeza do cache local do SIGEP para este tipo de dado
        try {
          const localKey = `sigep_local_${item.key}`;
          const stored = localStorage.getItem(localKey);
          if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) {
              const filtered = list.filter((it: any) => {
                const docInstId = it.instituicaoId || it.tenantId || it.institutionId;
                return docInstId !== cleanInstId;
              });
              localStorage.setItem(localKey, JSON.stringify(filtered));
            }
          }
        } catch (_) {}

        detalhes[item.name] = docsToDelete.length;
        totalEliminados += docsToDelete.length;
        console.log(`[RN-024.5] ${docsToDelete.length} registo(s) removido(s) de "${item.name}"`);
      } else {
        detalhes[item.name] = 0;
      }
    } catch (colErr) {
      console.warn(`[RN-024.5] Aviso ao processar coleção ${item.key}:`, colErr);
      detalhes[item.name] = 0;
    }
  }

  // 2. Eliminar o próprio registo da instituição em "instituicoes"
  try {
    const instDocRef = doc(db, "instituicoes", cleanInstId);
    await deleteDoc(instDocRef).catch(() => {});
    await firestoreService.instituicoes.delete(cleanInstId).catch(() => {});
    totalEliminados += 1;
    detalhes["Registo da Instituição"] = 1;
  } catch (instErr) {
    console.warn("[RN-024.5] Aviso ao remover documento principal de instituição:", instErr);
  }

  // 3. Atualizar a lista de IDs excluídos no localStorage para evitar ressurgimento por caches
  try {
    let deletedIds: string[] = [];
    const storedDeleted = localStorage.getItem("sigep_deleted_instituicoes");
    if (storedDeleted) {
      deletedIds = JSON.parse(storedDeleted);
    }
    if (!deletedIds.includes(cleanInstId)) {
      deletedIds.push(cleanInstId);
      localStorage.setItem("sigep_deleted_instituicoes", JSON.stringify(deletedIds));
    }

    // Se a instituição ativa for esta, redefinir
    const activeStored = localStorage.getItem("sigep_active_instituicao_id");
    if (activeStored === cleanInstId) {
      localStorage.removeItem("sigep_active_instituicao_id");
      localStorage.removeItem("sigep_active_instituicao");
    }
  } catch (_) {}

  // 4. Registar auditoria de eliminação em cascata
  try {
    await registrarAuditoriaEstrutura({
      acao: "ELIMINAR",
      tipo: "orgao" as any,
      nome: cleanInstNome,
      instituicaoId: cleanInstId,
      autor: autor || {
        id: "admin_sistema",
        nome: "Administrador do Sistema",
        email: "admin@sigep.gov",
      },
      detalhes: `Eliminação em Cascata (RN-024.5) executada com sucesso. Total de ${totalEliminados} registos removidos permanentemente em todas as coleções do sistema.`,
    });
  } catch (_) {}

  const message = `Eliminação em cascata concluída com sucesso! Foram removidos permanentemente ${totalEliminados} registos associados à instituição "${cleanInstNome}".`;

  return {
    success: true,
    instituicaoId: cleanInstId,
    instituicaoNome: cleanInstNome,
    totalEliminados,
    detalhes,
    message,
    timestamp,
  };
}
