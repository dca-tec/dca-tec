import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Gavel, 
  FileCheck, 
  ShieldCheck, 
  Search, 
  Bell, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  Scale
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Licitacoes() {
  const steps = [
    { title: "Monitoramento", desc: "Monitoramos centenas de portais diariamente em busca das melhores oportunidades para seu negócio." },
    { title: "Análise Técnica", desc: "Nossa equipe jurídica e técnica avalia cada edital para garantir viabilidade e conformidade." },
    { title: "Participação", desc: "Executamos todo o processo de habilitação e lances com precisão técnica absoluta." },
    { title: "Gestão", desc: "Gestão completa de contratos e documentações após a vitória no certame." }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Top Bar Label */}
      <div className="bg-[#141414] text-white py-2 px-10 text-[10px] font-bold uppercase tracking-[4px] flex justify-between">
         <span>DCA TEC // LICITAÇÕES</span>
         <span className="opacity-50">Legal & Compliance Division</span>
      </div>

      {/* Navigation */}
      <nav className="py-8 px-10 border-b border-black/10 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-[2px]">Ecossistema DCA</span>
        </Link>
        <div className="hidden md:flex gap-10">
          <a href="#metodo" className="text-[10px] uppercase font-bold tracking-[2px] hover:opacity-50 transition-opacity">Método</a>
          <a href="#contato" className="text-[10px] uppercase font-bold tracking-[2px] hover:opacity-50 transition-opacity">Contato</a>
          <Link to="/login" className="px-4 py-2 bg-black text-white rounded-sm text-[10px] uppercase font-bold tracking-[2px]">Acesso ao Portal</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-32 px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
           <div className="w-16 h-1px bg-black mb-8" />
           <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tighter">
             Sua empresa em <br />
             <span className="italic font-serif">todos os editais.</span>
           </h1>
           <p className="text-xl text-black/60 leading-relaxed mb-10 max-w-lg">
             A DCA Licitações oferece consultoria completa para empresas que buscam vender para o governo. 
             Combinamos inteligência tecnológica e rigor jurídico.
           </p>
           <button className="px-12 py-5 bg-black text-white font-bold uppercase text-xs tracking-widest hover:opacity-80 transition-opacity">
              Falar com Consultor
           </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white border border-black/10 p-8 flex flex-col justify-between aspect-square">
              <Gavel className="w-6 h-6 mb-4" />
              <h3 className="text-xs font-black uppercase tracking-[2px]">Monitoramento <br /> Inteligente</h3>
           </div>
           <div className="bg-[#141414] text-white p-8 flex flex-col justify-between aspect-square">
              <ShieldCheck className="w-6 h-6 mb-4" />
              <h3 className="text-xs font-black uppercase tracking-[2px]">Compliance <br /> Jurídico</h3>
           </div>
           <div className="bg-white border border-black/10 p-8 flex flex-col justify-between aspect-square">
              <Scale className="w-6 h-6 mb-4" />
              <h3 className="text-xs font-black uppercase tracking-[2px]">Habilitação <br /> Técnica</h3>
           </div>
           <div className="bg-white border border-black/10 p-8 flex flex-col justify-between aspect-square">
              <Building2 className="w-6 h-6 mb-4" />
              <h3 className="text-xs font-black uppercase tracking-[2px]">Contratos <br /> Governamentais</h3>
           </div>
        </div>
      </section>

      {/* Method Section */}
      <section id="metodo" className="py-32 px-10 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left">
             <span className="text-[10px] uppercase font-bold tracking-[8px] opacity-40 mb-4 block">Nosso Método</span>
             <h2 className="text-4xl md:text-5xl font-bold">Processo de Venda B2G.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1px bg-white/10">
             {steps.map((step, i) => (
               <div key={i} className="p-12 bg-black border border-white/5 group hover:bg-white/5 transition-colors">
                  <span className="text-4xl font-serif italic text-white/20 mb-8 block group-hover:text-white transition-colors">0{i+1}</span>
                  <h4 className="text-lg font-bold mb-4 uppercase">{step.title}</h4>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-32 px-10 max-w-5xl mx-auto text-center">
         <h3 className="text-sm font-black uppercase tracking-[6px] mb-12 opacity-30">Expertise em Milhares de Pregões</h3>
         <div className="flex flex-wrap justify-center gap-12 text-2xl font-bold opacity-10 uppercase italic">
            <span>Comprasnet</span>
            <span>Licitações-e</span>
            <span>Portal de Compras</span>
            <span>BLL</span>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-black/5 text-center">
         <div className="text-[10px] font-bold uppercase tracking-[8px] opacity-20">
            DCA LICITAÇÕES // ESTRATÉGIA GOVERNAMENTAL // &copy; {new Date().getFullYear()}
         </div>
      </footer>
    </div>
  );
}
