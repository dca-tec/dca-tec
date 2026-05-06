import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Code, 
  Terminal, 
  Cpu, 
  Globe, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Database,
  Cloud,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DcaKode() {
  const features = [
    {
      title: "Full-Stack Development",
      description: "Aplicações escaláveis do front ao back-end com as tecnologias mais modernas do mercado.",
      icon: <Layers className="w-6 h-6" />
    },
    {
      title: "Cloud Infrastructure",
      description: "Arquitetura em nuvem otimizada para performance, segurança e alta disponibilidade.",
      icon: <Cloud className="w-6 h-6" />
    },
    {
      title: "Data Intelligence",
      description: "Transformamos dados brutos em insights acionáveis através de engenharia avançada.",
      icon: <Database className="w-6 h-6" />
    },
    {
      title: "Security by Design",
      description: "Sistemas robustos com camadas de proteção integradas desde a primeira linha de código.",
      icon: <ShieldCheck className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-[#00ffe0] selection:text-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 py-6 px-10 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/50">
        <Link to="/" className="flex items-center gap-3 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase font-bold tracking-[4px]">DCA ECOSYSTEM</span>
        </Link>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#00ffe0] animate-pulse" />
           <span className="text-[10px] font-bold tracking-[2px] opacity-60 uppercase">System: Online</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-10 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full border border-[#00ffe0]/20 bg-[#00ffe0]/5 text-[#00ffe0] text-[10px] font-bold uppercase tracking-widest mb-8">
              <Terminal className="w-3 h-3" /> Root access granted
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-none tracking-tighter">
              CODING THE <br />
              <span className="text-[#00ffe0]">FUTURE BEYOND</span> <br />
              CONVENTIONS.
            </h1>
            <p className="max-w-2xl text-lg text-white/50 leading-relaxed mb-12">
              DCA KODE é o laboratório de engenharia de software do grupo DCA TEC. 
              Desenvolvemos sistemas críticos, plataformas disruptivas e inteligência artificial 
              para resolver os desafios mais complexos da era digital.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="px-10 py-4 bg-[#00ffe0] text-black font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                Init Project <ChevronRight className="w-4 h-4" />
              </button>
              <a 
                href="https://kode.dca.tec.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 border border-white/20 text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center text-center"
              >
                View Stack
              </a>
            </div>
          </motion.div>
        </div>

        {/* Binary background decoration */}
        <div className="absolute top-20 right-0 text-[10px] opacity-5 pointer-events-none select-none max-w-sm hidden lg:block overflow-hidden h-full font-mono">
           {Array.from({length: 100}).map((_, i) => (
             <div key={i}>{Math.random() > 0.5 ? '10101100' : '01010011'} {Math.random().toString(16).slice(2)}</div>
           ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 border border-white/5 bg-white/[0.02] hover:border-[#00ffe0]/40 transition-all group"
            >
              <div className="text-[#00ffe0] mb-6 group-hover:scale-110 transition-transform origin-left">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-20 overflow-hidden border-y border-white/5 bg-white/[0.01]">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-20 text-4xl font-black opacity-10 uppercase tracking-widest">
          {[...Array(10)].map((_, i) => (
            <span key={i}>React // Node.js // TypeScript // Python // Go // Docker // Kubernetes // AI // ML // AWS // GCP</span>
          ))}
        </div>
      </section>

      {/* Code Sample Section */}
      <section className="py-32 px-10">
        <div className="max-w-6xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40">
             <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/20" />
               <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
               <div className="w-3 h-3 rounded-full bg-green-500/20" />
             </div>
             <span className="text-[10px] font-bold tracking-[2px] opacity-40">dca_kode_engine.ts</span>
          </div>
          <div className="p-10 font-mono text-sm leading-relaxed text-[#00ffe0]/80 overflow-x-auto">
            <pre>
              {`// INITIALIZING DCA KODE CORE ENGINE
async function deployFuture(params: InnovationParams) {
  const stack = await resolveEcosystem(DCA_TEC);
  
  return stack.map(solution => ({
    ...solution,
    performance: 'optimistic',
    security: 'hardened',
    impact: 'disruptive'
  }));
}

// System check...
// [SUCCESS] Environment ready.
// [BUILDING] Scalability layer initialized.`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/5 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[8px] opacity-20">
          DCA KODE // SUB-SYSTEM OF DCA TEC ECOSYSTEM // &copy; {new Date().getFullYear()}
        </div>
      </footer>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
