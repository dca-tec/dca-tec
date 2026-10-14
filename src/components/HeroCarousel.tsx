import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  ArrowUpRight, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  Sparkles, 
  Factory, 
  Rocket, 
  Globe2 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useHeroBanners, HeroBannerItem, HeroBannerCta } from "../lib/bannerConfig";

export interface HeroCarouselProps {
  onOpenSchedule?: (officeName?: string) => void;
}

const SLIDE_DURATION = 7000; // 7 seconds per slide

const getTagIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("bio") || l.includes("olho") || l.includes("vis") || l.includes("biometria")) {
    return <Eye className="w-3.5 h-3.5 text-[#00ffe0]" />;
  }
  if (l.includes("ia") || l.includes("inteligência") || l.includes("auto") || l.includes("chip") || l.includes("cpu") || l.includes("robô")) {
    return <Cpu className="w-3.5 h-3.5 text-[#00ffe0]" />;
  }
  if (l.includes("seguran") || l.includes("cyber") || l.includes("fiscal") || l.includes("defesa") || l.includes("dado") || l.includes("ciber")) {
    return <ShieldCheck className="w-3.5 h-3.5 text-[#00ffe0]" />;
  }
  if (l.includes("foguete") || l.includes("aero") || l.includes("engenharia") || l.includes("futuro") || l.includes("rocket")) {
    return <Rocket className="w-3.5 h-3.5 text-[#00ffe0]" />;
  }
  if (l.includes("fábrica") || l.includes("indústria") || l.includes("holding") || l.includes("manufat") || l.includes("complexo") || l.includes("polo")) {
    return <Factory className="w-3.5 h-3.5 text-[#00ffe0]" />;
  }
  if (l.includes("global") || l.includes("mundo") || l.includes("internacional") || l.includes("país") || l.includes("rede")) {
    return <Globe2 className="w-3.5 h-3.5 text-[#00ffe0]" />;
  }
  return <Sparkles className="w-3.5 h-3.5 text-[#00ffe0]" />;
};

export default function HeroCarousel({ onOpenSchedule }: HeroCarouselProps) {
  const { activeBanners } = useHeroBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Keep index within active banners boundaries
  const totalSlides = activeBanners.length;
  const safeIndex = totalSlides > 0 ? Math.min(currentIndex, totalSlides - 1) : 0;
  const currentSlide: HeroBannerItem | undefined = activeBanners[safeIndex];

  const goToSlide = useCallback((index: number, newDirection = 1) => {
    if (totalSlides === 0) return;
    setDirection(newDirection);
    setCurrentIndex(index % totalSlides);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    goToSlide((safeIndex + 1) % totalSlides, 1);
  }, [safeIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    goToSlide((safeIndex - 1 + totalSlides) % totalSlides, -1);
  }, [safeIndex, totalSlides, goToSlide]);

  // Handle auto-advance and progress bar
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= SLIDE_DURATION) {
        nextSlide();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [safeIndex, isPlaying, nextSlide, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  if (totalSlides === 0 || !currentSlide) {
    return (
      <header className="relative w-full py-28 px-6 flex flex-col items-center justify-center text-center bg-black/80 border-b border-white/10">
        <Sparkles className="w-10 h-10 text-[#00ffe0] mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold uppercase tracking-wider text-white">
          DCA TEC // Inovação e Tecnologia
        </h2>
        <p className="text-sm text-white/50 max-w-md mt-2">
          Nenhum banner ativo no momento. Ative os banners desejados no painel de administração.
        </p>
      </header>
    );
  }

  const renderCta = (
    cta: HeroBannerCta,
    isPrimary: boolean
  ) => {
    if (!cta || !cta.label) return null;
    const baseClasses = isPrimary
      ? "btn-gradient px-8 py-4 rounded-full text-black font-bold text-sm tracking-wider uppercase hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,224,0.3)]"
      : "px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold text-sm tracking-wider uppercase backdrop-blur-md hover:border-[#00ffe0]/40 transition-all flex items-center justify-center gap-2";

    if (cta.onClickSchedule) {
      return (
        <button
          key={cta.label}
          onClick={() => onOpenSchedule && onOpenSchedule("Brasil (Sede)")}
          className={baseClasses}
        >
          {cta.label} <ArrowUpRight className="w-4 h-4" />
        </button>
      );
    }

    if (cta.isInternalRoute) {
      return (
        <Link key={cta.label} to={cta.href} className={baseClasses}>
          {cta.label} <ArrowUpRight className="w-4 h-4" />
        </Link>
      );
    }

    if (cta.isExternal) {
      return (
        <a
          key={cta.label}
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
        >
          {cta.label} <ArrowUpRight className="w-4 h-4" />
        </a>
      );
    }

    return (
      <a key={cta.label} href={cta.href} className={baseClasses}>
        {cta.label}
      </a>
    );
  };

  return (
    <header 
      className="relative w-full h-screen min-h-[640px] max-h-[1080px] overflow-hidden flex flex-col justify-between"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Background Slides */}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={currentSlide.id}
          custom={direction}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
        >
          {currentSlide.video ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-30 grayscale brightness-125"
            >
              <source src={currentSlide.video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center brightness-90 md:brightness-100"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Gradients & Ambient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Cyber Grid Lines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 255, 224, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 224, 0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      {/* Subtle Glow Orb */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-[#00ffe0]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Slide Content */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto w-full pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl"
          >
            {/* Kicker / Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/30 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00ffe0] animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[3px] text-[#00ffe0]">
                {currentSlide.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase leading-[1.08]">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-white/80 max-w-2xl font-light leading-relaxed mb-8">
              {currentSlide.subtitle}
            </p>

            {/* Feature Pills (from the banner) */}
            {currentSlide.tags && currentSlide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-10">
                {currentSlide.tags.map((tagLabel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs font-medium text-white/90"
                  >
                    {getTagIcon(tagLabel)}
                    <span>{tagLabel}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              {renderCta(currentSlide.primaryCta, true)}
              {currentSlide.secondaryCta && renderCta(currentSlide.secondaryCta, false)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Bottom Control Bar */}
      <div className="relative z-30 px-6 md:px-16 lg:px-24 pb-10 max-w-7xl mx-auto w-full">
        {/* Progress bar per slide */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00ffe0] to-[#00a6ff]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Slide Indicator Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {activeBanners.map((slide, idx) => {
              const isActive = idx === safeIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx, idx > safeIndex ? 1 : -1)}
                  className={`group relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-white/15 text-[#00ffe0] border border-[#00ffe0]/40 shadow-[0_0_15px_rgba(0,255,224,0.15)]"
                      : "bg-white/5 text-white/50 border border-white/5 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-[10px] text-white/40 group-hover:text-white">0{idx + 1}</span>
                  <span className="hidden md:inline">
                    {slide.navLabel || slide.title.slice(0, 16)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Carousel Arrows & Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pausar carrossel" : "Reproduzir carrossel"}
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-[#00ffe0] hover:border-[#00ffe0]/40 transition-all backdrop-blur-md hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Próximo slide"
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-[#00ffe0] hover:border-[#00ffe0]/40 transition-all backdrop-blur-md hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
