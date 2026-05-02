import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  CheckCircle2,
  FileText,
  Activity,
  Zap,
  Loader2,
  DollarSign,
  AlertCircle,
  Lock,
  Search
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  limit 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

interface AcquisitionData {
  id: string;
  companyName: string;
  ownerName: string;
  valuation: string;
  terms: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  structuredData?: any;
  colorPalette?: 'cyan' | 'orange' | 'gold' | 'purple' | 'emerald';
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  buttonBg: string;
  text: string;
  primaryClass: string;
  accentClass: string;
}

const getTheme = (palette?: string): ThemeConfig => {
  switch (palette) {
    case 'orange':
      return { 
        primary: 'text-[#f97316]', 
        secondary: 'text-[#fbbf24]', 
        accent: 'bg-[#f97316]', 
        glow: 'from-[#f97316]/10', 
        buttonBg: 'bg-[#f97316]', 
        text: 'text-white',
        primaryClass: '#f97316',
        accentClass: 'bg-[#f97316]'
      };
    case 'gold':
      return { 
        primary: 'text-[#FFD700]', 
        secondary: 'text-[#FDB931]', 
        accent: 'bg-[#FFD700]', 
        glow: 'from-[#FFD700]/10', 
        buttonBg: 'bg-[#FFD700]', 
        text: 'text-black',
        primaryClass: '#FFD700',
        accentClass: 'bg-[#FFD700]'
      };
    case 'purple':
      return { 
        primary: 'text-[#A855F7]', 
        secondary: 'text-[#D8B4FE]', 
        accent: 'bg-[#A855F7]', 
        glow: 'from-[#A855F7]/10', 
        buttonBg: 'bg-[#A855F7]', 
        text: 'text-white',
        primaryClass: '#A855F7',
        accentClass: 'bg-[#A855F7]'
      };
    case 'emerald':
      return { 
        primary: 'text-[#10B981]', 
        secondary: 'text-[#6EE7B7]', 
        accent: 'bg-[#10B981]', 
        glow: 'from-[#10B981]/10', 
        buttonBg: 'bg-[#10B981]', 
        text: 'text-white',
        primaryClass: '#10B981',
        accentClass: 'bg-[#10B981]'
      };
    case 'cyan':
    default:
      return { 
        primary: 'text-[#00ffe0]', 
        secondary: 'text-[#34d399]', 
        accent: 'bg-[#00ffe0]', 
        glow: 'from-[#00ffe0]/10', 
        buttonBg: 'bg-[#00ffe0]', 
        text: 'text-black',
        primaryClass: '#00ffe0',
        accentClass: 'bg-[#00ffe0]'
      };
  }
};

export default function AcquisitionPortal() {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AcquisitionData | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('HOME');
  const [isAutoRefining, setIsAutoRefining] = useState(false);

  useEffect(() => {
    const autoRefine = async () => {
      // Se a proposta existe mas faltam os dados estruturados, tenta refinar em background
      if (proposal && !proposal.structuredData && !isAutoRefining && proposal.terms?.length > 5) {
        setIsAutoRefining(true);
        try {
          const response = await fetch("/api/optimize-proposal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: proposal.companyName,
              valuation: proposal.valuation,
              terms: proposal.terms
            })
          });

          const responseText = await response.text();
          let aiResult;
          try { aiResult = responseText ? JSON.parse(responseText) : null; } catch(e) {}

          if (response.ok && aiResult) {
            await updateDoc(doc(db, "acquisitions", proposal.id), {
              structuredData: aiResult
            });
            setProposal(prev => prev ? { ...prev, structuredData: aiResult } : null);
          }
        } catch (err) {
          console.error("Auto Refinement Failed:", err);
        } finally {
          setIsAutoRefining(false);
        }
      }
    };

    autoRefine();
  }, [proposal, isAutoRefining]);

  const activeTheme = getTheme(proposal?.colorPalette);

  const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Users': return <Users className={className} />;
      case 'DollarSign': return <DollarSign className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Search': return <Search className={className} />;
      default: return <CheckCircle2 className={className} />;
    }
  };

  const HomeContent = () => {
    const sData = proposal?.structuredData;
    const nicheLabel = sData?.niche || "Tecnologia";
    
    return (
      <div className="space-y-24 p-6 lg:p-12 text-white">
        <header className="space-y-12">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-bold bg-white/5 border-white/10 ${activeTheme.primary}`}>
            <Activity className="w-3 h-3" /> Ecossistema DCA {nicheLabel}
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] italic font-sans break-words">
            DCA <span className="text-white/10">X</span> <br />{proposal?.companyName}
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed font-light max-w-2xl text-white/40">
            {sData?.valuationSummary ? `Uma proposta estratégica baseada em ${sData.valuationSummary}. ` : ""}
            A jornada para integrar {proposal?.companyName} ao ecossistema DCA começa aqui.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sData?.sections?.slice(0, 2).map((section: any, idx: number) => (
            <div key={idx} className="border p-8 md:p-10 rounded-[48px] space-y-6 bg-white/[0.03] border-white/10 group hover:border-white/20 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 ${activeTheme.primary}`}>
                <IconRenderer name={section.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">{section.title}</h3>
              <p className="text-sm leading-relaxed font-medium text-white/40">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FinanceiroContent = () => {
    const sData = proposal?.structuredData;
    if (!sData) return (
      <div className="text-center py-32 space-y-8">
        <Loader2 className={`w-16 h-16 mx-auto animate-spin ${activeTheme.primary}`} />
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Refinando Estratégia por IA</h2>
          <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
            Nossa Inteligência Artificial está organizando os dados desta proposta em tempo real. <br />
            Isso leva apenas alguns segundos.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white"
          >
            Sincronizar Agora
          </button>
        </div>
      </div>
    );

    return (
      <div className="space-y-20 p-6 lg:p-12 text-white">
        <header className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Engenharia <br /><span className={activeTheme.primary}>Financeira & Oferta</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed text-white/40">
            Estrutura de capital desenhada exclusivamente para a aquisição da {proposal?.companyName}.
          </p>
        </header>

        <div className="p-10 lg:p-16 rounded-[64px] border bg-white/[0.03] border-white/5">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h3 className="text-4xl font-black uppercase tracking-tighter">Resumo Executivo</h3>
              <p className={`text-lg font-bold leading-relaxed ${activeTheme.primary}`}>
                "Combinamos segurança patrimonial com aceleração via ecossistema DCA."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-6 rounded-2xl border bg-brand-bg border-white/10 shadow-2xl">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-40">Valuation Proposto</p>
                  <p className={`text-xl font-bold ${activeTheme.primary}`}>{proposal?.valuation || sData.valuationSummary}</p>
                </div>
                <div className="p-6 rounded-2xl border bg-brand-bg border-white/10 shadow-2xl">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-40">Estrutura de Pagamento</p>
                  <p className={`text-xl font-bold ${activeTheme.primary}`}>{sData.installments}</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
               <div className="p-8 rounded-[40px] border bg-black/20 border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 font-bold">Termos de Sinergia</p>
                  <p className="text-sm leading-relaxed text-white/60 italic font-medium">
                    {proposal?.terms}
                  </p>
               </div>
               {sData.managementFee && (
                  <div className="flex items-center gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <Users className={`w-8 h-8 ${activeTheme.primary}`} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Suporte à Gestão DCA</p>
                      <p className="font-bold text-sm tracking-tight">{sData.managementFee} mensais pela operação total.</p>
                    </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DynamicSection = ({ section }: { section: any }) => (
    <div className="space-y-20 p-6 lg:p-12 text-white">
      <header className="space-y-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-bold bg-white/5 border-white/10 ${activeTheme.primary}`}>
          <IconRenderer name={section.icon} className="w-3 h-3" /> {section.title.toUpperCase()}
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
          {section.title}
        </h1>
        <p className="text-2xl leading-relaxed max-w-3xl font-light text-white/40">
          {section.content}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {section.items?.map((item: string, i: number) => (
          <div key={i} className="p-8 rounded-[40px] border border-white/5 bg-white/[0.03] space-y-4">
            <CheckCircle2 className={`w-6 h-6 ${activeTheme.primary}`} />
            <p className="font-bold leading-tight">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, "acquisitions"),
        where("accessCode", "==", accessCode.trim().toUpperCase()),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Código de acesso inválido.");
      } else {
        const docData = snapshot.docs[0];
        const data = { id: docData.id, ...docData.data() } as AcquisitionData;
        setProposal(data);
        if (data.status === 'accepted') setIsAccepted(true);
        if (data.status === 'sent') {
          try {
            await updateDoc(doc(db, "acquisitions", data.id), { status: 'viewed' });
          } catch (e) {
            console.error("Failed to update status to viewed", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao validar acesso.");
      handleFirestoreError(err, OperationType.LIST, "acquisitions");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!proposal) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "acquisitions", proposal.id), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });
      setIsAccepted(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar aceite.");
      handleFirestoreError(err, OperationType.UPDATE, `acquisitions/${proposal.id}`);
    } finally {
      setLoading(false);
    }
  };

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-8">
              <Lock className="w-10 h-10 text-white/40" />
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase text-white">DCA STRATEGIC</h1>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[4px]">Confidential Portal Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="CÓDIGO DE ACESSO" value={accessCode} 
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 outline-none focus:border-white/40 transition-all text-center tracking-[8px] font-mono text-xl uppercase text-white"
            />
            {error && <p className="text-red-400 text-[10px] text-center uppercase tracking-widest font-black">{error}</p>}
            <button disabled={loading} className="w-full bg-white text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
              {loading ? "Validando..." : "Acessar Proposta"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const navTabs = [
    { id: 'HOME', label: 'INÍCIO' },
    { id: 'FINANCEIRO', label: 'OFFER' },
    ...(proposal.structuredData?.sections?.map((s: any) => ({ id: s.title.toUpperCase(), label: s.title.toUpperCase() })) || [])
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-white selection:text-black">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 px-6 py-6 backdrop-blur-xl bg-black/80">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('HOME')}>
            <div className={`p-2 rounded-lg ${activeTheme.accent}`}>
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[4px] uppercase text-white/40 leading-tight">DCA PROTOCOL</p>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">M&A STRATEGIC HUB</h2>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? `${activeTheme.primary} border-b-2 border-current pb-1` : 'text-white/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={`hidden lg:flex px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest ${
            isAccepted ? 'bg-green-500/10 border-green-500/50 text-green-500' : `${activeTheme.primary} border-current`
          }`}>
            {isAccepted ? 'Formalizado' : 'Em Análise'}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-48 lg:pt-56 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'HOME' && <HomeContent />}
            {activeTab === 'FINANCEIRO' && <FinanceiroContent />}
            {navTabs.slice(2).map(tab => {
                if (activeTab === tab.id) {
                    const section = proposal.structuredData.sections.find((s: any) => s.title.toUpperCase() === tab.id);
                    return <React.Fragment key={tab.id}><DynamicSection section={section} /></React.Fragment>;
                }
                return null;
            })}
          </motion.div>
        </AnimatePresence>

        {/* Action Sidebar style for Home */}
        {activeTab === 'HOME' && (
             <div className="p-8 lg:p-12">
                <div className={`${activeTheme.accent} p-12 rounded-[56px] text-black max-w-xl`}>
                    <p className="text-[10px] font-black uppercase tracking-[4px] mb-8 opacity-40 italic">Chamada para Ação</p>
                    <div className="space-y-6 mb-12">
                        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">O Futuro Aguarda</h3>
                        <p className="font-bold opacity-70 leading-relaxed">
                            Analise os termos financeiros e pilares de transição. Estamos prontos para acelerar {proposal.companyName}.
                        </p>
                    </div>
                    <button 
                        onClick={() => setActiveTab('FINANCEIRO')}
                        className="w-full bg-black text-white font-black py-7 rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs"
                    >
                        Ver Estrutura de Oferta <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'FINANCEIRO' && (
            <div className="p-8 lg:p-12">
                 <div className={`${activeTheme.accent} p-12 rounded-[56px] text-black max-w-xl`}>
                    <p className="text-[10px] font-black uppercase tracking-[5px] mb-10 opacity-40 italic">Formalização</p>
                    <div className="mb-12">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Aceite da Proposta Base</p>
                        <h4 className="text-5xl font-black tracking-tighter uppercase leading-none">{proposal.valuation}</h4>
                    </div>
                    <button 
                        disabled={loading || isAccepted}
                        onClick={handleAccept}
                        className={`w-full py-7 rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[3px] transition-all bg-black text-white ${
                        isAccepted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03]'
                        }`}
                    >
                        {isAccepted ? <><CheckCircle2 className="w-5 h-5" /> Aceite Registrado</> : "Aceitar Termos Base"}
                    </button>
                    <a 
                        href="https://wa.me/5548991796036" 
                        target="_blank" rel="noopener noreferrer"
                        className="mt-4 w-full py-5 rounded-[28px] bg-black/10 hover:bg-black/20 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[2px] text-black/60"
                    >
                        Falar com Consultor
                    </a>
                </div>
            </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-5">
            <Building2 className="w-12 h-12 text-white/10" />
            <p className="text-[11px] text-white/30 uppercase tracking-[4px] font-black leading-loose">
              DCA TECHNOLOGY & EQUITY GROUP <br />
              <span className={activeTheme.primary}>Strategic Negotiation Protocol v1.4</span>
            </p>
          </div>
          <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest">Confidential & Proprietary</p>
        </div>
      </footer>
    </div>
  );
}
