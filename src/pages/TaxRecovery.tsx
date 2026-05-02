import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Phone, 
  FileSearch,
  Coins,
  Scale,
  ArrowLeft
} from "lucide-react";
import { useState, FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function TaxRecovery() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      source: 'tributaria',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'leads'), data);
      
      // Call Email API
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }

      setSubmitStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error saving lead:", error);
      setSubmitStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ffe0]/30">
      {/* Header / Nav */}
      <nav className="fixed w-full bg-black/60 backdrop-blur-xl z-50 py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-xl font-bold tracking-[4px] hero-gradient-text">DCA TEC</div>
          <a href="/" className="text-xs uppercase tracking-widest font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Home
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00ffe0]/5 blur-[120px] rounded-full opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] text-xs font-bold uppercase tracking-widest mb-8"
          >
            <ShieldCheck className="w-4 h-4" /> Parceria Estratégica OSET
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]"
          >
            Transformamos Tributos em <span className="hero-gradient-text">Caixa Imediato</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Recupere impostos pagos indevidamente nos últimos 5 anos. Processo 100% administrativo, seguro e com <span className="text-white font-bold">risco zero: você só paga se houver êxito.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#contato" className="btn-gradient px-10 py-5 rounded-2xl text-black font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Análise Gratuita <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#como-funciona" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all">
              Como Funciona
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-[#00ffe0] mb-2">60 Meses</div>
            <p className="text-white/40 uppercase tracking-widest text-xs">Período de Análise</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#00ffe0] mb-2">30-60 Dias</div>
            <p className="text-white/40 uppercase tracking-widest text-xs">Prazo de Recuperação</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#00ffe0] mb-2">100% Admin</div>
            <p className="text-white/40 uppercase tracking-widest text-xs">Sem Vias Judiciais</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicos" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-[4px]">Nossas Soluções</h2>
          <p className="text-white/40">Inteligência tributária aplicada ao seu negócio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Recuperação de Créditos",
              desc: "Identificação de valores pagos a maior em PIS, COFINS, IRPJ e CSLL.",
              icon: <Coins className="w-8 h-8" />
            },
            {
              title: "Revisão Fiscal",
              desc: "Auditoria digital completa para garantir conformidade e evitar multas.",
              icon: <FileSearch className="w-8 h-8" />
            },
            {
              title: "Redução de Passivos",
              desc: "Negociação estratégica de dívidas com descontos de até 70%.",
              icon: <Scale className="w-8 h-8" />
            },
            {
              title: "Simples Nacional",
              desc: "Recuperação específica para empresas do Simples (Monofásicos).",
              icon: <Zap className="w-8 h-8" />
            },
            {
              title: "Lucro Real/Presumido",
              desc: "Análise complexa de créditos para grandes e médias empresas.",
              icon: <TrendingUp className="w-8 h-8" />
            },
            {
              title: "Assessoria Contínua",
              desc: "Acompanhamento mensal para otimização da carga tributária.",
              icon: <ShieldCheck className="w-8 h-8" />
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-white/5 border border-white/10 rounded-[32px] hover:border-[#00ffe0]/30 transition-all group"
            >
              <div className="text-[#00ffe0] mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Us / CTA */}
      <section id="como-funciona" className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 tracking-tight">Por que escolher a <span className="text-[#00ffe0]">DCA TEC + OSET</span>?</h2>
            <div className="space-y-6">
              {[
                "Tecnologia de ponta para auditoria digital.",
                "Segurança jurídica com base em decisões do STF/STJ.",
                "Pagamento de honorários apenas no sucesso (êxito).",
                "Equipe multidisciplinar: Contadores, Advogados e Engenheiros.",
                "Processo ágil: dinheiro no caixa em tempo recorde."
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-[#00ffe0] shrink-0" />
                  <p className="text-white/70">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-[#00ffe0]/10 blur-2xl rounded-[40px]" />
            <div className="relative bg-black border border-white/10 p-10 rounded-[40px]">
              <h3 className="text-2xl font-bold mb-6">Solicite sua Análise</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  name="name"
                  type="text" 
                  placeholder="Nome Completo" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all" 
                  required
                  disabled={isSubmitting}
                />
                <input 
                  name="email"
                  type="email" 
                  placeholder="E-mail Corporativo" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all" 
                  required
                  disabled={isSubmitting}
                />
                <input 
                  name="company"
                  type="text" 
                  placeholder="CNPJ ou Empresa" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all" 
                  required
                  disabled={isSubmitting}
                />
                
                {submitStatus === 'success' && (
                  <p className="text-green-400 text-xs font-medium text-center">Solicitação Enviada! Obrigado pelo contato. Nossa equipe analisará seus dados em breve.</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-400 text-xs font-medium text-center">Erro ao enviar. Tente novamente ou fale no WhatsApp.</p>
                )}

                <button 
                  type="submit"
                  className="w-full btn-gradient py-4 rounded-xl text-black font-bold text-lg hover:scale-[1.02] transition-transform mt-4 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processando...' : 'Iniciar Auditoria Gratuita'}
                </button>
              </form>
              <p className="text-[10px] text-white/30 mt-6 text-center uppercase tracking-widest">
                Seus dados estão protegidos pela LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-[4px] hero-gradient-text">DCA TEC</div>
          <div className="flex gap-8">
            <a href="#" className="text-white/30 hover:text-[#00ffe0] text-xs transition-colors">Privacidade</a>
            <a href="#" className="text-white/30 hover:text-[#00ffe0] text-xs transition-colors">Termos</a>
            <a href="#" className="text-white/30 hover:text-[#00ffe0] text-xs transition-colors">OSET</a>
          </div>
          <p className="text-white/20 text-[10px] uppercase tracking-[4px]">
            © 2026 Grupo DCA TEC • Inteligência Fiscal
          </p>
        </div>
      </footer>
    </div>
  );
}
