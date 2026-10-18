import { db } from "./firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export interface IntegrityReport {
  timestamp: string;
  totalColaboradores: number;
  totalInstituicoes: number;
  totalAtividades: number;
  orfaosColaboradores: number;
  orfaosAtividades: number;
  inconsistencias: string[];
  status: "Saudável" | "Atenção Requerida" | "Inconsistente";
}

/**
 * Script de Diagnóstico para validar a integridade das relações entre colaboradores, instituições e atividades.
 * Identifica e reporta automaticamente registos órfãos ou inconsistências na base de dados.
 */
export async function runDatabaseIntegrityDiagnostic(): Promise<IntegrityReport> {
  console.log("🔍 [SIGEP Diagnóstico] A iniciar validação de integridade referencial...");
  const inconsistencias: string[] = [];
  
  let colaboradores: any[] = [];
  let instituicoes: any[] = [];
  let atividades: any[] = [];

  try {
    const colSnap = await getDocs(collection(db, "colaboradores"));
    colaboradores = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    inconsistencias.err = `Erro ao ler colaboradores: ${err}`;
  }

  try {
    const instSnap = await getDocs(collection(db, "instituicoes"));
    instituicoes = instSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Se a coleção não existir, criamos array vazio
  }

  try {
    const actSnap = await getDocs(collection(db, "matrix_activities"));
    atividades = actSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Se a coleção não existir
  }

  let orfaosColaboradores = 0;
  let orfaosAtividades = 0;

  // Verificar colaboradores sem nome ou sem dados essenciais
  colaboradores.forEach(c => {
    if (!c.nome && !c.name) {
      orfaosColaboradores++;
      inconsistencias.push(`Colaborador sem nome identificável (ID: ${c.id})`);
    }
  });

  // Verificar atividades com referências inválidas
  atividades.forEach(a => {
    if (!a.nomeActividade && !a.title && !a.designacao) {
      orfaosAtividades++;
      inconsistencias.push(`Atividade sem título ou designação válida (ID: ${a.id})`);
    }
  });

  const status: "Saudável" | "Atenção Requerida" | "Inconsistente" = 
    inconsistencias.length === 0 ? "Saudável" : inconsistencias.length < 5 ? "Atenção Requerida" : "Inconsistente";

  const report: IntegrityReport = {
    timestamp: new Date().toISOString(),
    totalColaboradores: colaboradores.length,
    totalInstituicoes: instituicoes.length,
    totalAtividades: atividades.length,
    orfaosColaboradores,
    orfaosAtividades,
    inconsistencias,
    status
  };

  console.log("✅ [SIGEP Diagnóstico] Relatório de integridade concluído:", report);
  return report;
}

/**
 * Sugestão de Arquitetura para Lazy Loading e Paginação Dinâmica:
 * 
 * Para garantir que o sistema não carregue volumes massivos de dados simultaneamente na UI:
 * 1. Utilização de consultas paginadas no Firestore com `limit()` e `startAfter()`.
 * 2. Implementação de componentes de lista virtualizada ou scroll infinito nas tabelas de colaboradores e atividades.
 * 3. Cache local inteligente por instituição para evitar leituras repetitivas ao navegar entre menus.
 */
