import React, { useState, useEffect } from "react";
import { ShieldAlert, Plus, Trash2, Save, RefreshCw, CheckCircle, Database } from "lucide-react";
import { getInstitutionIgnoreConfig, saveInstitutionIgnoreConfig, runInstitutionDataIgnorePurge, DEFAULT_IGNORED_TYPES, DataIgnoreConfig } from "../../lib/dataIgnoreService";
import { getActiveInstituicao } from "../../lib/instituicaoEstruturaService";

export function DataIgnoreConfigView({ user, onShowAlert }: { user?: any; onShowAlert?: (msg: string, type?: string) => void }) {
  const [config, setConfig] = useState<DataIgnoreConfig>({
    instituicaoId: "",
    ignoredTypes: DEFAULT_IGNORED_TYPES,
    autoCleanOnBoot: true,
  });
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(false);
  const [purging, setPurging] = useState(false);

  const activeInst = getActiveInstituicao();
  const instituicaoId = activeInst?.id || user?.instituicaoId || "default_instituicao";

  useEffect(() => {
    loadConfig();
  }, [instituicaoId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const cfg = await getInstitutionIgnoreConfig(instituicaoId);
      setConfig(cfg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = () => {
    if (!newType.trim()) return;
    if (config.ignoredTypes.includes(newType.trim())) return;

    setConfig({
      ...config,
      ignoredTypes: [...config.ignoredTypes, newType.trim()]
    });
    setNewType("");
  };

  const handleRemoveType = (typeToRemove: string) => {
    setConfig({
      ...config,
      ignoredTypes: config.ignoredTypes.filter(t => t !== typeToRemove)
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await saveInstitutionIgnoreConfig({
        ...config,
        instituicaoId
      });
      if (success) {
        if (onShowAlert) onShowAlert("Configuração de tipos de dados ignorados salva com sucesso!", "success");
        else alert("Salvo com sucesso!");
      } else {
        if (onShowAlert) onShowAlert("Erro ao salvar configuração.", "error");
        else alert("Erro ao salvar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPurgeNow = async () => {
    if (!window.confirm("Deseja executar a purga imediata dos registos correspondentes aos tipos configurados para esta instituição?")) {
      return;
    }

    setPurging(true);
    try {
      const result = await runInstitutionDataIgnorePurge(instituicaoId);
      if (onShowAlert) {
        onShowAlert(`Purga concluída! ${result.purgedCount} registos indesejados eliminados com sucesso.`, "success");
      } else {
        alert(`Purga concluída! ${result.purgedCount} registos eliminados.`);
      }
      loadConfig();
    } catch (err) {
      console.error(err);
      if (onShowAlert) onShowAlert("Erro ao executar purga de dados.", "error");
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded-xl shadow-md border border-slate-200">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
            Gestão e Isolamento de Tipos de Dados a Ignorar
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure os tipos de dados, relatórios de teste ou registos dummy que o sistema deve ignorar ou excluir automaticamente para manter a instituição limpa.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            {activeInst?.nome || "Instituição Atual"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Opção de Auto-limpeza */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <h4 className="font-semibold text-slate-700">Limpeza Automática ao Inicializar</h4>
              <p className="text-xs text-slate-500">Excluir automaticamente dados correspondentes aos tipos ignorados sempre que o sistema carregar.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoCleanOnBoot}
                onChange={(e) => setConfig({ ...config, autoCleanOnBoot: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Adicionar Novo Tipo */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Adicionar Tipo de Dado a Ignorar/Excluir</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 'Relatórios de Teste', 'Utilizadores Dummy', 'Demo'..."
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddType()}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleAddType}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-1 text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          {/* Lista de Tipos Configurados */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Tipos de Dados Atualmente Ignorados ({config.ignoredTypes.length})</label>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[100px]">
              {config.ignoredTypes.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum tipo configurado. O sistema aceitará todos os dados.</p>
              ) : (
                config.ignoredTypes.map((typeStr) => (
                  <span
                    key={typeStr}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg shadow-xs"
                  >
                    <span>{typeStr}</span>
                    <button
                      onClick={() => handleRemoveType(typeStr)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {config.lastCleanedAt && (
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Última execução de limpeza baseada nestas regras: {new Date(config.lastCleanedAt).toLocaleString()}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={handleRunPurgeNow}
              disabled={purging}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 text-sm font-semibold transition disabled:opacity-50"
            >
              {purging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Executar Purga Imediata
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold transition shadow-md disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Configuração
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
