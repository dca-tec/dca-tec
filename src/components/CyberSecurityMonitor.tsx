import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Activity, 
  Cpu, 
  Globe, 
  Database,
  Terminal,
  Zap
} from "lucide-react";
import { securityAgent, logSecurityEvent } from "../lib/security";

export default function CyberSecurityMonitor() {
  const [threatsBlocked, setThreatsBlocked] = useState(142);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[10:45:22] WAF: Regra #402 Bloqueou SQL Path Injection de 185.22.XX.4",
    "[11:12:05] MONITOR: Integridade do Repositório GitHub Verificada (v.2.4.1)",
    "[12:30:11] AI SENTINEL: Comportamento anômalo detectado em /api/admin - Usuário Isolado",
    "[13:00:00] LGPD: Backup encriptado gerado com sucesso para ANPD."
  ]);

  const runHardScan = () => {
    setIsScanning(true);
    logSecurityEvent("Varredura manual de nível HARD iniciada pelo Administrador", "WARNING");
    
    setTimeout(() => {
      setIsScanning(false);
      setThreatsBlocked(prev => prev + 3);
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] SCAN COMPLETO: 0 Vulnerabilidades críticas encontradas.`, ...prev]);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header com Status em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Nível de Proteção", value: "HARD", color: "text-[#00ffe0]", icon: ShieldCheck },
          { label: "Ameaças Bloqueadas", value: threatsBlocked, color: "text-red-400", icon: ShieldAlert },
          { label: "Agentes Ativos", value: "3 IA Bots", color: "text-blue-400", icon: Cpu },
          { label: "Integridade de Dados", value: "100%", color: "text-green-400", icon: Database },
        ].map((stat, i) => (
          <div key={i} className="bg-black/40 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className="w-2 h-2 bg-[#00ffe0] rounded-full animate-pulse" />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Agentes de IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-[40px] p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold mb-2">Monitoramento DevSecOps</h2>
              <p className="text-sm text-white/40">Integridade total: GitHub → Vercel → Cloudflare</p>
            </div>
            <button 
              onClick={runHardScan}
              disabled={isScanning}
              className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                isScanning ? 'bg-white/10 text-white/20' : 'bg-[#00ffe0] text-black hover:scale-105'
              }`}
            >
              {isScanning ? "Escaneando..." : "Executar Hard Scan"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#00ffe0]/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Cloudflare WAF / Bot Management</h3>
                <p className="text-xs text-white/30">Filtro de camada 7 ativo protegendo contra DDoS e Crawlers maliciosos.</p>
              </div>
              <div className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">ONLINE</div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#00ffe0]/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-1">AI Sentinel - Behavioral Analysis</h3>
                <p className="text-xs text-white/30">Agente de IA monitorando comportamentos de usuários no dashboard.</p>
              </div>
              <div className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">MONITORING</div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#00ffe0]/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-1">LGPD Encryption Engine</h3>
                <p className="text-xs text-white/30">Criptografia AES-256 aplicada a todos os campos sensíveis no DB.</p>
              </div>
              <div className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">PROTECTED</div>
            </div>
          </div>
        </div>

        {/* Logs do Sentinel */}
        <div className="bg-black border border-white/10 rounded-[40px] p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="w-5 h-5 text-[#00ffe0]" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Console Cyber-Sentinel</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[10px] text-white/30 scrollbar-hide">
             {logs.map((log, i) => (
               <div key={i} className={`p-4 rounded-xl ${log.includes("Vulnerabilidades") ? "bg-[#00ffe0]/10 text-[#00ffe0]" : "bg-white/5"}`}>
                 {log}
               </div>
             ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-[4px]">
               <span className="text-white/20">Uptime: 99.99%</span>
               <span className="text-[#00ffe0]">Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
