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

export interface HeroCarouselProps {
  onOpenSchedule?: (officeName?: string) => void;
}

export interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image?: string;
  video?: string;
  tags: { label: string; icon: React.ReactNode }[];
  primaryCta: {
    label: string;
    href: string;
    isExternal?: boolean;
    isInternalRoute?: boolean;
    onClickSchedule?: boolean;
  };
  secondaryCta?: {
    label: string;
    href: string;
    isExternal?: boolean;
    isInternalRoute?: boolean;
    onClickSchedule?: boolean;
  };
}

export const slides: SlideData[] = [
  {
    id: "expo-stand",
    badge: "DCA TEC // PRESENÇA GLOBAL & EXPO DE TECNOLOGIA",
    title: "TECNOLOGIA QUE CONECTA PESSOAS E POSSIBILIDADES",
    subtitle: "Soluções integradas de inteligência artificial, biometria de última geração, ciberdefesa e infraestruturas tecnológicas sob medida.",
    image: "/src/assets/images/dca_expo_stand_1791859526860.jpg",
    tags: [
      { label: "Biometria Avançada", icon: <Eye className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Inteligência Artificial", icon: <Cpu className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Cibersegurança", icon: <ShieldCheck className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Soluções Sob Medida", icon: <Sparkles className="w-3.5 h-3.5 text-[#00ffe0]" /> },
    ],
    primaryCta: {
      label: "Explorar Ecossistema",
      href: "#consultoria-integrada",
    },
    secondaryCta: {
      label: "Agendar Reunião VIP",
      href: "#",
      onClickSchedule: true,
    },
  },
  {
    id: "tech-campus",
    badge: "ECOSSISTEMA DCA TEC",
    title: "INNOVATION & TECHNOLOGY GROUP",
    subtitle: "Conectamos empresas, laboratórios científicos, engenharia de ponta e arquitetura disruptiva para construir o futuro das cidades e das indústrias.",
    image: "/src/assets/images/dca_tech_hub_1791859552329.jpg",
    tags: [
      { label: "Engenharia & Aeroespacial", icon: <Rocket className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Biofísica & Saúde", icon: <Sparkles className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Holding & Gestão", icon: <Factory className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Presença Global", icon: <Globe2 className="w-3.5 h-3.5 text-[#00ffe0]" /> },
    ],
    primaryCta: {
      label: "Conhecer o Grupo",
      href: "#sobre",
    },
    secondaryCta: {
      label: "Presença Internacional",
      href: "#contato",
    },
  },
  {
    id: "polo-industrial",
    badge: "HOLDING VALE DAS ARAUCÁRIAS SA",
    title: "POLO INDUSTRIAL DE ALTA TECNOLOGIA",
    subtitle: "Parque tecnológico e complexo empresarial integrando centros de manufatura 6.0, laboratórios e governança de excelência.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
    tags: [
      { label: "Indústria 6.0", icon: <Factory className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Infraestrutura Verde", icon: <Sparkles className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Segurança de Dados", icon: <ShieldCheck className="w-3.5 h-3.5 text-[#00ffe0]" /> },
    ],
    primaryCta: {
      label: "Acessar Portal do Polo",
      href: "http://valedasaraucarias.dca.tec.br/",
      isExternal: true,
    },
    secondaryCta: {
      label: "Projetos de Engenharia",
      href: "#engenharia",
    },
  },
  {
    id: "automacao-ind",
    badge: "TRANSFORMAÇÃO DIGITAL INDUSTRIAL",
    title: "AUTOMAÇÕES & ENGENHARIA COGNITIVA",
    subtitle: "Pipelines operacionais inteligentes, robótica autônoma, IoT industrial e inteligência fiscal para maximizar performance.",
    video: "https://assets.mixkit.co/videos/preview/mixkit-digital-connection-of-blue-dots-and-lines-21045-large.mp4",
    tags: [
      { label: "Automação Autônoma", icon: <Cpu className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Consultoria Fiscal", icon: <ShieldCheck className="w-3.5 h-3.5 text-[#00ffe0]" /> },
      { label: "Governança 360°", icon: <Sparkles className="w-3.5 h-3.5 text-[#00ffe0]" /> },
    ],
    primaryCta: {
      label: "Ver Automações 6.0",
      href: "/automacao",
      isInternalRoute: true,
    },
    secondaryCta: {
      label: "Falar com Consultor",
      href: "#contato",
    },
  },
];

const SLIDE_DURATION = 7000; // 7 seconds per slide

export default function HeroCarousel({ onOpenSchedule }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentSlide = slides[currentIndex];

  const goToSlide = useCallback((index: number, newDirection = 1) => {
    setDirection(newDirection);
    setCurrentIndex(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length, 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length, -1);
  }, [currentIndex, goToSlide]);

  // Handle auto-advance and progress bar
  useEffect(() => {
    if (!isPlaying) {
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
  }, [currentIndex, isPlaying, nextSlide]);

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

  const renderCta = (
    cta: SlideData["primaryCta"],
    isPrimary: boolean
  ) => {
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
                {currentSlide.tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-xs font-medium text-white/90"
                  >
                    {tag.icon}
                    <span>{tag.label}</span>
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
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                  className={`group relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-white/15 text-[#00ffe0] border border-[#00ffe0]/40 shadow-[0_0_15px_rgba(0,255,224,0.15)]"
                      : "bg-white/5 text-white/50 border border-white/5 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-[10px] text-white/40 group-hover:text-white">0{idx + 1}</span>
                  <span className="hidden md:inline">
                    {idx === 0 && "Expo & Presença"}
                    {idx === 1 && "Innovation Group"}
                    {idx === 2 && "Polo Industrial"}
                    {idx === 3 && "Automação 6.0"}
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
