import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe2, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Power, 
  Building2, 
  Phone, 
  Mail, 
  RotateCcw, 
  Check, 
  X, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Flag
} from "lucide-react";
import { 
  usePresenceRegions, 
  PresenceRegion, 
  PresenceLocation,
  DEFAULT_REGIONS 
} from "../lib/presenceConfig";

export default function RegionManager() {
  const {
    regions,
    isSaving,
    syncStatus,
    toggleRegion,
    toggleLocation,
    updateRegion,
    addRegion,
    deleteRegion,
    resetRegionsToDefault,
  } = usePresenceRegions();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<PresenceRegion | null>(null);

  // Form State
  const [formRegionName, setFormRegionName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsCentral, setFormIsCentral] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formType, setFormType] = useState<"locations" | "countries">("locations");
  const [formLocations, setFormLocations] = useState<PresenceLocation[]>([]);
  const [formCountriesText, setFormCountriesText] = useState("");

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Open modal for editing
  const handleEdit = (region: PresenceRegion) => {
    setEditingRegion(region);
    setFormRegionName(region.region);
    setFormDescription(region.description || "");
    setFormIsCentral(!!region.isCentral);
    setFormActive(region.active);
    
    if (region.locations && region.locations.length > 0) {
      setFormType("locations");
      setFormLocations(JSON.parse(JSON.stringify(region.locations)));
      setFormCountriesText("");
    } else {
      setFormType("countries");
      setFormCountriesText((region.countries || []).join(", "));
      setFormLocations([]);
    }
    setIsModalOpen(true);
  };

  // Open modal for creating new
  const handleNew = () => {
    setEditingRegion(null);
    setFormRegionName("");
    setFormDescription("");
    setFormIsCentral(false);
    setFormActive(true);
    setFormType("locations");
    setFormLocations([
      {
        id: `loc-${Date.now()}`,
        city: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        active: true,
      }
    ]);
    setFormCountriesText("");
    setIsModalOpen(true);
  };

  // Add empty location row in form
  const handleAddLocationRow = () => {
    setFormLocations([
      ...formLocations,
      {
        id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        city: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        active: true,
      }
    ]);
  };

  // Remove location row
  const handleRemoveLocationRow = (index: number) => {
    setFormLocations(formLocations.filter((_, i) => i !== index));
  };

  // Save modal form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRegionName.trim()) {
      showNotice("Por favor, informe o nome da região.");
      return;
    }

    let parsedLocations: PresenceLocation[] | undefined = undefined;
    let parsedCountries: string[] | undefined = undefined;

    if (formType === "locations") {
      const validLocs = formLocations.filter(loc => loc.city.trim() || loc.address.trim() || loc.name.trim());
      if (validLocs.length === 0) {
        showNotice("Insira pelo menos um endereço ou unidade com cidade.");
        return;
      }
      parsedLocations = validLocs;
    } else {
      parsedCountries = formCountriesText
        .split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0);
      if (parsedCountries.length === 0) {
        showNotice("Insira pelo menos um país atendido.");
        return;
      }
    }

    if (editingRegion) {
      const updated: PresenceRegion = {
        ...editingRegion,
        region: formRegionName.trim(),
        description: formDescription.trim(),
        isCentral: formIsCentral,
        active: formActive,
        locations: parsedLocations,
        countries: parsedCountries,
        updatedAt: new Date().toISOString(),
      };
      await updateRegion(updated);
      showNotice(`Região "${formRegionName}" atualizada com sucesso!`);
    } else {
      await addRegion({
        region: formRegionName.trim(),
        description: formDescription.trim(),
        isCentral: formIsCentral,
        active: formActive,
        locations: parsedLocations,
        countries: parsedCountries,
      });
      showNotice(`Nova região "${formRegionName}" criada e ativada com sucesso!`);
    }

    setIsModalOpen(false);
  };

  // Filtered regions
  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      // Status filter
      if (statusFilter === "active" && !r.active) return false;
      if (statusFilter === "inactive" && r.active) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const inName = r.region.toLowerCase().includes(query);
        const inDesc = r.description?.toLowerCase().includes(query) || false;
        const inCountries = r.countries?.some(c => c.toLowerCase().includes(query)) || false;
        const inLocs = r.locations?.some(loc => 
          loc.city.toLowerCase().includes(query) || 
          loc.address.toLowerCase().includes(query) || 
          loc.name.toLowerCase().includes(query)
        ) || false;
        return inName || inDesc || inCountries || inLocs;
      }

      return true;
    });
  }, [regions, statusFilter, search]);

  const totalCount = regions.length;
  const activeCount = regions.filter(r => r.active).length;
  const inactiveCount = totalCount - activeCount;
  const totalOffices = regions.reduce((acc, r) => acc + (r.locations?.length || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-black to-[#00ffe0]/10 border border-[#00ffe0]/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ffe0]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0]">
                <Globe2 className="w-6 h-6" />
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Gestão de Regiões Atendidas & Hubs
              </h2>
            </div>
            <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
              Ative, desative, abra novas unidades ou modifique endereços de atendimento. As alterações refletem imediatamente na seção <strong className="text-[#00ffe0]">Presença Global</strong> da página inicial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleNew}
              className="px-5 py-3 rounded-2xl bg-[#00ffe0] text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,224,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Nova Região / Hub
            </button>
            <button
              onClick={() => {
                if (window.confirm("Deseja restaurar a lista padrão de regiões e sedes?")) {
                  resetRegionsToDefault();
                  showNotice("Regiões restauradas para o padrão oficial.");
                }
              }}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              title="Restaurar predefinição oficial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrão
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-white/50 mb-1">Total de Regiões</div>
            <div className="text-2xl font-black text-white font-mono">{totalCount}</div>
            <p className="text-[10px] text-white/40 mt-1">Configuradas no sistema</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-white/50 mb-1">Regiões Atendendo (No Ar)</div>
            <div className="text-2xl font-black text-[#00ffe0] font-mono">{activeCount}</div>
            <p className="text-[10px] text-white/40 mt-1">Visíveis no portal público</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-white/50 mb-1">Regiões Desativadas</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{inactiveCount}</div>
            <p className="text-[10px] text-white/40 mt-1">Temporariamente suspensas/fechadas</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <div className="text-xs text-white/50 mb-1">Sedes & Endereços Físicos</div>
            <div className="text-2xl font-black text-purple-400 font-mono">{totalOffices}</div>
            <p className="text-[10px] text-white/40 mt-1">
              {syncStatus === "synced" ? "Sincronizado via Nuvem" : "Armazenamento Local"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0] text-sm flex items-center justify-between shadow-[0_0_20px_rgba(0,255,224,0.15)]"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-medium">{feedback}</span>
            </div>
            <button 
              onClick={() => setFeedback(null)}
              className="text-xs font-mono underline hover:opacity-80"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por região, país, cidade ou endereço..."
            className="w-full bg-black/40 border border-white/10 pl-11 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00ffe0]"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === "all"
                ? "bg-[#00ffe0] text-black"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === "active"
                ? "bg-[#00ffe0] text-black"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Ativas ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === "inactive"
                ? "bg-[#00ffe0] text-black"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Desativadas ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Regions List Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRegions.map((region) => {
          const isActive = region.active;
          const hasLocations = region.locations && region.locations.length > 0;
          const hasCountries = region.countries && region.countries.length > 0;

          return (
            <motion.div
              key={region.id}
              layout
              className={`p-6 md:p-8 rounded-3xl border transition-all ${
                isActive
                  ? region.isCentral
                    ? "bg-gradient-to-br from-[#00ffe0]/10 via-black to-black border-[#00ffe0]/40 shadow-[0_0_30px_rgba(0,255,224,0.05)]"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  : "bg-black/60 border-white/5 opacity-60 hover:opacity-90"
              }`}
            >
              {/* Region Top Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-start md:items-center gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    isActive 
                      ? "bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/30" 
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}>
                    <Globe2 className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {region.region}
                      </h3>
                      {region.isCentral && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00ffe0]/20 text-[#00ffe0] border border-[#00ffe0]/40 text-[10px] font-bold uppercase tracking-wider">
                          Central Global
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {isActive ? "Região Ativa (No Ar)" : "Região Fechada / Oculta"}
                      </span>
                    </div>

                    {region.description && (
                      <p className="text-xs text-white/60 max-w-3xl leading-relaxed mt-1">
                        {region.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Control Actions & Toggle */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => {
                      toggleRegion(region.id);
                      showNotice(
                        !region.active 
                          ? `Região "${region.region}" ativada e visível na Presença Global!` 
                          : `Região "${region.region}" desativada e ocultada da Presença Global.`
                      );
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                      isActive
                        ? "bg-[#00ffe0] text-black border-[#00ffe0] hover:bg-[#00ffe0]/90 shadow-[0_0_15px_rgba(0,255,224,0.3)]"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {isActive ? "Desativar / Fechar" : "Ativar / Abrir"}
                  </button>

                  <button
                    onClick={() => handleEdit(region)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-wider"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#00ffe0]" />
                    Editar / Mudar Endereço
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir permanentemente a região "${region.region}"?`)) {
                        deleteRegion(region.id);
                        showNotice(`Região "${region.region}" removida.`);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Excluir região"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Region Content: Locations or Countries */}
              <div className="mt-6">
                {hasLocations && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#00ffe0]" />
                        Endereços Físicos & Sedes Operacionais ({region.locations?.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {region.locations?.map((loc) => (
                        <div 
                          key={loc.id} 
                          className={`p-5 rounded-2xl border transition-all ${
                            loc.active !== false
                              ? "bg-black/50 border-white/10 hover:border-[#00ffe0]/40"
                              : "bg-black/80 border-dashed border-red-500/30 opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-4 h-4 shrink-0 ${loc.active !== false ? "text-[#00ffe0]" : "text-white/40"}`} />
                              <span className="font-bold text-white text-sm">{loc.city}</span>
                            </div>

                            <button
                              onClick={() => {
                                toggleLocation(region.id, loc.id);
                                showNotice(`Status da unidade "${loc.city}" alterado.`);
                              }}
                              className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                                loc.active !== false
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                              }`}
                              title="Alternar se este endereço está atendendo ou suspenso"
                            >
                              {loc.active !== false ? "Sede Ativa" : "Sede Suspensa"}
                            </button>
                          </div>

                          <h4 className="text-xs font-semibold text-white/90 mb-2">{loc.name}</h4>
                          <p className="text-xs text-white/60 leading-relaxed font-mono bg-white/[0.02] p-2.5 rounded-xl border border-white/5 mb-3">
                            {loc.address}
                          </p>

                          {(loc.phone || loc.email) && (
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/50 pt-2 border-t border-white/5">
                              {loc.phone && (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-[#00ffe0]" />
                                  {loc.phone}
                                </span>
                              )}
                              {loc.email && (
                                <span className="flex items-center gap-1.5">
                                  <Mail className="w-3 h-3 text-[#00ffe0]" />
                                  {loc.email}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasCountries && (
                  <div>
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Flag className="w-4 h-4 text-[#00ffe0]" />
                      Países e Territórios Atendidos ({region.countries?.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {region.countries?.map((country, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white/80 font-medium flex items-center gap-1.5 hover:border-[#00ffe0]/40 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ffe0]" />
                          {country}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredRegions.length === 0 && (
          <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
            <Globe2 className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Nenhuma região encontrada</h4>
            <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
              Nenhuma região corresponde aos filtros selecionados.
            </p>
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-neutral-950 border border-[#00ffe0]/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0]">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">
                      {editingRegion ? "Editar Região & Endereços" : "Cadastrar Nova Região Atendida"}
                    </h3>
                    <p className="text-xs text-white/50">
                      Configure a região, endereços físicos, sedes operacionais ou lista de países.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Nome da Região / Polo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formRegionName}
                      onChange={(e) => setFormRegionName(e.target.value)}
                      placeholder="Ex: Centrais de Atendimento, América Latina, Hub Nordeste..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ffe0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Tipo de Região
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormType("locations")}
                        className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                          formType === "locations"
                            ? "bg-[#00ffe0] text-black border-[#00ffe0]"
                            : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Endereços Físicos
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormType("countries")}
                        className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                          formType === "countries"
                            ? "bg-[#00ffe0] text-black border-[#00ffe0]"
                            : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Lista de Países
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                    Descrição da Região (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Nossos escritórios centrais coordenam o atendimento com suporte multilíngue..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ffe0]"
                  />
                </div>

                {/* Flags */}
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 accent-[#00ffe0] rounded"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Região Ativa (Visível na Home)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsCentral}
                      onChange={(e) => setFormIsCentral(e.target.checked)}
                      className="w-4 h-4 accent-[#00ffe0] rounded"
                    />
                    <span className="text-xs font-bold text-[#00ffe0] uppercase tracking-wider">
                      Destaque como Central Global
                    </span>
                  </label>
                </div>

                {/* Physical Locations Section */}
                {formType === "locations" && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00ffe0]" />
                        Endereços e Sedes Físicas ({formLocations.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddLocationRow}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0] hover:bg-[#00ffe0]/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Mais um Endereço
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formLocations.map((loc, idx) => (
                        <div key={loc.id || idx} className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#00ffe0] uppercase tracking-wider">
                              Unidade #{idx + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={loc.active !== false}
                                  onChange={(e) => {
                                    const next = [...formLocations];
                                    next[idx].active = e.target.checked;
                                    setFormLocations(next);
                                  }}
                                  className="w-3.5 h-3.5 accent-[#00ffe0]"
                                />
                                <span>Ativa</span>
                              </label>

                              {formLocations.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLocationRow(idx)}
                                  className="text-red-400 hover:text-red-300 text-xs p-1"
                                  title="Remover este endereço"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-white/50 mb-1">
                                Cidade / País *
                              </label>
                              <input
                                type="text"
                                required
                                value={loc.city}
                                onChange={(e) => {
                                  const next = [...formLocations];
                                  next[idx].city = e.target.value;
                                  setFormLocations(next);
                                }}
                                placeholder="Ex: Brasil (Sede) ou Miami, FL"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-white/50 mb-1">
                                Nome da Unidade / Escritório
                              </label>
                              <input
                                type="text"
                                value={loc.name}
                                onChange={(e) => {
                                  const next = [...formLocations];
                                  next[idx].name = e.target.value;
                                  setFormLocations(next);
                                }}
                                placeholder="Ex: Escritório São Paulo ou Miami Office"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-white/50 mb-1">
                              Endereço Completo *
                            </label>
                            <input
                              type="text"
                              required
                              value={loc.address}
                              onChange={(e) => {
                                  const next = [...formLocations];
                                  next[idx].address = e.target.value;
                                  setFormLocations(next);
                              }}
                              placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP ou 2801 NW 74th Ave #211, Miami, FL"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-white/50 mb-1">
                                Telefone / WhatsApp (Opcional)
                              </label>
                              <input
                                type="text"
                                value={loc.phone || ""}
                                onChange={(e) => {
                                  const next = [...formLocations];
                                  next[idx].phone = e.target.value;
                                  setFormLocations(next);
                                }}
                                placeholder="+55 (11) 4003-0000"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-white/50 mb-1">
                                E-mail de Contato (Opcional)
                              </label>
                              <input
                                type="email"
                                value={loc.email || ""}
                                onChange={(e) => {
                                  const next = [...formLocations];
                                  next[idx].email = e.target.value;
                                  setFormLocations(next);
                                }}
                                placeholder="contato@dcatec.com.br"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Countries List Section */}
                {formType === "countries" && (
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Países e Territórios Atendidos (Separados por vírgula) *
                    </label>
                    <textarea
                      rows={4}
                      value={formCountriesText}
                      onChange={(e) => setFormCountriesText(e.target.value)}
                      placeholder="Ex: Inglaterra (Reino Unido), Alemanha, Espanha, França, Itália, Suíça..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ffe0]"
                    />
                    <p className="text-[11px] text-white/40 mt-1">
                      Separe cada país ou estado por vírgula. Eles serão transformados em etiquetas visuais na página de Presença Global.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 rounded-xl bg-[#00ffe0] text-black text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,224,0.3)]"
                  >
                    <Check className="w-4 h-4" />
                    {isSaving ? "Salvando..." : "Salvar Região & Endereços"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
