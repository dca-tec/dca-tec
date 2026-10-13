import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, 
  Package, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  Rocket, 
  Sliders, 
  Calendar,
  Compass,
  Zap,
  Globe2,
  Check,
  ShieldCheck,
  Tag
} from "lucide-react";
import { 
  useSiteVisibility, 
  DEFAULT_BLOCKS, 
  DEFAULT_PROJECTS, 
  SiteBlock, 
  SiteProjectItem 
} from "../lib/siteConfig";
import RegionManager from "./RegionManager";

export default function LaunchManager() {
  const {
    blocks,
    projects,
    projectPhases,
    isBlockActive,
    isProjectActive,
    toggleBlock,
    toggleProject,
    setProjectPhase,
    bulkSetBlocks,
    bulkSetProjects,
    resetToDefaults,
    isSaving,
    syncStatus,
    updatedAt,
  } = useSiteVisibility();

  const [activeSubTab, setActiveSubTab] = useState<"blocks" | "projects" | "regions">("blocks");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Block metrics
  const totalBlocks = DEFAULT_BLOCKS.length;
  const activeBlocksCount = DEFAULT_BLOCKS.filter(b => isBlockActive(b.id)).length;
  const blocksPercent = Math.round((activeBlocksCount / totalBlocks) * 100);

  // Project metrics
  const totalProjects = DEFAULT_PROJECTS.length;
  const activeProjectsCount = DEFAULT_PROJECTS.filter(p => isProjectActive(p.id)).length;
  const projectsPercent = Math.round((activeProjectsCount / totalProjects) * 100);

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_PROJECTS.forEach(p => set.add(p.category));
    return Array.from(set);
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return DEFAULT_PROJECTS.filter(p => {
      const active = isProjectActive(p.id);
      const phase = projectPhases[p.id] || p.launchPhase;

      if (selectedStatus === "active" && !active) return false;
      if (selectedStatus === "inactive" && active) return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedPhase !== "all" && phase !== selectedPhase) return false;

      if (projectSearch.trim()) {
        const query = projectSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchId = p.id.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCat && !matchId) return false;
      }

      return true;
    });
  }, [projectSearch, selectedCategory, selectedStatus, selectedPhase, isProjectActive, projectPhases]);

  // Handler for Phase 1 preset
  const applyPhase1Preset = async () => {
    // Phase 1: Activate all blocks + projects marked as "Fase 1 (Imediato)"
    await bulkSetBlocks(true);
    for (const p of DEFAULT_PROJECTS) {
      const phase = projectPhases[p.id] || p.launchPhase;
      await toggleProject(p.id, phase.includes("Fase 1"));
    }
    showFeedback("Estratégia de Marketing: Fase 1 (Imediato) aplicada com sucesso!");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00ffe0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                Lançamento Gradual DCA TEC
              </span>
              <span className="text-white/40 text-xs font-mono">
                {syncStatus === "synced" ? "Sincronizado na Nuvem" : "Persistência Local Ativa"}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Gestão de Blocos & Lançamento de Projetos
            </h2>
            <p className="text-white/60 text-sm max-w-2xl mt-1">
              Ative ou desative cada seção da página inicial e cada projeto do ecossistema para controlar 
              a sequência exata de lançamentos de acordo com a estratégia de marketing do Grupo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:border-[#00ffe0]/40 hover:text-[#00ffe0] transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Site Público
            </a>

            <button
              onClick={() => {
                resetToDefaults();
                showFeedback("Configurações restauradas para o padrão completo.");
              }}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
              title="Restaurar padrão com todos os blocos ativos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Blocos da Home</span>
              <span className="font-mono text-[#00ffe0]">{activeBlocksCount} / {totalBlocks}</span>
            </div>
            <div className="text-xl font-black text-white font-mono">{blocksPercent}% Ativos</div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00ffe0] to-[#0070f3] rounded-full transition-all duration-500"
                style={{ width: `${blocksPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Projetos Visíveis</span>
              <span className="font-mono text-[#00ffe0]">{activeProjectsCount} / {totalProjects}</span>
            </div>
            <div className="text-xl font-black text-white font-mono">{projectsPercent}% No Ar</div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00ffe0] to-[#0070f3] rounded-full transition-all duration-500"
                style={{ width: `${projectsPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-white/50 mb-1">Projetos em Espera</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {totalProjects - activeProjectsCount} Ocultos
            </div>
            <p className="text-[10px] text-white/40 mt-1">Prontos para lançamento programado</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-white/50 mb-1">Status do Servidor</div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#00ffe0] mt-1">
              <div className="w-2 h-2 rounded-full bg-[#00ffe0] animate-ping" />
              Tempo Real Ativo
            </div>
            <p className="text-[10px] text-white/40 mt-1 font-mono">
              Atualização instantânea no portal
            </p>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0] text-sm flex items-center justify-between shadow-[0_0_20px_rgba(0,255,224,0.1)]"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button 
              onClick={() => setActionNotice(null)}
              className="text-xs font-mono underline hover:opacity-80"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Sub-Tabs & Presets Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Sub-tabs buttons */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveSubTab("blocks")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeSubTab === "blocks"
                ? "bg-[#00ffe0] text-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Blocos da Home ({activeBlocksCount}/{totalBlocks})
          </button>

          <button
            onClick={() => setActiveSubTab("projects")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeSubTab === "projects"
                ? "bg-[#00ffe0] text-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            Projetos & Soluções ({activeProjectsCount}/{totalProjects})
          </button>

          <button
            onClick={() => setActiveSubTab("regions")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeSubTab === "regions"
                ? "bg-[#00ffe0] text-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Globe2 className="w-4 h-4" />
            Regiões Atendidas & Hubs
          </button>
        </div>

        {/* Quick Presets for Marketing Team */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={applyPhase1Preset}
            className="px-3.5 py-2 rounded-xl bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] hover:bg-[#00ffe0]/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Aplicar Preset: Fase 1 (Imediato)
          </button>

          {activeSubTab === "blocks" ? (
            <>
              <button
                onClick={() => {
                  bulkSetBlocks(true);
                  showFeedback("Todos os blocos foram ativados.");
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                Ativar Todos os Blocos
              </button>
              <button
                onClick={() => {
                  bulkSetBlocks(false);
                  showFeedback("Todos os blocos foram desativados.");
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                Desativar Todos
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  bulkSetProjects(true);
                  showFeedback("Todos os projetos foram ativados no site público.");
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                Ativar Todos os Projetos
              </button>
              <button
                onClick={() => {
                  bulkSetProjects(false);
                  showFeedback("Todos os projetos foram desativados.");
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                Desativar Todos
              </button>
            </>
          )}
        </div>
      </div>

      {/* CONTENT: TAB 1 - BLOCKS */}
      {activeSubTab === "blocks" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEFAULT_BLOCKS.map((block) => {
              const active = isBlockActive(block.id);
              // Calculate how many projects are inside this block if it's an ecosystem category
              const projectsInBlock = DEFAULT_PROJECTS.filter(p => p.categoryId === block.id);
              const activeProjectsInBlock = projectsInBlock.filter(p => isProjectActive(p.id));

              return (
                <div
                  key={block.id}
                  className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all ${
                    active
                      ? "bg-white/[0.03] border-white/10 hover:border-[#00ffe0]/40 shadow-lg"
                      : "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div>
                    {/* Header: Order & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                        Bloco #{block.order} • {block.category}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                          active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {active ? (
                          <>
                            <Eye className="w-3 h-3" /> No Ar
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Oculto
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                      {block.name}
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-4">
                      {block.description}
                    </p>

                    {/* Sub-info if block has projects */}
                    {projectsInBlock.length > 0 && (
                      <div className="mb-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] flex items-center justify-between">
                        <span className="text-white/50">Projetos neste bloco:</span>
                        <span className="font-mono font-bold text-[#00ffe0]">
                          {activeProjectsInBlock.length} / {projectsInBlock.length} ativos
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Toggle Switch & Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/60">
                      {active ? "Visível no site" : "Desativado"}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleBlock(block.id)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        active ? "bg-[#00ffe0]" : "bg-white/10"
                      }`}
                      role="switch"
                      aria-checked={active}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                          active ? "translate-x-7 bg-black" : "translate-x-0 bg-white/40"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT: TAB 2 - PROJECTS */}
      {activeSubTab === "projects" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/10">
            {/* Search Input */}
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar projeto..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#00ffe0] focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-[#00ffe0] focus:outline-none"
              >
                <option value="all">Todas as Categorias ({totalProjects})</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({DEFAULT_PROJECTS.filter(p => p.category === cat).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-[#00ffe0] focus:outline-none"
              >
                <option value="all">Status: Todos ({totalProjects})</option>
                <option value="active">Apenas No Ar ({activeProjectsCount})</option>
                <option value="inactive">Apenas Ocultos ({totalProjects - activeProjectsCount})</option>
              </select>
            </div>

            {/* Phase Filter */}
            <div>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:border-[#00ffe0] focus:outline-none"
              >
                <option value="all">Fase de Lançamento: Todas</option>
                <option value="Fase 1 (Imediato)">Fase 1 (Imediato)</option>
                <option value="Fase 2 (Q1)">Fase 2 (Q1)</option>
                <option value="Fase 3 (Q2)">Fase 3 (Q2)</option>
                <option value="Fase 4 (Q3)">Fase 4 (Q3)</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-white/50 px-2">
            <span>
              Exibindo <strong className="text-white">{filteredProjects.length}</strong> de {totalProjects} projetos
            </span>
            {filteredProjects.length === 0 && (
              <span className="text-amber-400">Nenhum projeto encontrado para os filtros selecionados.</span>
            )}
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const active = isProjectActive(project.id);
              const phase = projectPhases[project.id] || project.launchPhase;

              return (
                <div
                  key={project.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    active
                      ? "bg-white/[0.03] border-white/10 hover:border-[#00ffe0]/40"
                      : "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div>
                    {/* Header: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 truncate">
                        {project.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                          active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {active ? "No Ar" : "Oculto"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {project.name}
                      </h4>
                      <a
                        href={project.url}
                        target={project.isInternal ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-[#00ffe0] transition-colors p-1"
                        title="Abrir destino do projeto"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Phase Selector & Toggle Switch */}
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    {/* Phase Selector */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Estratégia:</span>
                      <select
                        value={phase}
                        onChange={(e) => {
                          setProjectPhase(project.id, e.target.value);
                          showFeedback(`${project.name} atribuído à ${e.target.value}`);
                        }}
                        className="bg-black/60 border border-white/10 text-[#00ffe0] text-[10px] font-mono rounded-lg px-2 py-1 focus:outline-none focus:border-[#00ffe0]"
                      >
                        <option value="Fase 1 (Imediato)">Fase 1 (Imediato)</option>
                        <option value="Fase 2 (Q1)">Fase 2 (Q1)</option>
                        <option value="Fase 3 (Q2)">Fase 3 (Q2)</option>
                        <option value="Fase 4 (Q3)">Fase 4 (Q3)</option>
                        <option value="Especial">Especial</option>
                      </select>
                    </div>

                    {/* Toggle Row */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">
                        {active ? "Exibir no portal" : "Ocultar do portal"}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleProject(project.id)}
                        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          active ? "bg-[#00ffe0]" : "bg-white/10"
                        }`}
                        role="switch"
                        aria-checked={active}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                            active ? "translate-x-6 bg-black" : "translate-x-0 bg-white/40"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regiões Atendidas & Hubs Sub-tab */}
      {activeSubTab === "regions" && (
        <RegionManager />
      )}
    </div>
  );
}
