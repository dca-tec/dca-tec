import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Image as ImageIcon, 
  Video, 
  Sliders, 
  Layers, 
  ArrowUpRight, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useHeroBanners, HeroBannerItem, HeroBannerCta } from "../lib/bannerConfig";
import { useSiteVisibility } from "../lib/siteConfig";

export default function BannerManager() {
  const {
    banners,
    activeBanners,
    isSaving,
    syncStatus,
    toggleBannerActive,
    updateBanner,
    createBanner,
    deleteBanner,
    moveBanner,
    resetToDefaultBanners,
    bulkSetBannersActive,
  } = useHeroBanners();

  const { isBlockActive, toggleBlock } = useSiteVisibility();
  const heroBlockIsActive = isBlockActive("hero_carousel");

  const [editingBanner, setEditingBanner] = useState<HeroBannerItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form states for creating/editing
  const [formData, setFormData] = useState<{
    badge: string;
    title: string;
    subtitle: string;
    mediaType: "image" | "video";
    mediaUrl: string;
    navLabel: string;
    tagsInput: string;
    primaryLabel: string;
    primaryHref: string;
    primaryType: "anchor" | "internal" | "external" | "schedule";
    hasSecondary: boolean;
    secondaryLabel: string;
    secondaryHref: string;
    secondaryType: "anchor" | "internal" | "external" | "schedule";
    active: boolean;
  }>({
    badge: "",
    title: "",
    subtitle: "",
    mediaType: "image",
    mediaUrl: "",
    navLabel: "",
    tagsInput: "",
    primaryLabel: "",
    primaryHref: "",
    primaryType: "anchor",
    hasSecondary: false,
    secondaryLabel: "",
    secondaryHref: "",
    secondaryType: "anchor",
    active: true,
  });

  const showFeedback = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const openEditModal = (banner: HeroBannerItem) => {
    setEditingBanner(banner);
    setIsCreating(false);
    setFormData({
      badge: banner.badge || "",
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      mediaType: banner.video ? "video" : "image",
      mediaUrl: banner.video || banner.image || "",
      navLabel: banner.navLabel || "",
      tagsInput: (banner.tags || []).join(", "),
      primaryLabel: banner.primaryCta?.label || "",
      primaryHref: banner.primaryCta?.href || "",
      primaryType: banner.primaryCta?.onClickSchedule 
        ? "schedule" 
        : banner.primaryCta?.isInternalRoute 
        ? "internal" 
        : banner.primaryCta?.isExternal 
        ? "external" 
        : "anchor",
      hasSecondary: !!banner.secondaryCta?.label,
      secondaryLabel: banner.secondaryCta?.label || "",
      secondaryHref: banner.secondaryCta?.href || "",
      secondaryType: banner.secondaryCta?.onClickSchedule 
        ? "schedule" 
        : banner.secondaryCta?.isInternalRoute 
        ? "internal" 
        : banner.secondaryCta?.isExternal 
        ? "external" 
        : "anchor",
      active: banner.active ?? true,
    });
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setIsCreating(true);
    setFormData({
      badge: "DCA TEC // NOVO DESTAQUE",
      title: "NOVO BANNER PRINCIPAL",
      subtitle: "Insira aqui uma descrição atraente sobre este projeto ou tecnologia de vanguarda.",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80",
      navLabel: "Novo Banner",
      tagsInput: "Inovação, Inteligência Artificial, Alta Performance",
      primaryLabel: "Explorar Mais",
      primaryHref: "#consultoria-integrada",
      primaryType: "anchor",
      hasSecondary: false,
      secondaryLabel: "Fale Conosco",
      secondaryHref: "#contato",
      secondaryType: "anchor",
      active: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Por favor, preencha o título do banner.");
      return;
    }

    const tags = formData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const primaryCta: HeroBannerCta = {
      label: formData.primaryLabel || "Saiba Mais",
      href: formData.primaryHref || "#",
      isInternalRoute: formData.primaryType === "internal",
      isExternal: formData.primaryType === "external",
      onClickSchedule: formData.primaryType === "schedule",
    };

    let secondaryCta: HeroBannerCta | undefined = undefined;
    if (formData.hasSecondary && formData.secondaryLabel.trim()) {
      secondaryCta = {
        label: formData.secondaryLabel,
        href: formData.secondaryHref || "#",
        isInternalRoute: formData.secondaryType === "internal",
        isExternal: formData.secondaryType === "external",
        onClickSchedule: formData.secondaryType === "schedule",
      };
    }

    const bannerPayload = {
      badge: formData.badge,
      title: formData.title,
      subtitle: formData.subtitle,
      image: formData.mediaType === "image" ? formData.mediaUrl : undefined,
      video: formData.mediaType === "video" ? formData.mediaUrl : undefined,
      navLabel: formData.navLabel || formData.title.slice(0, 16),
      tags,
      primaryCta,
      secondaryCta,
      active: formData.active,
    };

    if (isCreating) {
      await createBanner({
        ...bannerPayload,
        order: banners.length + 1,
      });
      showFeedback("Novo banner adicionado ao carrossel com sucesso!");
    } else if (editingBanner) {
      await updateBanner(editingBanner.id, bannerPayload);
      showFeedback(`Banner "${formData.title}" atualizado com sucesso!`);
    }

    setEditingBanner(null);
    setIsCreating(false);
  };

  const handleDuplicate = async (banner: HeroBannerItem) => {
    await createBanner({
      badge: banner.badge,
      title: `${banner.title} (Cópia)`,
      subtitle: banner.subtitle,
      image: banner.image,
      video: banner.video,
      navLabel: `${banner.navLabel || "Banner"} (Cópia)`,
      tags: [...banner.tags],
      primaryCta: { ...banner.primaryCta },
      secondaryCta: banner.secondaryCta ? { ...banner.secondaryCta } : undefined,
      active: false, // Start duplicate as inactive
      order: banners.length + 1,
    });
    showFeedback("Banner duplicado como inativo. Você pode editá-lo e ativá-lo!");
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o banner "${title}"?`)) {
      await deleteBanner(id);
      showFeedback("Banner excluído com sucesso.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Management Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-6 md:p-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00ffe0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/30 text-[#00ffe0] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Carrossel Fullbanner do Topo
              </span>
              <span className="text-white/40 text-xs font-mono">
                {syncStatus === "synced" ? "Sincronizado na Nuvem" : "Persistência Ativa"}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Gestão Individual de Banners do Topo
            </h2>
            <p className="text-white/60 text-sm max-w-2xl mt-1">
              Ative ou inative individualmente cada banner, altere textos, imagens, vídeos e links de ação dos slides da página inicial.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => bulkSetBannersActive(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:border-[#00ffe0]/30"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Ativar Todos
            </button>
            <button
              onClick={() => bulkSetBannersActive(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:border-red-500/30"
            >
              <EyeOff className="w-3.5 h-3.5 text-red-400" />
              Inativar Todos
            </button>
            <button
              onClick={resetToDefaultBanners}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
              title="Restaurar os 4 banners originais de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Padrões
            </button>
            <button
              onClick={openCreateModal}
              className="btn-gradient px-5 py-2.5 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,224,0.3)] hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Novo Banner
            </button>
          </div>
        </div>

        {/* Global Block Notice if whole hero block is disabled */}
        {!heroBlockIsActive && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                <strong>Atenção:</strong> O bloco inteiro do Carrossel Fullbanner está atualmente <strong>desativado</strong> na aba de Blocos. Nenhum banner aparecerá na home até que o bloco seja reativado.
              </span>
            </div>
            <button
              onClick={() => toggleBlock("hero_carousel", true)}
              className="px-4 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shrink-0 hover:bg-amber-300 transition-all"
            >
              Reativar Bloco Agora
            </button>
          </div>
        )}

        {/* Action notification toast */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {actionNotice}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Total de Banners</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{banners.length}</span>
            <span className="text-xs text-white/40 font-mono">cadastrados</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Banners Ativos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#00ffe0]">{activeBanners.length}</span>
            <span className="text-xs text-[#00ffe0]/70 font-mono">no ar</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Banners Inativos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white/40">{banners.length - activeBanners.length}</span>
            <span className="text-xs text-white/40 font-mono">pausados</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Bloco Hero</span>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              heroBlockIsActive 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              {heroBlockIsActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {heroBlockIsActive ? "Bloco Habilitado" : "Bloco Desabilitado"}
            </span>
          </div>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00ffe0]" />
            Sequência dos Banners no Carrossel
          </h3>
          <span className="text-xs text-white/40 font-mono">
            {activeBanners.length} de {banners.length} exibidos na Home
          </span>
        </div>

        {banners.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl p-8">
            <Sliders className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Nenhum banner encontrado</h4>
            <p className="text-xs text-white/40 mb-4 max-w-sm mx-auto">
              Crie um novo banner ou restaure os banners originais da DCA TEC.
            </p>
            <button
              onClick={resetToDefaultBanners}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
            >
              Restaurar Padrões
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => {
              const isActive = banner.active;
              return (
                <div
                  key={banner.id}
                  className={`group relative overflow-hidden rounded-3xl border transition-all ${
                    isActive
                      ? "bg-white/[0.03] border-white/10 hover:border-[#00ffe0]/40 shadow-lg"
                      : "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Reorder controls & Thumbnail Preview */}
                    <div className="flex items-start md:items-center gap-4">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveBanner(banner.id, "up")}
                          aria-label="Mover para cima"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 text-white/50 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white/40">
                          0{index + 1}
                        </span>
                        <button
                          disabled={index === banners.length - 1}
                          onClick={() => moveBanner(banner.id, "down")}
                          aria-label="Mover para baixo"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 text-white/50 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Thumbnail Media Box */}
                      <div className="relative w-24 h-20 md:w-32 md:h-24 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                        {banner.video ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white/50">
                            <Video className="w-6 h-6 text-[#00ffe0] mb-1" />
                            <span className="text-[9px] font-mono uppercase tracking-wider">Vídeo MP4</span>
                          </div>
                        ) : banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover brightness-90"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[8px] font-mono text-white/70">
                          Slide #{index + 1}
                        </span>
                      </div>

                      {/* Info & Copy */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#00ffe0] font-bold">
                            {banner.badge || "SEM BADGE"}
                          </span>
                          {banner.navLabel && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                              Aba: {banner.navLabel}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base md:text-lg font-bold text-white tracking-tight leading-snug truncate">
                          {banner.title}
                        </h4>

                        <p className="text-xs text-white/50 line-clamp-2 mt-1 max-w-2xl leading-relaxed">
                          {banner.subtitle}
                        </p>

                        {/* Tags */}
                        {banner.tags && banner.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {banner.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[10px] text-white/70 font-mono"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Toggle Switch & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                      {/* Active/Inactive Switch */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Ativo na Home
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Inativo
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleBannerActive(banner.id)}
                          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isActive ? "bg-[#00ffe0]" : "bg-white/10"
                          }`}
                          role="switch"
                          aria-checked={isActive}
                          title={isActive ? "Clique para inativar este banner" : "Clique para ativar este banner"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                              isActive ? "translate-x-7 bg-black" : "translate-x-0 bg-white/40"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Edit / Duplicate / Delete Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:border-[#00ffe0]/40"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#00ffe0]" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDuplicate(banner)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all"
                          title="Duplicar Banner"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id, banner.title)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white/40 hover:text-red-400 transition-all"
                          title="Excluir Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Banner Modal */}
      <AnimatePresence>
        {(editingBanner || isCreating) && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingBanner(null);
                setIsCreating(false);
              }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00ffe0]/10 border border-[#00ffe0]/30 flex items-center justify-center text-[#00ffe0]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isCreating ? "Criar Novo Banner do Topo" : "Editar Banner do Topo"}
                    </h3>
                    <p className="text-xs text-white/50 font-mono">
                      Personalize títulos, mídia, textos e botões de chamada para ação
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingBanner(null);
                    setIsCreating(false);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Status Toggle & Nav label */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-white block">
                        Status do Banner
                      </label>
                      <span className="text-[11px] text-white/40">
                        {formData.active ? "Visível no carrossel da Home" : "Inativo / Oculto na Home"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        formData.active ? "bg-[#00ffe0]" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formData.active ? "translate-x-7 bg-black" : "translate-x-0 bg-white/40"
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white block mb-1">
                      Rótulo da Aba Inferior
                    </label>
                    <input
                      type="text"
                      value={formData.navLabel}
                      onChange={(e) => setFormData({ ...formData, navLabel: e.target.value })}
                      placeholder="Ex: Expo & Presença"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                    />
                  </div>
                </div>

                {/* Badge & Title */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1">
                      Kicker / Badge Superior
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Ex: DCA TEC // PRESENÇA GLOBAL & EXPO"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00ffe0]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1">
                      Título Principal do Banner
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: TECNOLOGIA QUE CONECTA PESSOAS E POSSIBILIDADES"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-[#00ffe0]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1">
                      Subtítulo / Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Descrição resumida com as capacidades e proposta de valor deste slide..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#00ffe0]"
                      required
                    />
                  </div>
                </div>

                {/* Media Section: Image or Video */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00ffe0]" />
                      Plano de Fundo (Mídia)
                    </label>

                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mediaType: "image" })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          formData.mediaType === "image"
                            ? "bg-[#00ffe0] text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Imagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mediaType: "video" })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          formData.mediaType === "video"
                            ? "bg-[#00ffe0] text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Vídeo MP4
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-white/50 block mb-1">
                      URL da {formData.mediaType === "image" ? "Imagem" : "Vídeo (MP4)"}
                    </label>
                    <input
                      type="text"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder={
                        formData.mediaType === "image"
                          ? "https://... ou /src/assets/images/..."
                          : "https://...video.mp4"
                      }
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#00ffe0]"
                    />
                  </div>

                  {/* Thumbnail Live Preview */}
                  {formData.mediaUrl && (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-white/10 bg-black">
                      {formData.mediaType === "image" ? (
                        <img
                          src={formData.mediaUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-mono">
                          <Video className="w-5 h-5 text-[#00ffe0] mr-2" />
                          Vídeo configurado: {formData.mediaUrl.slice(0, 45)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1">
                    Tags de Destaque (Pills)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                    placeholder="Separe por vírgulas. Ex: Biometria Avançada, IA, Cibersegurança"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00ffe0]"
                  />
                  <span className="text-[10px] text-white/40 block mt-1">
                    Cada item separado por vírgula se transforma em um badge tecnológico com ícone automático.
                  </span>
                </div>

                {/* Action Buttons (CTAs) */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-[#00ffe0]" />
                    Botões de Chamada para Ação (CTAs)
                  </h4>

                  {/* Primary CTA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                        Texto Botão 1 (Principal)
                      </label>
                      <input
                        type="text"
                        value={formData.primaryLabel}
                        onChange={(e) => setFormData({ ...formData, primaryLabel: e.target.value })}
                        placeholder="Ex: Explorar Ecossistema"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                        Link / Destino
                      </label>
                      <input
                        type="text"
                        value={formData.primaryHref}
                        onChange={(e) => setFormData({ ...formData, primaryHref: e.target.value })}
                        placeholder="Ex: #consultoria-integrada ou /automacao"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70 block mb-1">
                        Comportamento
                      </label>
                      <select
                        value={formData.primaryType}
                        onChange={(e: any) => setFormData({ ...formData, primaryType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                      >
                        <option value="anchor">Âncora na página (#secao)</option>
                        <option value="internal">Página interna (/rota)</option>
                        <option value="schedule">Abrir Agendamento VIP</option>
                        <option value="external">Link Externo (nova aba)</option>
                      </select>
                    </div>
                  </div>

                  {/* Secondary CTA Toggle & Fields */}
                  <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold text-white/70">
                        Habilitar Botão 2 (Secundário)
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.hasSecondary}
                        onChange={(e) => setFormData({ ...formData, hasSecondary: e.target.checked })}
                        className="rounded border-white/20 bg-white/5 text-[#00ffe0] focus:ring-0 w-4 h-4"
                      />
                    </div>

                    {formData.hasSecondary && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-white/70 block mb-1">
                            Texto Botão 2
                          </label>
                          <input
                            type="text"
                            value={formData.secondaryLabel}
                            onChange={(e) => setFormData({ ...formData, secondaryLabel: e.target.value })}
                            placeholder="Ex: Agendar Reunião VIP"
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-white/70 block mb-1">
                            Link / Destino
                          </label>
                          <input
                            type="text"
                            value={formData.secondaryHref}
                            onChange={(e) => setFormData({ ...formData, secondaryHref: e.target.value })}
                            placeholder="Ex: #contato"
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-white/70 block mb-1">
                            Comportamento
                          </label>
                          <select
                            value={formData.secondaryType}
                            onChange={(e: any) => setFormData({ ...formData, secondaryType: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                          >
                            <option value="anchor">Âncora na página (#secao)</option>
                            <option value="internal">Página interna (/rota)</option>
                            <option value="schedule">Abrir Agendamento VIP</option>
                            <option value="external">Link Externo (nova aba)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBanner(null);
                      setIsCreating(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-gradient px-7 py-2.5 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,224,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    {isSaving ? "Salvando..." : isCreating ? "Publicar Novo Banner" : "Salvar Alterações"}
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
