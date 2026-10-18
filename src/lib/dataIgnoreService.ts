import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

const CONFIG_DOC_ID = "instituicao_dados_ignorados_config";

export interface DataIgnoreConfig {
  instituicaoId: string;
  ignoredTypes: string[]; // ex: ['Relatórios de Teste', 'Utilizadores Dummy', 'Dados Simulados', 'Atividades Fictícias', 'Registos Experimentais']
  autoCleanOnBoot: boolean;
  lastCleanedAt?: string;
  customKeywords?: string[];
}

export const DEFAULT_IGNORED_TYPES = [
  "Relatórios de Teste",
  "Utilizadores Dummy",
  "Dados Simulados",
  "Atividades Fictícias",
  "Registos Experimentais",
  "Demo",
  "Teste",
  "Dummy"
];

/**
 * Obtém a configuração de tipos de dados a ignorar/excluir para uma instituição
 */
export async function getInstitutionIgnoreConfig(instituicaoId: string): Promise<DataIgnoreConfig> {
  if (!instituicaoId) {
    return { instituicaoId: "global", ignoredTypes: DEFAULT_IGNORED_TYPES, autoCleanOnBoot: true };
  }

  try {
    const docRef = doc(db, "system_configs", `${CONFIG_DOC_ID}_${instituicaoId}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DataIgnoreConfig;
    }
  } catch (err) {
    console.warn("Aviso ao carregar configuração de ignorar dados:", err);
  }

  return {
    instituicaoId,
    ignoredTypes: DEFAULT_IGNORED_TYPES,
    autoCleanOnBoot: true
  };
}

/**
 * Salva a configuração de tipos de dados a ignorar/excluir para uma instituição
 */
export async function saveInstitutionIgnoreConfig(config: DataIgnoreConfig): Promise<boolean> {
  try {
    const docRef = doc(db, "system_configs", `${CONFIG_DOC_ID}_${config.instituicaoId}`);
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Erro ao salvar configuração de ignorar dados:", err);
    return false;
  }
}

/**
 * Executa a limpeza automática ou verificação de dados ignorados com base na configuração da instituição
 */
export async function runInstitutionDataIgnorePurge(instituicaoId: string): Promise<{ purgedCount: number; removedTypes: string[] }> {
  const config = await getInstitutionIgnoreConfig(instituicaoId);
  if (!config.ignoredTypes || config.ignoredTypes.length === 0) {
    return { purgedCount: 0, removedTypes: [] };
  }

  const collectionsToCheck = [
    "matrix_activities",
    "actividades",
    "plano_actividades",
    "expedientes",
    "notes",
    "colaboradores",
    "service_requests",
    "archive_documents"
  ];

  let purgedCount = 0;
  const keywords = config.ignoredTypes.map(t => t.toLowerCase().trim());

  for (const colName of collectionsToCheck) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) continue;

      const docsToDelete: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Verificar se pertence à instituição (caso aplicável) ou global se for admin global
        if (instituicaoId && data.instituicaoId && data.instituicaoId !== instituicaoId) {
          return; // Isolar por instituição
        }

        const textBlob = JSON.stringify(data).toLowerCase();
        const shouldIgnore = keywords.some(keyword => keyword && textBlob.includes(keyword));

        if (shouldIgnore) {
          docsToDelete.push(docSnap.ref);
        }
      });

      if (docsToDelete.length > 0) {
        console.log(`🗑️ [IgnoreEngine] Eliminando ${docsToDelete.length} registos correspondentes aos tipos ignorados na coleção ${colName}...`);
        for (let i = 0; i < docsToDelete.length; i += 100) {
          const batch = docsToDelete.slice(i, i + 100);
          await Promise.all(batch.map(ref => deleteDoc(ref)));
        }
        purgedCount += docsToDelete.length;
      }
    } catch (err) {
      console.warn(`Aviso ao aplicar filtro de exclusão em ${colName}:`, err);
    }
  }

  // Atualizar última limpeza na config
  try {
    const docRef = doc(db, "system_configs", `${CONFIG_DOC_ID}_${instituicaoId}`);
    await setDoc(docRef, { lastCleanedAt: new Date().toISOString() }, { merge: true });
  } catch (_) {}

  return { purgedCount, removedTypes: config.ignoredTypes };
}
