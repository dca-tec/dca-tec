import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Box, Sparkles, Shield, Cpu, ExternalLink } from "lucide-react";
import ThreeCanvasLogo from "./ThreeCanvasLogo";
import logo3dImg from "../assets/images/dca_tec_3d_logo_1791860209311.jpg";

interface Logo3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Logo3DModal({ isOpen, onClose }: Logo3DModalProps) {
  const [activeTab, setActiveTab] = useState<"render" | "webgl">("render");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[#090d16] border border-[#00ffe0]/30 rounded-[32px] shadow-[0_0_80px_rgba(0,255,224,0.25)] overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 flex items-center justify-center text-[#00ffe0]">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-[2px] hero-gradient-text uppercase">
                    DCA TEC // IDENTIDADE 3D
                  </h3>
                  <p className="text-xs text-white/50 tracking-wider">
                    Símbolo Tridimensional & Engenharia Visual de Marca
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tabs */}
                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setActiveTab("render")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
                      activeTab === "render"
                        ? "bg-[#00ffe0] text-black shadow-lg"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    RENDER 8K
                  </button>
                  <button
                    onClick={() => setActiveTab("webgl")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      activeTab === "webgl"
                        ? "bg-[#00ffe0] text-black shadow-lg"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    INTERATIVO 3D
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              {activeTab === "render" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Visual Preview */}
                  <div className="relative group rounded-2xl overflow-hidden border border-[#00ffe0]/40 shadow-[0_0_50px_rgba(0,255,224,0.3)] bg-black/90 aspect-square flex items-center justify-center">
                    <img
                      src={logo3dImg}
                      alt="DCA TEC 3D Logo Official Render"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="text-[10px] font-mono text-[#00ffe0] bg-black/80 px-2.5 py-1 rounded border border-[#00ffe0]/30">
                        OFFICIAL 3D EMBLEM
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">
                        TITANIUM & EMERALD NEON
                      </span>
                    </div>
                  </div>

                  {/* Brand Concept & Specs */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] text-xs font-mono mb-3">
                        <Sparkles className="w-3.5 h-3.5" /> NOVA MARCA TRIDIMENSIONAL
                      </div>
                      <h4 className="text-2xl font-bold tracking-wider text-white">
                        DCA TEC // Technology Corporation
                      </h4>
                      <p className="text-white/70 text-sm leading-relaxed mt-2">
                        O novo logo 3D materializa a fusão entre engenharia pesada, cibersegurança e inovação de ponta.
                        Projetado com acabamento de titânio chanfrado e iluminação periférica neon ciano, reflete a autoridade do ecossistema DCA TEC.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                        <div className="text-white/40 font-mono uppercase text-[10px]">Materialidade</div>
                        <div className="text-[#00ffe0] font-semibold mt-1">Chrome & Titânio Aeronáutico</div>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                        <div className="text-white/40 font-mono uppercase text-[10px]">Iluminação</div>
                        <div className="text-[#00ffe0] font-semibold mt-1">Neon Ciano #00FFE0 & Deep Blue</div>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                        <div className="text-white/40 font-mono uppercase text-[10px]">Geometria</div>
                        <div className="text-white font-semibold mt-1">Monograma Isométrico Chanfrado</div>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                        <div className="text-white/40 font-mono uppercase text-[10px]">Aplicações</div>
                        <div className="text-white font-semibold mt-1">Estande Expo, Web, Realidade Aumentada</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab("webgl")}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00ffe0] to-[#0070f3] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      >
                        <Cpu className="w-4 h-4" />
                        Experimentar Modo Interativo WebGL
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <ThreeCanvasLogo height={440} autoRotate={true} />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00ffe0]" />
                      <span>Use o botão esquerdo do mouse para girar o modelo em 360 graus.</span>
                    </div>
                    <button
                      onClick={() => setActiveTab("render")}
                      className="text-[#00ffe0] hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      Voltar ao Render Oficial &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
