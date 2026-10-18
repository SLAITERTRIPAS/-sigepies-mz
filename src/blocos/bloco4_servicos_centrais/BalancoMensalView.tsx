import React, { useState } from "react";
import { InstitutionalHeader } from "../../components/InstitutionalHeader";
import { printElementById } from "../../lib/printUtils";
import { Printer, FileText, CheckCircle2, Award, User, Target, TrendingUp, AlertTriangle, Lightbulb, Compass, CheckCircle, ShieldCheck, BookOpen, GraduationCap } from "lucide-react";

interface BalancoMensalViewProps {
  movements?: any[];
  user?: any;
  setor?: string;
  onBack?: () => void;
}

export default function BalancoMensalView({ user, onBack }: BalancoMensalViewProps) {
  const reportPages = [
    {
      id: 1,
      title: "Capa Institucional",
      subtitle: "Relatório Oficial de Atividades e Desempenho",
      icon: Award,
      content: (
        <div className="flex flex-col items-center justify-center min-h-[680px] text-center p-10 space-y-8 bg-gradient-to-b from-[#000066] to-[#000033] text-white rounded-3xl shadow-2xl border-4 border-amber-400">
          <div className="w-28 h-28 rounded-3xl bg-white/10 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-4xl shadow-xl backdrop-blur-md">
            SIGEP
          </div>
          <div className="space-y-4 max-w-3xl">
            <span className="px-4 py-1.5 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-[0.3em] rounded-full shadow-md">
              Documento Oficial Padrão
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-wide uppercase text-white leading-tight">
              Balanço de Atividades e Desempenho Institucional
            </h1>
            <p className="text-amber-300 font-bold text-base tracking-widest uppercase">
              {user?.instituicao || "Instituição Pública da República de Moçambique"}
            </p>
          </div>
          <div className="w-40 h-1 bg-amber-400 rounded-full my-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl text-left bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest block">Colaborador / Autor:</span>
              <span className="text-sm font-bold text-white">{user?.name || user?.nome || "Funcionário Responsável"}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest block">Cargo / Função:</span>
              <span className="text-sm font-bold text-white">{user?.cargoChefia || user?.role || "Técnico Superior"}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest block">Unidade Orgânica:</span>
              <span className="text-sm font-bold text-white">{user?.direcao || user?.departamento || "Direção Central"}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest block">Data de Emissão:</span>
              <span className="text-sm font-bold text-white">{new Date().toLocaleDateString("pt-PT")}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Identificação do Colaborador",
      subtitle: "Enquadramento Orgânico, Competências e Perfil Profissional",
      icon: User,
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-justify">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <User className="text-blue-600 w-5 h-5" /> 1.1 Enquadramento Funcional e Institucional
            </h3>
            <p className="text-sm">
              O presente balanço reflete a atividade profissional desenvolvida por <strong>{user?.name || user?.nome || "o colaborador"}</strong>, exercendo funções como <strong>{user?.cargoChefia || user?.role || "Técnico"}</strong> afeto à <strong>{user?.instituicao || "Instituição"}</strong>. A atuação pautou-se pelo cumprimento rigoroso dos deveres profissionais, ética de serviço público e dedicação ao desenvolvimento institucional.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Target className="text-blue-600 w-5 h-5" /> 1.2 Responsabilidades e Atribuições
            </h3>
            <p className="text-sm">
              No âmbito das atribuições do posto de trabalho, coube ao colaborador coordenar, executar e acompanhar processos administrativos, assegurar a articulação harmoniosa entre departamentos e garantir que o fluxo de informação e prestação de serviços decorresse com celeridade, transparência e rigor humanizado.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Resumo Executivo",
      subtitle: "Visão Global, Síntese de Realizações e Impacto Periódico",
      icon: FileText,
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-justify">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600 w-5 h-5" /> Síntese do Desempenho Institucional
            </h3>
            <p className="text-sm">
              O período sob análise foi caracterizado por um esforço coletivo e individual notável na modernização dos procedimentos internos. Através da plataforma SIGEP, consolidou-se uma gestão mais integrada e humanizada, colocando o cidadão e a qualidade do serviço público no centro de todas as prioridades.
            </p>
            <p className="text-sm">
              Destaca-se o cumprimento exemplar das metas físicas estabelecidas, a redução significativa de pendências processuais e a melhoria palpável no clima de cooperação entre as diferentes repartições e setores da instituição.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Enquadramento Institucional",
      subtitle: "Missão, Visão e Contexto de Governação",
      icon: ShieldCheck,
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-justify">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900">Contexto e Missão da Instituição</h3>
            <p className="text-sm">
              A instituição atua como pilar fundamental na prestação de serviços públicos de qualidade, promovendo a governação transparente, a eficácia administrativa e o atendimento centrado nas necessidades da sociedade moçambicana. O enquadramento institucional define as diretrizes estratégicas que orientam cada decisão operacional.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Objetivos Planeados",
      subtitle: "Metas Estratégicas, Diretrizes e Compromissos Programáticos",
      icon: Target,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              Modernização Digital Humanizada
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Promover a transição digital dos serviços com foco na simplificação de balcões e processos, garantindo que a tecnologia sirva de ponte empática e célere entre a instituição e os utentes.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
              Rigor na Execução Orçamental e Patrimonial
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Garantir a alocação eficiente dos recursos financeiros e materiais, respeitando escrupulosamente as rubricas aprovadas e promovendo a transparência em cada aquisição e inventário.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
              Valorização do Capital Humano
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Estimular a capacitação contínua, o bem-estar no local de trabalho e o reconhecimento do mérito dos colaboradores em todos os níveis hierárquicos.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Plano de Atividades Executadas",
      subtitle: "Registo Operacional, Tarefas Executadas e Intervenções de Campo",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Gestão e Tramitação de Expediente
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recepção, análise criteriosa, encaminhamento e despacho tempestivo de correspondências e processos, garantindo que nenhum expediente ficasse sem resposta ou seguimento adequado.
            </p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Monitoria de Planos de Atividades
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acompanhamento regular do grau de execução das metas programadas nos departamentos e setores, prestando apoio técnico na resolução de impasses operacionais.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "Resultados Alcançados",
      subtitle: "Impacto das Ações, Efetividade e Conquistas Institucionais",
      icon: TrendingUp,
      content: (
        <div className="space-y-6 text-slate-700 text-justify">
          <div className="p-6 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-4 shadow-xs">
            <h3 className="text-base font-black text-emerald-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Conquistas de Destaque
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Os resultados falam por si: atingiu-se uma taxa de conclusão de tarefas superior a 90%, com notável satisfação por parte dos utentes e colegas. A eliminação de barreiras burocráticas permitiu devolver dignidade e agilidade ao serviço público prestado.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: "Indicadores de Desempenho (KPIs)",
      subtitle: "Métricas Quantitativas e Qualitativas de Produtividade",
      icon: Award,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Celeridade Processual</span>
            <div className="text-3xl font-black text-blue-600">Elevada</div>
            <p className="text-xs text-slate-500">Redução drástica no tempo médio de tramitação de expedientes.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Satisfação e Clima Laboral</span>
            <div className="text-3xl font-black text-emerald-600">Excelente</div>
            <p className="text-xs text-slate-500">Ambiente de trabalho pautado pela harmonia, empatia e cooperação.</p>
          </div>
        </div>
      )
    },
    {
      id: 9,
      title: "Dificuldades e Constrangimentos",
      subtitle: "Análise Humana e Crítica dos Obstáculos Superados",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 shadow-xs">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Superação de Desafios Operacionais
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              Todo o percurso institucional enfrenta desafios. Destacaram-se constrangimentos pontuais de natureza logística e a curva de adaptação tecnológica em setores específicos. No entanto, através de resiliência, diálogo e espírito de missão, cada obstáculo foi transformado numa oportunidade de melhoria e aprendizagem coletiva.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 10,
      title: "Medidas Corretivas",
      subtitle: "Ações Imediatas e Estratégias de Mitigação",
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-black text-slate-900 text-sm">Plano de Mitigação de Riscos</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Implementação de rondas de verificação semanal e suporte técnico dedicado para neutralizar gargalos operacionais antes que afetem os prazos institucionais.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 11,
      title: "Inovação e Boas Práticas",
      subtitle: "Abordagens Criativas e Otimização de Processos",
      icon: Lightbulb,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-black text-slate-900 text-sm">Cultura de Inovação Digital</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adoção de modelos desmaterializados de tramitação, desburocratização de balcões e fomento à colaboração em rede através do SIGEP.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 12,
      title: "Formação e Capacitação",
      subtitle: "Desenvolvimento de Competências do Capital Humano",
      icon: GraduationCap,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-black text-slate-900 text-sm">Ciclos de Capacitação Contínua</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Realização de seminários internos e sessões práticas de formação para assegurar proficiência técnica e excelência no atendimento.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 13,
      title: "Plano de Atividades Futuras",
      subtitle: "Projeções Estratégicas e Metas para o Próximo Ciclo",
      icon: Compass,
      content: (
        <div className="space-y-4 text-slate-700 text-justify">
          <div className="p-6 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-3 shadow-xs">
            <h4 className="font-black text-indigo-900 text-sm">Prioridades Imediatas</h4>
            <ul className="list-disc list-inside text-xs text-indigo-900 space-y-2 font-medium">
              <li>Execução integral do plano de atividades do próximo trimestre com foco em resultados de alto impacto.</li>
              <li>Aperfeiçoamento contínuo dos mecanismos de atendimento humanizado ao cidadão.</li>
              <li>Revisão periódica de indicadores de desempenho para assegurar alinhamento com a visão institucional.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 14,
      title: "Conclusões e Recomendações",
      subtitle: "Considerações Finais e Orientações Estratégicas",
      icon: CheckCircle,
      content: (
        <div className="space-y-6 text-slate-700 text-justify">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <p className="text-sm leading-relaxed">
              O presente balanço encerra-se com um sentimento de dever cumprido e renovada esperança no futuro da instituição. Os resultados alcançados demonstram que, com dedicação, união e ferramentas adequadas como o SIGEP, é possível transformar a administração pública num exemplo de eficiência, ética e humanismo.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 15,
      title: "Validação e Assinaturas",
      subtitle: "Aprovação Superior e Chancela Institucional",
      icon: Award,
      content: (
        <div className="space-y-6 text-slate-700 text-justify">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <p className="text-sm leading-relaxed">
              Documento validado e aprovado pelos órgãos competentes, atestando a veracidade e conformidade de todas as informações aqui apresentadas.
            </p>
          </div>
          <div className="pt-12 flex justify-between items-center border-t border-slate-200 mt-16 text-center text-xs font-bold text-slate-700">
            <div className="space-y-3">
              <div className="w-56 border-b-2 border-slate-400 mx-auto pb-1"></div>
              <span className="block font-black">O Colaborador / Autor</span>
              <span className="text-[10px] text-slate-400">{user?.name || user?.nome || "Responsável"}</span>
            </div>
            <div className="space-y-3">
              <div className="w-56 border-b-2 border-slate-400 mx-auto pb-1"></div>
              <span className="block font-black">O Superior Hierárquico / Diretor</span>
              <span className="text-[10px] text-slate-400">Aprovação Superior</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div id="balanco-print-area" className="w-full max-w-5xl mx-auto p-6 bg-white space-y-12 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between no-print border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Balanço de Atividades • Estrutura Oficial Completa</h2>
          <p className="text-xs text-slate-500">Relatório executivo contendo todos os 15 títulos e capítulos exigidos.</p>
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
              Voltar
            </button>
          )}
          <button onClick={() => printElementById("balanco-print-area", "Balanço de Atividades Completo")} className="flex items-center gap-2 bg-[#000066] text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-md hover:bg-blue-950 cursor-pointer">
            <Printer size={15} /> Imprimir Relatório Completo
          </button>
        </div>
      </div>

      {/* Renderização Contínua de Todos os Capítulos Visíveis */}
      <div className="space-y-12">
        {reportPages.map((page) => {
          const IconComp = page.icon;
          return (
            <div key={page.id} className="min-h-[650px] p-8 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-sm print:border-none print:shadow-none print-page-break flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#000066] flex items-center justify-center font-black shadow-xs">
                      <IconComp size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest block">
                        Secção {page.id} de {reportPages.length}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                        {page.title}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">{page.subtitle}</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-mono font-bold">
                    Página {page.id}
                  </span>
                </div>

                <div className="py-2">
                  {page.content}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 mt-12">
                <span>SIGEP • Relatório Institucional de Balanço de Atividades</span>
                <span className="font-mono font-bold">Página {page.id} / {reportPages.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
