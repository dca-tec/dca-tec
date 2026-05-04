import React from "react";
import { motion } from "motion/react";
import { 
  Cpu, 
  Zap, 
  Settings, 
  Activity, 
  ArrowLeft, 
  ChevronRight,
  Factory,
  Radio,
  Server,
  Gauge
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Industria() {
  const systems = [
    { name: "Linhas de Produção Autônomas", status: "Active", efficiency: "99.2%" },
    { name: "Manutenção Preditiva AI", status: "Active", efficiency: "98.7%" },
    { name: "Integração IOT Industrial", status: "Monitoring", efficiency: "100%" },
    { name: "Otimização Energética", status: "Active", efficiency: "94.5%" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e1e6] font-mono selection:bg-[#00ffe0] selection:text-black">
      {/* Top Hardware Rail */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400" />
      
      {/* Navigation */}
      <nav className="py-6 px-10 flex justify-between items-center border-b border-white/5 bg-[#0d0d11]">
        <Link to="/" className="flex items-center gap-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase font-bold tracking-[4px] text-white/40 group-hover:text-white transition-colors">Core Interface</span>
        </Link>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-[#00ffe0]">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Signal: Stable</span>
           </div>
           <Link to="/contact" className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 hover:bg-white hover:text-black transition-all">Support</Link>
        </div>
      </nav>

      {/* Hero Section - Dashboard Style */}
      <section className="pt-24 pb-12 px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 bg-[#121218] border border-white/10 rounded-xl relative overflow-hidden"
            >
              {/* Decorative Scan Line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00ffe0]/20 animate-[scan_4s_linear_infinite]" />
              
              <div className="flex items-center gap-3 mb-8 text-sky-400">
                <Factory className="w-8 h-8" />
                <span className="text-xs font-bold uppercase tracking-[6px]">DCA // AUTOMAÇÕES</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">
                INDÚSTRIA 6.0: <br />
                <span className="text-sky-400">COGNITIVE FACTORY.</span>
              </h1>
              
              <p className="max-w-xl text-white/50 text-sm leading-relaxed mb-10">
                Engenharia de automação avançada para indústrias que buscam o próximo nível de eficiência. 
                Sistemas autônomos, visão computacional e integração total entre o físico e o digital.
              </p>
              
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-sky-500 text-black font-bold uppercase text-[10px] tracking-widest hover:bg-[#00ffe0] transition-colors">
                  Config System
                </button>
                <div className="px-6 py-3 border border-white/10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                   <Gauge className="w-4 h-4" /> Load: 12%
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
             <div className="p-8 bg-[#121218] border border-white/10 rounded-xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-6">Real-time Metrics</h4>
                <div className="space-y-6">
                   {systems.map((s, i) => (
                     <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                        <div>
                           <p className="text-[10px] opacity-40 mb-1">{s.name}</p>
                           <p className="text-xs font-bold uppercase">{s.status}</p>
                        </div>
                        <div className="text-sky-400 font-bold text-sm">{s.efficiency}</div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="p-8 bg-sky-500 text-black rounded-xl group hover:scale-[1.02] transition-transform cursor-pointer">
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4">Request Diagnosis</h4>
                <p className="text-xs font-medium leading-relaxed opacity-80 mb-6">Inicie uma auditoria de automação na sua planta industrial.</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                   Contact Specialist <ChevronRight className="w-4 h-4" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Grid of Components */}
      <section className="py-20 px-10 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Cpu />, label: "Processors", val: "A1-DCA" },
              { icon: <Zap />, label: "Power", val: "Full" },
              { icon: <Server />, label: "Data-link", val: "Secure" },
              { icon: <Activity />, label: "Health", val: "Optimal" }
            ].map((node, i) => (
              <div key={i} className="p-6 border border-white/5 bg-[#0d0d12] flex flex-col items-center text-center">
                 <div className="text-sky-400 mb-4">{node.icon}</div>
                 <div className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-1">{node.label}</div>
                 <div className="text-xs font-black uppercase tracking-[2px]">{node.val}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Footer Info */}
      <footer className="py-20 text-center border-t border-white/5">
         <div className="text-[10px] font-bold uppercase tracking-[10px] opacity-20">
            DCA INDUSTRIALS // SYSTEM v6.04 // &copy; {new Date().getFullYear()}
         </div>
      </footer>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
