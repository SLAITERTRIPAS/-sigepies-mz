import { PRODUTOS_POR_NECESSIDADE, ProdutoMercado } from "../constants/formOptions";
import { firestoreService } from "./firestoreService";
import { safeJSONStringify } from "./utils";

export interface UnifiedProduct extends ProdutoMercado {
  id?: string;
  updatedAt?: string;
  rubrica?: string;
  necessidade?: string;
  categoria?: string;
  funcaoUtilizacao?: string; // Enquadramento segundo a sua função ou utilização
}

export const FUNCOES_UTILIZACAO = [
  "Material de Escritório e Expediente",
  "Equipamento Informático, Tecnológico e Acessórios",
  "Mobiliário e Equipamento de Escritório",
  "Material de Limpeza, Higiene e Desinfeção",
  "Combustíveis, Óleos e Lubrificantes",
  "Consumíveis de Manutenção, Elétricos e Ferramentas",
  "Alimentação, Copa e Hotelaria",
  "Fardamento, Uniformes e Equipamento de Proteção (EPI)",
  "Medicamentos e Material de Primeiros Socorros",
  "Serviços Especializados, Manutenção e Conservação",
  "Comunicação, Internet, Telecomunicações e Software",
  "Passagens, Diárias e Deslocações em Serviço",
  "Outros Bens e Serviços Gerais",
] as const;

export type FuncaoUtilizacao = typeof FUNCOES_UTILIZACAO[number];

export function inferirFuncaoUtilizacao(
  nome?: string,
  rubrica?: string,
  necessidade?: string
): FuncaoUtilizacao {
  const text = `${nome || ""} ${necessidade || ""} ${rubrica || ""}`.toLowerCase();

  if (
    text.includes("papel") ||
    text.includes("caneta") ||
    text.includes("pasta") ||
    text.includes("toner") ||
    text.includes("caderno") ||
    text.includes("marcador") ||
    text.includes("grampo") ||
    text.includes("agrafador") ||
    text.includes("resma") ||
    text.includes("envelope") ||
    text.includes("carimbo") ||
    text.includes("tesoura") ||
    text.includes("bloco") ||
    text.includes("lápis") ||
    text.includes("esferográfica") ||
    text.includes("tinteiro")
  ) {
    return "Material de Escritório e Expediente";
  }

  if (
    text.includes("computador") ||
    text.includes("laptop") ||
    text.includes("portátil") ||
    text.includes("teclado") ||
    text.includes("rato") ||
    text.includes("mouse") ||
    text.includes("monitor") ||
    text.includes("impressora") ||
    text.includes("scanner") ||
    text.includes("switch") ||
    text.includes("router") ||
    text.includes("cabo de rede") ||
    text.includes("disco") ||
    text.includes("pen drive") ||
    text.includes("flash") ||
    text.includes("projetor") ||
    text.includes("nobreak") ||
    text.includes("ups") ||
    text.includes("informátic") ||
    text.includes("hardware")
  ) {
    return "Equipamento Informático, Tecnológico e Acessórios";
  }

  if (
    text.includes("mesa") ||
    text.includes("secretária") ||
    text.includes("cadeira") ||
    text.includes("armário") ||
    text.includes("gaveteiro") ||
    text.includes("estante") ||
    text.includes("sofá") ||
    text.includes("arquivo") ||
    text.includes("mobiliário") ||
    text.includes("móvel")
  ) {
    return "Mobiliário e Equipamento de Escritório";
  }

  if (
    text.includes("sabão") ||
    text.includes("detergente") ||
    text.includes("desinfetante") ||
    text.includes("vassoura") ||
    text.includes("balde") ||
    text.includes("papel higiénico") ||
    text.includes("esfregona") ||
    text.includes("lixívia") ||
    text.includes("saco de lixo") ||
    text.includes("desodorizante") ||
    text.includes("limpeza") ||
    text.includes("higiene")
  ) {
    return "Material de Limpeza, Higiene e Desinfeção";
  }

  if (
    text.includes("gasóleo") ||
    text.includes("gasolina") ||
    text.includes("combustível") ||
    text.includes("lubrificante") ||
    text.includes("óleo de motor") ||
    text.includes("combustiveis")
  ) {
    return "Combustíveis, Óleos e Lubrificantes";
  }

  if (
    text.includes("lâmpada") ||
    text.includes("disjuntor") ||
    text.includes("interruptor") ||
    text.includes("cabo elétrico") ||
    text.includes("fechadura") ||
    text.includes("torneira") ||
    text.includes("tinta") ||
    text.includes("pincel") ||
    text.includes("cimento") ||
    text.includes("ferramenta") ||
    text.includes("chave") ||
    text.includes("alicate") ||
    text.includes("parafuso")
  ) {
    return "Consumíveis de Manutenção, Elétricos e Ferramentas";
  }

  if (
    text.includes("água mineral") ||
    text.includes("café") ||
    text.includes("chá") ||
    text.includes("açúcar") ||
    text.includes("leite") ||
    text.includes("bolacha") ||
    text.includes("refeição") ||
    text.includes("almoço") ||
    text.includes("lanche") ||
    text.includes("coffee break") ||
    text.includes("copa") ||
    text.includes("aliment")
  ) {
    return "Alimentação, Copa e Hotelaria";
  }

  if (
    text.includes("farda") ||
    text.includes("fardamento") ||
    text.includes("bota") ||
    text.includes("capacete") ||
    text.includes("luva") ||
    text.includes("bata") ||
    text.includes("colete") ||
    text.includes("uniforme") ||
    text.includes("epi")
  ) {
    return "Fardamento, Uniformes e Equipamento de Proteção (EPI)";
  }

  if (
    text.includes("medicamento") ||
    text.includes("paracetamol") ||
    text.includes("gaze") ||
    text.includes("ligadura") ||
    text.includes("álcool") ||
    text.includes("primeiros socorros") ||
    text.includes("seringa") ||
    text.includes("farmácia")
  ) {
    return "Medicamentos e Material de Primeiros Socorros";
  }

  if (
    text.includes("internet") ||
    text.includes("software") ||
    text.includes("licença") ||
    text.includes("telecomunicação") ||
    text.includes("domínio") ||
    text.includes("hospedagem") ||
    text.includes("antivirus")
  ) {
    return "Comunicação, Internet, Telecomunicações e Software";
  }

  if (
    text.includes("passagem") ||
    text.includes("diária") ||
    text.includes("deslocação") ||
    text.includes("alojamento") ||
    text.includes("hospedagem")
  ) {
    return "Passagens, Diárias e Deslocações em Serviço";
  }

  if (
    text.includes("manutenção") ||
    text.includes("reparação") ||
    text.includes("assistência") ||
    text.includes("consultoria") ||
    text.includes("segurança privada") ||
    text.includes("transporte") ||
    text.includes("serviço")
  ) {
    return "Serviços Especializados, Manutenção e Conservação";
  }

  // Enquadramento por Rúbrica se não identificado por palavras-chave
  const rLower = (rubrica || "").toLowerCase();
  if (rLower.includes("121") || rLower.includes("bens")) {
    return "Material de Escritório e Expediente";
  }
  if (rLower.includes("122") || rLower.includes("serviços")) {
    return "Serviços Especializados, Manutenção e Conservação";
  }
  if (rLower.includes("112") || rLower.includes("pessoal")) {
    return "Passagens, Diárias e Deslocações em Serviço";
  }

  return "Outros Bens e Serviços Gerais";
}

export function getCategoryForRubricaOrNecessidade(rubrica?: string, necessidade?: string): string {
  const r = String(rubrica || "").toLowerCase();
  const n = String(necessidade || "").toLowerCase();
  if (
    r.includes("121") ||
    r.includes("bens") ||
    n.includes("combustível") ||
    n.includes("material") ||
    n.includes("fardamento") ||
    n.includes("medicamento") ||
    n.includes("género") ||
    n.includes("ferramenta") ||
    n.includes("semente") ||
    n.includes("aliment") ||
    n.includes("copa") ||
    n.includes("informática")
  ) {
    return "121 - Bens de Consumo e Materiais";
  }
  if (
    r.includes("122") ||
    r.includes("serviços") ||
    n.includes("comunicação") ||
    n.includes("passagem") ||
    n.includes("renda") ||
    n.includes("manutenção") ||
    n.includes("transporte") ||
    n.includes("seguro") ||
    n.includes("água") ||
    n.includes("energia") ||
    n.includes("limpeza") ||
    n.includes("gráficos")
  ) {
    return "122 - Serviços de Terceiros e Encargos";
  }
  if (
    r.includes("112") ||
    r.includes("pessoal") ||
    n.includes("ajuda") ||
    n.includes("diária") ||
    n.includes("subsídio")
  ) {
    return "112 - Despesas com Pessoal e Diárias";
  }
  if (
    r.includes("1434") ||
    r.includes("famílias") ||
    r.includes("transferência") ||
    n.includes("bolsa")
  ) {
    return "1434 - Transferências e Bolsas";
  }
  if (r.includes("12") || r.includes("findos")) {
    return "12 - Exercícios Findos";
  }
  return "121 - Bens de Consumo e Materiais";
}

function getRubricaForNecessidade(nec: string): string {
  const lower = String(nec || "").toLowerCase();
  if (lower.includes("combustível") || lower.includes("material") || lower.includes("fardamento") || lower.includes("medicamento") || lower.includes("género") || lower.includes("ferramenta") || lower.includes("sementes") || lower.includes("bandeira") || lower.includes("software") || lower.includes("bens") || lower.includes("121")) {
    return "Bens - 121";
  }
  if (lower.includes("comunicação") || lower.includes("passagem") || lower.includes("renda") || lower.includes("manutenção") || lower.includes("transporte") || lower.includes("seguro") || lower.includes("representação") || lower.includes("festividade") || lower.includes("água") || lower.includes("energia") || lower.includes("limpeza") || lower.includes("segurança") || lower.includes("serviços") || lower.includes("122")) {
    return "Serviços - 122";
  }
  if (lower.includes("ajuda") || lower.includes("subsídio") || lower.includes("remuneração") || lower.includes("pessoal") || lower.includes("contratação") || lower.includes("112")) {
    return "Demais despesas com o pessoal - 112";
  }
  if (lower.includes("bolsa") || lower.includes("transferência") || lower.includes("1434")) {
    return "Demais transferências a famílias - 1434";
  }
  if (lower.includes("retractivo") || lower.includes("exercício") || lower.includes("findo") || lower.includes("161") || lower.includes("12")) {
    return "Exercícios findos - 12";
  }
  return "Bens - 121";
}

export function toSingularWord(word: string): string {
  if (!word || word.length <= 3) return word;
  const lower = String(word).toLowerCase();
  const exceptions = ["lápis", "póstris", "pires", "vírus", "ônibus", "autocarro", "arroz", "gás", "pratos", "óculos"];
  if (exceptions.includes(lower)) return word;

  if (lower.endsWith("ões")) return word.slice(0, -3) + "ão";
  if (lower.endsWith("ães")) return word.slice(0, -3) + "ão";
  if (lower.endsWith("ãos")) return word.slice(0, -1);
  if (lower.endsWith("éis") || lower.endsWith("eis")) return word.slice(0, -3) + "el";
  if (lower.endsWith("ais")) return word.slice(0, -3) + "al";
  if (lower.endsWith("ois")) return word.slice(0, -3) + "ol";
  if (lower.endsWith("uis")) return word.slice(0, -3) + "ul";
  if (lower.endsWith("ores") || lower.endsWith("eres") || lower.endsWith("ires")) return word.slice(0, -2);
  if (lower.endsWith("ns")) return word.slice(0, -2) + "m";
  if (lower.endsWith("s") && !lower.endsWith("is") && !lower.endsWith("us") && !lower.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

export function toSingularProductName(name: string): string {
  if (!name) return "";
  let trimmed = String(name || "").trim();
  trimmed = trimmed.replace(/\s*—\s*.*$/, "").replace(/\s*-\s*\d+[.,]?\d*\s*MZN.*$/i, "").trim();
  const words = trimmed.split(" ");
  if (words.length === 0) return trimmed;
  words[0] = toSingularWord(words[0]);
  for (let i = 1; i < words.length; i++) {
    if (["e", "de", "do", "da", "dos", "das", "para", "com", "em"].includes(words[i].toLowerCase())) continue;
    words[i] = toSingularWord(words[i]);
  }
  const result = words.join(" ");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function getDeletedProductKeys(): Set<string> {
  try {
    const saved = localStorage.getItem("sigep_deleted_products");
    if (saved) {
      const arr: string[] = JSON.parse(saved);
      return new Set(arr.map((k) => String(k || "").trim().toLowerCase()));
    }
  } catch (e) {
    console.error("Error reading deleted products:", e);
  }
  return new Set();
}

export async function deleteUnifiedProduct(nome: string) {
  try {
    const singularName = toSingularProductName(nome);
    const key = singularName.trim().toLowerCase();
    const docId = `prod_${key}`.replace(/[^a-zA-Z0-9_]/g, "_");
    
    // Remover imediatamente e definitivamente da base de dados Firestore
    await firestoreService.produtosUnificados.delete(docId);

    const saved = localStorage.getItem("sigep_unified_products");
    if (saved) {
      const parsed: UnifiedProduct[] = JSON.parse(saved);
      const filtered = parsed.filter((p) => String(toSingularProductName(p.nome) || "").trim().toLowerCase() !== key);
      localStorage.setItem("sigep_unified_products", safeJSONStringify(filtered));
    }
  } catch (e) {
    console.error("Error deleting product from database:", e);
    throw e;
  }
}

export async function getUnifiedProducts(): Promise<UnifiedProduct[]> {
  const map = new Map<string, UnifiedProduct>();
  const deletedKeys = getDeletedProductKeys();

  // 1. Fetch from Firestore (Gestão de Produtos e Preços)
  try {
    const remoteProducts = await firestoreService.produtosUnificados.get();
    remoteProducts.forEach((p) => {
        if (p && p.nome) {
          const singularName = toSingularProductName(p.nome);
          const key = String(toSingularProductName(p.nome) || "").trim().toLowerCase();
          if (!deletedKeys.has(key)) {
            const rubrica = p.rubrica || "Bens - 121";
            const necessidade = p.necessidade || "Geral";
            const categoria = p.categoria || getCategoryForRubricaOrNecessidade(rubrica, necessidade);
            const funcao = p.funcaoUtilizacao || inferirFuncaoUtilizacao(singularName, rubrica, necessidade);
            map.set(key, {
              id: p.id,
              nome: singularName,
              preco: Number(p.preco) || 0,
              unidade: p.unidade || "Unidade",
              especificacao: p.especificacao || "",
              rubrica: rubrica,
              necessidade: necessidade,
              categoria: categoria,
              funcaoUtilizacao: funcao,
              updatedAt: p.updatedAt,
            });
          }
        }
    });
  } catch (e) {
    console.error("Error fetching unified products from Firestore:", e);
  }

  // 2. Include baseline products from PRODUTOS_POR_NECESSIDADE if not already in Firestore or deleted
  Object.entries(PRODUTOS_POR_NECESSIDADE).forEach(([necessidade, prods]) => {
    const rubrica = getRubricaForNecessidade(necessidade);
    prods.forEach((p) => {
      const singularName = toSingularProductName(p.nome);
      const key = singularName.trim().toLowerCase();
      if (!deletedKeys.has(key) && !map.has(key)) {
        const categoria = getCategoryForRubricaOrNecessidade(rubrica, necessidade);
        const funcao = inferirFuncaoUtilizacao(singularName, rubrica, necessidade);
        map.set(key, {
          nome: singularName,
          preco: p.preco || 0,
          unidade: p.unidade || "Unidade",
          especificacao: p.especificacao || "",
          rubrica: rubrica,
          necessidade: necessidade,
          categoria: categoria,
          funcaoUtilizacao: funcao,
        });
      }
    });
  });

  const result = Array.from(map.values());
  result.sort((a, b) => a.nome.localeCompare(b.nome, "pt-MZ", { sensitivity: "base" }));
  return result;
}

export async function deduplicateDatabaseProducts(): Promise<{ totalUnique: number; duplicatesRemoved: number }> {
  try {
    const remoteProducts = await firestoreService.produtosUnificados.get();
    const deletedKeys = getDeletedProductKeys();

    const groups = new Map<string, any[]>();
    remoteProducts.forEach((doc: any) => {
      if (doc && doc.nome) {
        const key = String(toSingularProductName(doc.nome) || "").trim().toLowerCase();
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(doc);
      }
    });

    let duplicatesRemoved = 0;
    const cleanList: UnifiedProduct[] = [];

    for (const [key, docs] of groups.entries()) {
      if (deletedKeys.has(key)) {
        for (const d of docs) {
          if (d.id) {
            await firestoreService.produtosUnificados.delete(d.id).catch(() => {});
          }
        }
        continue;
      }

      docs.sort((a, b) => {
        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      const master = docs[0];
      const singularName = toSingularProductName(master.nome);
      const masterDocId = `prod_${key}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const rubrica = master.rubrica || "Bens - 121";
      const necessidade = master.necessidade || "Geral";

      const cleanProduct: UnifiedProduct = {
        id: masterDocId,
        nome: singularName,
        preco: Number(master.preco) || 0,
        unidade: master.unidade || "Unidade",
        especificacao: master.especificacao || "",
        rubrica: rubrica,
        necessidade: necessidade,
        categoria: getCategoryForRubricaOrNecessidade(rubrica, necessidade),
        updatedAt: master.updatedAt || new Date().toISOString(),
      };

      await firestoreService.produtosUnificados.set(masterDocId, cleanProduct).catch(() => {});
      cleanList.push(cleanProduct);

      for (let i = 1; i < docs.length; i++) {
        if (docs[i].id && docs[i].id !== masterDocId) {
          await firestoreService.produtosUnificados.delete(docs[i].id).catch(() => {});
          duplicatesRemoved++;
        }
      }
    }

    const existingKeys = new Set(cleanList.map((p) => toSingularProductName(p.nome).trim().toLowerCase()));
    Object.entries(PRODUTOS_POR_NECESSIDADE).forEach(([necessidade, prods]) => {
      const rubrica = getRubricaForNecessidade(necessidade);
      prods.forEach((p) => {
        const singularName = toSingularProductName(p.nome);
        const key = singularName.trim().toLowerCase();
        if (!deletedKeys.has(key) && !existingKeys.has(key)) {
          const docId = `prod_${key}`.replace(/[^a-zA-Z0-9_]/g, "_");
          const prodObj: UnifiedProduct = {
            id: docId,
            nome: singularName,
            preco: p.preco || 0,
            unidade: p.unidade || "Unidade",
            especificacao: p.especificacao || "",
            rubrica: rubrica,
            necessidade: necessidade,
            categoria: getCategoryForRubricaOrNecessidade(rubrica, necessidade),
            updatedAt: new Date().toISOString(),
          };
          firestoreService.produtosUnificados.set(docId, prodObj).catch(() => {});
          cleanList.push(prodObj);
          existingKeys.add(key);
        }
      });
    });

    localStorage.setItem("sigep_unified_products", safeJSONStringify(cleanList));

    return {
      totalUnique: cleanList.length,
      duplicatesRemoved,
    };
  } catch (err) {
    console.error("Erro ao deduplicar produtos na base de dados:", err);
    return { totalUnique: 0, duplicatesRemoved: 0 };
  }
}

export async function saveUnifiedProduct(product: {
  nome: string;
  preco: number;
  unidade: string;
  especificacao: string;
  rubrica?: string;
  necessity?: string;
  necessidade?: string;
  categoria?: string;
  funcaoUtilizacao?: string;
  originalNome?: string;
}) {
  try {
    const current = await getUnifiedProducts();
    const singularName = toSingularProductName(product.nome);
    const key = String(singularName || "").trim().toLowerCase();
    const oldKey = product.originalNome
      ? String(toSingularProductName(product.originalNome) || "").trim().toLowerCase()
      : key;

    // Se anteriormente apagado, remover da lista de apagados
    const deletedKeys = getDeletedProductKeys();
    if (deletedKeys.has(key)) {
      deletedKeys.delete(key);
      localStorage.setItem("sigep_deleted_products", safeJSONStringify(Array.from(deletedKeys)));
    }
    if (oldKey !== key && deletedKeys.has(oldKey)) {
      deletedKeys.delete(oldKey);
      localStorage.setItem("sigep_deleted_products", safeJSONStringify(Array.from(deletedKeys)));
    }

    const index = current.findIndex(
      (p) =>
        toSingularProductName(p.nome).trim().toLowerCase() === key ||
        toSingularProductName(p.nome).trim().toLowerCase() === oldKey
    );
    const existing = index >= 0 ? current[index] : null;

    const rubrica = product.rubrica || existing?.rubrica || "Bens - 121";
    const necessidade = product.necessidade || product.necessity || existing?.necessidade || "Geral";
    const categoria = product.categoria || existing?.categoria || getCategoryForRubricaOrNecessidade(rubrica, necessidade);
    const funcaoUtilizacao = product.funcaoUtilizacao || existing?.funcaoUtilizacao || inferirFuncaoUtilizacao(singularName, rubrica, necessidade);

    const updatedProduct: UnifiedProduct = {
      nome: singularName,
      preco: Number(product.preco) || 0,
      unidade: product.unidade || existing?.unidade || "Unidade",
      especificacao: product.especificacao || existing?.especificacao || "",
      rubrica: rubrica,
      necessidade: necessidade,
      categoria: categoria,
      funcaoUtilizacao: funcaoUtilizacao,
      updatedAt: new Date().toISOString(),
    };

    // 1. PRIORIDADE ABSOLUTA: Guardar na nuvem (Firestore)
    const docId = `prod_${key}`.replace(/[^a-zA-Z0-9_]/g, "_");
    try {
      await firestoreService.produtosUnificados.set(docId, updatedProduct);
      console.log(`☁️ Produto sincronizado com a nuvem: ${singularName}`);
    } catch (err) {
      console.warn("Aviso: Falha ao salvar produto na nuvem, mantendo cache local.", err);
    }

    // 2. Atualizar cache local
    let newList = [...current];
    if (index >= 0) {
      newList[index] = updatedProduct;
    } else {
      newList.push(updatedProduct);
    }
    localStorage.setItem("sigep_unified_products", safeJSONStringify(newList));

    // Sincronização global de preços e nomes em TODOS os planos de actividades (assíncrono)
    await syncGlobalProductUpdates(key, oldKey, updatedProduct).catch(err => {
      console.error("Erro na sincronização global de preços:", err);
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("produtos_precos_updated", { detail: updatedProduct }));
    }

    return getUnifiedProducts();
  } catch (e) {
    console.error("Error saving unified product:", e);
    return getUnifiedProducts();
  }
}

export async function syncGlobalProductUpdates(
  key: string,
  oldKey: string,
  updatedProduct: UnifiedProduct
) {
  try {
    const newPreco = Number(updatedProduct.preco) || 0;
    const newUnidade = updatedProduct.unidade || "Unidade";
    const newSpec = updatedProduct.especificacao || "";
    const newNome = updatedProduct.nome;

    const matchesProduct = (nomeToCheck: string) => {
      if (!nomeToCheck) return false;
      const rProdName = toSingularProductName(nomeToCheck).toLowerCase().trim();
      return (
        rProdName === key ||
        rProdName === oldKey ||
        (oldKey && oldKey.length > 2 && rProdName.includes(oldKey)) ||
        (key && key.length > 2 && rProdName.includes(key))
      );
    };

    // 1. ATUALIZAR EM ACTIVIDADES DO PLANO ('actividades')
    try {
      const allActs = await firestoreService.actividades.get();
      for (const act of allActs) {
        if (!act.id) continue;
        if (Array.isArray(act.rubricas) && act.rubricas.length > 0) {
          let actChanged = false;
          const newRubricas = act.rubricas.map((r: any) => {
            if (matchesProduct(r.nomeProduto)) {
              actChanged = true;
              const qtd = Number(r.quantidade) || 1;
              return {
                ...r,
                nomeProduto: newNome,
                precoUnitario: newPreco,
                detalhes: newUnidade || r.detalhes,
                especificacao: newSpec || r.especificacao,
                quantidade: qtd,
                valorTotal: qtd * newPreco,
              };
            }
            return r;
          });

          if (actChanged) {
            const newTotalRubricas = newRubricas.reduce(
              (sum: number, r: any) => sum + (Number(r.valorTotal) || 0),
              0
            );
            const totalGasoleo = Number(act.valorTotalGasoleo) || 0;
            const newOrcamentoTotal = newTotalRubricas + totalGasoleo;

            await firestoreService.actividades.update(act.id, {
              rubricas: newRubricas,
              valorTotal: newOrcamentoTotal > 0 ? newOrcamentoTotal : act.valorTotal,
              orcamentoTotal: newOrcamentoTotal > 0 ? newOrcamentoTotal : act.orcamentoTotal,
              valor: newOrcamentoTotal > 0 ? newOrcamentoTotal : act.valor,
              updatedAt: new Date().toISOString(),
              syncSource: "product_price_update",
            }).catch(() => {});
          }
        }
      }
    } catch (errAct) {
      console.warn("Aviso ao sincronizar actividades:", errAct);
    }

    // 2. ATUALIZAR EM MATRIX ACTIVITIES ('matrix_activities' - PLANOS DE AÇÃO E PLANOS UGEA)
    try {
      const allMatrixActs = await firestoreService.matrixActivities.get();
      let matrixUpdatedCount = 0;
      for (const act of allMatrixActs) {
        if (!act.id) continue;
        let actChanged = false;
        let newRubricas = act.rubricas;

        if (Array.isArray(act.rubricas) && act.rubricas.length > 0) {
          newRubricas = act.rubricas.map((r: any) => {
            if (matchesProduct(r.nomeProduto)) {
              actChanged = true;
              const qtd = Number(r.quantidade) || 1;
              return {
                ...r,
                nomeProduto: newNome,
                precoUnitario: newPreco,
                detalhes: newUnidade || r.detalhes,
                especificacao: newSpec || r.especificacao,
                quantidade: qtd,
                valorTotal: qtd * newPreco,
              };
            }
            return r;
          });
        }

        // Caso a própria atividade contenha nomeProduto direto
        if (matchesProduct(act.nomeProduto)) {
          actChanged = true;
        }

        if (actChanged) {
          matrixUpdatedCount++;
          const newTotalRubricas = Array.isArray(newRubricas)
            ? newRubricas.reduce((sum: number, r: any) => sum + (Number(r.valorTotal) || 0), 0)
            : 0;
          const totalGasoleo = Number(act.valorTotalGasoleo) || 0;
          const newOrcamentoTotal = newTotalRubricas + totalGasoleo;

          await firestoreService.matrixActivities.update(act.id, {
            rubricas: newRubricas,
            precoUnitario: matchesProduct(act.nomeProduto) ? newPreco : act.precoUnitario,
            valorTotal: newOrcamentoTotal > 0 ? newOrcamentoTotal : act.valorTotal,
            orcamentoTotal: newOrcamentoTotal > 0 ? newOrcamentoTotal : act.orcamentoTotal,
            total: newOrcamentoTotal > 0 ? newOrcamentoTotal : (act.total || act.valor),
            valor: newOrcamentoTotal > 0 ? newOrcamentoTotal : act.valor,
            updatedAt: new Date().toISOString(),
            syncSource: "product_price_update",
          }).catch(() => {});
        }
      }
      console.log(`☁️ Preço propagado para ${matrixUpdatedCount} planos em matrix_activities`);
    } catch (errMatrix) {
      console.warn("Aviso ao sincronizar matrix_activities:", errMatrix);
    }

    // 3. ATUALIZAR EM RASCUNHOS ('drafts')
    try {
      const allDrafts = await firestoreService.drafts.get();
      for (const d of allDrafts) {
        if (!d.id) continue;
        if (Array.isArray(d.rubricas)) {
          let draftChanged = false;
          const newDraftRubricas = d.rubricas.map((r: any) => {
            if (matchesProduct(r.nomeProduto)) {
              draftChanged = true;
              const qtd = Number(r.quantidade) || 1;
              return {
                ...r,
                nomeProduto: newNome,
                precoUnitario: newPreco,
                detalhes: newUnidade || r.detalhes,
                especificacao: newSpec || r.especificacao,
                quantidade: qtd,
                valorTotal: qtd * newPreco,
              };
            }
            return r;
          });

          if (draftChanged) {
            await firestoreService.drafts.update(d.id, {
              rubricas: newDraftRubricas,
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }
    } catch (errDrafts) {
      console.warn("Aviso ao sincronizar drafts:", errDrafts);
    }

    // 4. ATUALIZAR CACHE LOCAL EM LOCALSTORAGE
    if (typeof window !== "undefined") {
      const updateStoredActs = (storageKey: string) => {
        try {
          const raw = localStorage.getItem(storageKey);
          if (!raw) return;
          const acts = JSON.parse(raw);
          if (!Array.isArray(acts)) return;
          let changed = false;
          const updated = acts.map((act: any) => {
            if (Array.isArray(act.rubricas)) {
              let rChanged = false;
              const rubricas = act.rubricas.map((r: any) => {
                if (matchesProduct(r.nomeProduto)) {
                  rChanged = true;
                  changed = true;
                  const qtd = Number(r.quantidade) || 1;
                  return {
                    ...r,
                    nomeProduto: newNome,
                    precoUnitario: newPreco,
                    detalhes: newUnidade || r.detalhes,
                    especificacao: newSpec || r.especificacao,
                    valorTotal: qtd * newPreco,
                  };
                }
                return r;
              });
              if (rChanged) {
                const total = rubricas.reduce((s: number, r: any) => s + (Number(r.valorTotal) || 0), 0);
                return { ...act, rubricas, valorTotal: total, orcamentoTotal: total, total };
              }
            }
            return act;
          });
          if (changed) {
            localStorage.setItem(storageKey, safeJSONStringify(updated));
          }
        } catch (_) {}
      };

      updateStoredActs("sigep_local_matrix_activities");
      updateStoredActs("sigep_matrix_activities");
      updateStoredActs("sigep_local_actividades");
      updateStoredActs("sigep_actividades");

      // 5. DISPARAR EVENTOS GLOBAIS EM TEMPO REAL PARA TODO O SISTEMA
      window.dispatchEvent(new CustomEvent("matrix_activities_updated", { detail: { updatedProduct } }));
      window.dispatchEvent(new CustomEvent("sigep_actividades_updated", { detail: { updatedProduct } }));
      window.dispatchEvent(new CustomEvent("produtos_precos_updated", { detail: updatedProduct }));
    }
  } catch (syncError) {
    console.error("Erro na sincronização global de preços:", syncError);
  }
}

export async function updateProductPriceEverywhere(productName: string, newPrice: number) {
  const products = await getUnifiedProducts();
  const singular = toSingularProductName(productName).toLowerCase().trim();
  const existing = products.find(p => toSingularProductName(p.nome).toLowerCase().trim() === singular);
  if (!existing) {
    throw new Error(`Produto "${productName}" não encontrado para atualização de preço.`);
  }
  return saveUnifiedProduct({
    ...existing,
    preco: newPrice,
  });
}

export async function collectProductFromRubric(rubrica: { nomeProduto?: string; precoUnitario?: number; detalhes?: string; especificacao?: string; rubrica?: string; necessidade?: string }) {
  if (!rubrica || !rubrica.nomeProduto || String(rubrica.nomeProduto).trim() === "") return;
  await saveUnifiedProduct({
    nome: String(rubrica.nomeProduto).trim(),
    preco: Number(rubrica.precoUnitario) || 0,
    unidade: rubrica.detalhes || "Unidade",
    especificacao: rubrica.especificacao || "",
    rubrica: rubrica.rubrica,
    necessidade: rubrica.necessidade,
  });
}

let cachedFirestoreActivities: any[] = [];

// Subscrever as actividades do Firestore em tempo real para manter a cache atualizada
try {
  firestoreService.actividades.subscribe(
    (data) => {
      if (Array.isArray(data)) {
        cachedFirestoreActivities = data;
      }
    },
    (err) => {
      console.warn("Aviso ao subscrever actividades no unifiedManager:", err);
    }
  );
} catch (e) {
  console.warn("Falha ao iniciar subscrição no unifiedManager:", e);
}

export function getDepartmentStoredActivities(departmentName: string): any[] {
  // Limpeza total solicitada pelo utilizador: retornar sempre array vazio para o preenchimento automático
  return [];
}

export async function saveDepartmentActivity(departmentName: string, activityData: any) {
  if (!departmentName) return;
  try {
    const deptKey = String(departmentName || "").trim().toLowerCase();
    const current = getDepartmentStoredActivities(departmentName);

    const norm = (s: any) => String(s || "").trim().toLowerCase();
    const getActMonths = (act: any) => {
      if (Array.isArray(act.mesesRealizacao)) return act.mesesRealizacao.map(norm);
      if (act.mesRealizacao) return [norm(act.mesRealizacao)];
      if (act.mes) return [norm(act.mes)];
      return [];
    };

    const candMonths = getActMonths(activityData);
    const candName = norm(activityData.nomeActividade || activityData.title);
    const candCode = norm(activityData.codigoActividade || activityData.numeroActividade || activityData.no);

    const filtered = current.filter((a: any) => {
      if (a.id === activityData.id) return false;

      const aName = norm(a.nomeActividade || a.title);
      const aCode = norm(a.codigoActividade || a.numeroActividade || a.no);

      if ((candName && aName === candName) || (candCode && aCode === candCode)) {
        const aMonths = getActMonths(a);
        const hasSameMonth = candMonths.some((cm) => aMonths.some((am) => cm === am || cm.includes(am) || am.includes(cm)));
        if (hasSameMonth) return false;
      }
      return true;
    });

    filtered.unshift(activityData);
    
    // 1. Guardar IMEDIATAMENTE na base de dados cloud (Firestore) - PRIORIDADE ABSOLUTA
    if (activityData) {
      const payload = {
        ...activityData,
        departamento: departmentName,
        organicUnit: departmentName,
        updatedAt: new Date().toISOString(),
        synced: true,
      };
      
      try {
        if (activityData.id && !String(activityData.id).startsWith("local_")) {
          await firestoreService.updateInCollection("actividades", activityData.id, payload);
        } else {
          const newId = await firestoreService.addToCollection("actividades", payload);
          if (newId) activityData.id = newId;
        }
        console.log(`☁️ Actividade sincronizada com a nuvem: ${departmentName}`);
      } catch (err) {
        console.warn("Aviso: Falha na sincronização imediata com a nuvem, mantendo em cache local.", err);
      }
    }

    // 2. Atualizar cache local
    localStorage.setItem(`sigep_dept_activities_${deptKey}`, safeJSONStringify(filtered));
  } catch (e) {
    console.error("Error saving dept activity:", e);
  }
}
