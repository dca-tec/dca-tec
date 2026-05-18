import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { projectsData } from "../data/projectsData";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? projectsData[slug] : null;

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const Icon = project.icon;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ffe0] selection:text-black">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 py-6 px-10 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 group">
          <ChevronLeft className="w-5 h-5 text-[#00ffe0] group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-[4px] font-bold">Voltar para Ecossistema</span>
        </Link>
        <div className="text-xl font-bold tracking-[4px] hero-gradient-text hidden md:block">
          DCA TEC // {project.name.toUpperCase()}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-12 items-end justify-between"
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[#00ffe0]">
                <Icon className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase tracking-[4px] text-white/40 font-bold">{project.category}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8">
              {project.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl font-light">
              {project.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto">
             <button className="px-10 py-5 btn-gradient rounded-full text-black font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2">
               Solicitar Orçamento <ArrowUpRight className="w-4 h-4" />
             </button>
             <a 
               href={`https://wa.me/5548991796036?text=Olá, gostaria de saber mais sobre ${project.name}`}
               target="_blank"
               rel="noopener noreferrer"
               className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
             >
               Falar com Consultor
             </a>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="px-10 max-w-7xl mx-auto py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Detailed Info */}
          <section className="lg:col-span-2 space-y-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xs uppercase tracking-[6px] text-[#00ffe0] font-bold mb-8">Visão Geral</h2>
              <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                {project.longDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xs uppercase tracking-[6px] text-[#00ffe0] font-bold mb-10">Destaques Estratégicos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {project.features.map((feature, i) => (
                  <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 group hover:border-[#00ffe0]/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#00ffe0]/10 flex items-center justify-center text-[#00ffe0] mb-6 group-hover:scale-110 transition-transform">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-widest">{feature}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Sidebar / Specs */}
          <aside className="space-y-12">
            <div className="sticky top-32 p-10 bg-white/5 rounded-[40px] border border-white/10">
              <h3 className="text-[10px] uppercase tracking-[4px] font-bold text-white/30 mb-8">Padrão de Qualidade DCA</h3>
              <ul className="space-y-6">
                {[
                  "Certificação ISO Industrial",
                  "Gestão Integrada via IA",
                  "Design Minimalista",
                  "Sustentabilidade Nativa"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-1.5 h-1.5 bg-[#00ffe0] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="mt-12 pt-12 border-t border-white/10">
                 <div className="flex items-center gap-4 text-white/40 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Unidade Oficial</span>
                 </div>
                 <p className="text-xs text-white/20">Este projeto faz parte do ecossistema central DCA TEC, operado pela Holding Vale das Araucárias SA.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="py-40 px-10 text-center relative overflow-hidden bg-white/[0.02]">
        <div className="absolute inset-0 bg-[#00ffe0]/5 blur-[120px] rounded-full scale-50" />
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">Pronto para iniciar?<br/><span className="hero-gradient-text uppercase">O futuro é agora.</span></h2>
          <button className="px-16 py-6 btn-gradient rounded-full text-black font-bold text-lg uppercase tracking-widest hover:scale-105 transition-transform">
            Entrar em Contato
          </button>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-white/20 uppercase tracking-[4px]">
          <div>&copy; {new Date().getFullYear()} DCA TEC GROUP</div>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-white transition-colors">Ecosystem</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
