import React from "react";
import { History, Building, User } from "lucide-react";

export default function HistoricoExpedienteView({ historico }: { historico: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-900 tracking-wider">Histórico de Tramitações</h3>
      <div className="space-y-2">
        {historico.map((item, index) => (
          <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <History size={16} />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-900">{item.acao}</span>
                <span className="text-[10px] text-slate-500 font-medium">{new Date(item.data).toLocaleString("pt-PT")}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                <Building size={12} /> <span>{item.setor}</span>
                <User size={12} /> <span>{item.usuario}</span>
              </div>
              {item.observacoes && <p className="text-[10px] text-slate-600 mt-2">{item.observacoes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
