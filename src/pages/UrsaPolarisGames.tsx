import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, 
  ChevronRight, 
  ArrowLeft, 
  Zap, 
  Layers, 
  Eye, 
  Maximize, 
  Users,
  Target,
  Box,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function UrsaPolarisGames() {
  const [activeSegment, setActiveSegment] = useState(0);

  const segments = [
    {
      title: "Virtual Reality (VR)",
      description: "Imersão total em ambientes 3D hiper-realistas para treinamentos, visitas virtuais e apresentações de alto impacto.",
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d"
    },
    {
      title: "Gamificação Corporativa",
      description: "Transformamos processos complexos em experiências interativas que aumentam o engajamento e a retenção de conhecimento.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420"
    },
    {
      title: "Projetos Arquitetônicos 3D",
      description: "Caminhe pelo seu projeto antes mesmo dele ser construído. Interatividade e realismo sem precedentes.",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 py-6 px-8 flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase font-bold tracking-[6px] text-white/50">DCA ECOSYSTEM</span>
        </Link>
        <div className="flex items-center gap-4">
           <Gamepad2 className="text-sky-400 w-6 h-6" />
           <span className="text-xs font-black uppercase tracking-[2px]">Ursa Polaris Games</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="h-screen flex flex-col justify-center items-center text-center px-6 relative">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1 }}
           className="relative z-10"
        >
          <h1 className="text-7xl md:text-[10rem] font-black leading-none tracking-tighter mb-4 italic uppercase">
            Beyond <br /> Reality.
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-60 max-w-2xl mx-auto mb-10">
            DCA Ursa Polaris Games: Criando experiências imersivas, jogos educativos e tours virtuais 3D que desafiam os sentidos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
             <button className="px-8 py-4 bg-sky-500 text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors flex items-center gap-2">
               Iniciar Imersão <ChevronRight className="w-4 h-4" />
             </button>
             <button className="px-8 py-4 border border-white/20 text-white font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all">
               Portfólio 3D
             </button>
          </div>
        </motion.div>

        {/* 3D Model Placeholder Decor */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-[80vw] h-[80vw] border border-white/5 rounded-full flex items-center justify-center"
          >
             <div className="w-[60vw] h-[60vw] border border-white/10 rounded-full flex items-center justify-center">
                <div className="w-[40vw] h-[40vw] border border-white/20 rounded-full" />
             </div>
          </motion.div>
        </div>
      </header>

      {/* Interactive Segments */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[8px] text-sky-400 mb-6 block">Nossos Departamentos</span>
            <div className="space-y-6">
              {segments.map((seg, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSegment(i)}
                  className={`w-full text-left p-8 rounded-2xl transition-all border ${
                    activeSegment === i 
                      ? 'bg-white/10 border-sky-400/50 shadow-[0_20px_40px_rgba(0,163,255,0.1)]' 
                      : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  <h3 className={`text-2xl font-bold mb-2 transition-colors ${activeSegment === i ? 'text-sky-400' : 'text-white'}`}>
                    {seg.title}
                  </h3>
                  <p className={`text-sm leading-relaxed transition-opacity ${activeSegment === i ? 'opacity-80' : 'opacity-30'}`}>
                    {seg.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative aspect-square rounded-[40px] overflow-hidden group shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSegment}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                src={segments[activeSegment].image}
                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                alt="Ursa Polaris Section"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 flex items-center gap-3">
               <div className="p-3 bg-sky-500 rounded-full animate-bounce">
                  <Maximize className="w-4 h-4 text-black" />
               </div>
               <span className="text-xs font-black uppercase tracking-[2px]">360 Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visionary Section */}
      <section className="py-32 px-8 bg-sky-500 text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
           <div>
              <Users className="w-10 h-10 mb-6" />
              <h4 className="text-2xl font-black mb-4 uppercase">Para Educação</h4>
              <p className="font-medium opacity-80 leading-relaxed">Desenvolvemos jogos didáticos que transformam o aprendizado em uma jornada épica.</p>
           </div>
           <div>
              <Building2 className="w-10 h-10 mb-6" />
              <h4 className="text-2xl font-black mb-4 uppercase">Para Indústria</h4>
              <p className="font-medium opacity-80 leading-relaxed">Simulações VR para treinamento de alto risco e tours industriais imersivos.</p>
           </div>
           <div>
              <Zap className="w-10 h-10 mb-6" />
              <h4 className="text-2xl font-black mb-4 uppercase">Para Conceito</h4>
              <p className="font-medium opacity-80 leading-relaxed">Prototipação 3D interativa para visualização de produtos e ambientes conceituais.</p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-white/5 opacity-30 select-none">
         <span className="text-[10px] uppercase font-bold tracking-[10px]">Ursa Polaris Games // Immersive Sub-division</span>
      </footer>
    </div>
  );
}
