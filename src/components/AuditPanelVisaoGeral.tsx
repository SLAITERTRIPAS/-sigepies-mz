import React, { useState, useEffect } from "react";
import { ShieldAlert, Trash2, CheckCircle2, RefreshCw, AlertTriangle } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc } from "firebase/firestore";

export function AuditPanelVisaoGeral({ onShowAlert }: { onShowAlert?: (msg: string, type?: string) => void }) {
  const [testRecordsCount, setTestRecordsCount] = useState<number>(0);
  const [isAuditing, setIsAuditing] = useState<boolean>(true);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [testDocsRefs, setTestDocsRefs] = useState<any[]>([]);

  const checkTestData = async () => {
    setIsAuditing(true);
    try {
      const collectionsToCheck = [
        "matrix_activities",
        "actividades",
        "plano_actividades",
        "expedientes",
        "notes",
        "service_requests",
        "archive_documents"
      ];

      let foundRefs: any[] = [];

      for (const colName of collectionsToCheck) {
        const snapshot = await getDocs(collection(db, colName));
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const textBlob = JSON.stringify(data).toLowerCase();
          
          const isTest = 
            textBlob.includes("teste") ||
            textBlob.includes("dummy") ||
            textBlob.includes("simulado") ||
            textBlob.includes("fictício") ||
            textBlob.includes("ficticio") ||
            data.isTest === true ||
            data.isDummy === true;

          if (isTest) {
            foundRefs.push(docSnap.ref);
          }
        });
      }

      setTestRecordsCount(foundRefs.length);
      setTestDocsRefs(foundRefs);
    } catch (err) {
      console.warn("Erro ao auditar dados de teste na Visão Geral:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    checkTestData();
  }, []);

  const handlePurgeTestData = async () => {
    if (!window.confirm(`Deseja remover permanentemente os ${testRecordsCount} registos de teste/dummy detetados?`)) {
      return;
    }

    setIsCleaning(true);
    try {
      for (let i = 0; i < testDocsRefs.length; i += 100) {
        const batchRefs = testDocsRefs.slice(i, i + 100);
        await Promise.all(batchRefs.map(ref => deleteDoc(ref)));
      }

      if (onShowAlert) {
        onShowAlert(`Limpeza concluída! ${testRecordsCount} registos de teste eliminados com sucesso.`, "success");
      } else {
        alert(`${testRecordsCount} registos de teste eliminados com sucesso.`);
      }

      setTestRecordsCount(0);
      setTestDocsRefs([]);
    } catch (err) {
      console.error(err);
      if (onShowAlert) onShowAlert("Erro ao limpar registos de teste.", "error");
    } finally {
      setIsCleaning(false);
    }
  };

  if (isAuditing) {
    return (
      <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>A auditar integridade dos dados na Visão Geral...</span>
      </div>
    );
  }

  if (testRecordsCount === 0) {
    return (
      <div className="w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Auditoria da Visão Geral: Nenhum dado de teste ou dummy detetado. Base de dados limpa.</span>
        </div>
        <button onClick={checkTestData} className="text-[11px] underline font-semibold hover:text-emerald-900 cursor-pointer">
          Reauditar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-amber-900 text-xs uppercase tracking-wider">
            Dados pendentes de limpeza real ({testRecordsCount} detetados)
          </h4>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Foram detetados registos marcados como teste ou dummy na base de dados. Recomenda-se a remoção para garantir conformidade real.
          </p>
        </div>
      </div>
      <button
        onClick={handlePurgeTestData}
        disabled={isCleaning}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
      >
        {isCleaning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        <span>Remover Registos de Teste</span>
      </button>
    </div>
  );
}
