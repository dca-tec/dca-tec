import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Cpu, 
  FlaskConical, 
  Plane, 
  Smartphone, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  Menu,
  X,
  Globe,
  Gavel,
  Zap,
  Code,
  Palette,
  Gamepad2,
  Scale,
  Microscope,
  Wind,
  HardHat,
  Tent,
  Factory,
  Users,
  Calendar,
  CheckCircle2,
  Globe2,
  ShoppingBag,
  BookOpen,
  Rocket,
  Anchor,
  Dna,
  GraduationCap,
  Trophy,
  Briefcase,
  Stethoscope,
  Shirt,
  Car,
  Eye,
  Activity,
  HeartPulse,
  Brain,
  Lightbulb,
  Building,
  Store,
  Waves
} from "lucide-react";
import React, { useState, FormEvent, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import HeroCarousel from "../components/HeroCarousel";
import { useSiteVisibility } from "../lib/siteConfig";
import { usePresenceRegions } from "../lib/presenceConfig";

export default function Home() {
  const { isBlockActive, isProjectActive } = useSiteVisibility();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [scheduleLead, setScheduleLead] = useState({ name: "", email: "" });
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const { activeRegions } = usePresenceRegions();

  const getProjectKey = (item: { id?: string; name: string; url: string }) => {
    if (item.id) return item.id;
    if (item.url.startsWith("/projects/")) return item.url.replace("/projects/", "");
    if (item.url.startsWith("/") && item.url !== "/") return item.url.replace("/", "");
    const map: Record<string, string> = {
      "Tributária": "tributaria",
      "Automações Indústria 6.0": "automacao",
      "Licitações": "licitacoes",
      "DCA Kode": "kode",
      "DCA Design Concepts": "concepts",
      "Gamefication VR": "games",
      "CISQ I - Saúde e Quântica": "cisq-i",
      "Nardi Tec Sanitização": "narditec",
      "Bluenardi Hidrosanitária": "bluenardi",
      "Concerge": "concerge",
      "Jetfy": "jetfy",
      "Workclass": "workclass",
      "Hangar Customs (Oficina)": "hangar-customs",
      "Zenite Estandes": "zenite-estandes",
      "Lagoa Lumina (Espaços)": "lagoa-lumina",
      "Saara Prime Residences": "saara-prime",
      "Aylyn Ambientes": "aylyn",
      "Hypersenses": "hypersenses",
      "Hidrogen Shop": "hidrogen-shop",
      "Ozoncare": "ozoncare",
      "Aiolos": "aiolos",
      "Genesis Acqua": "genesis-acqua",
      "Nossos Clientes": "nossos-clientes",
    };
    return map[item.name] || item.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  };

  const isContatoActive = isBlockActive("contato-direto") || isBlockActive("presenca-global");
  const navContactName = isBlockActive("presenca-global") && !isBlockActive("contato-direto")
    ? "Presença Global"
    : "Contato";
  const navContactHref = isBlockActive("presenca-global") && !isBlockActive("contato-direto")
    ? "#presenca-global"
    : "#contato";

  const allNavLinks = [
    { blockId: "sobre", name: "Sobre", href: "#sobre" },
    { blockId: "consultoria-integrada", name: "Consultoria", href: "#consultoria-integrada" },
    { blockId: "apps", name: "Apps", href: "#apps" },
    { blockId: "engenharia", name: "Engenharia", href: "#engenharia" },
    { blockId: "arquitetura-design", name: "Arquitetura", href: "#arquitetura-design" },
    { blockId: "eventos", name: "Eventos", href: "#eventos" },
    { blockId: "biofisica-saude", name: "Biofísica", href: "#biofisica-saude" },
    { blockId: "contato-nav", name: navContactName, href: navContactHref, isVisible: isContatoActive },
    { blockId: "portal", name: "Portal", href: "/login", isInternal: true },
  ];

  const navLinks = allNavLinks.filter((link) => {
    if (link.blockId === "portal") return true;
    if (link.blockId === "contato-nav") return link.isVisible;
    return isBlockActive(link.blockId);
  });

  const categories = [
    {
      id: "consultoria-integrada",
      title: "Consultoria Integrada",
      icon: <Briefcase className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Tributária", url: "/restituicao-tributaria", icon: <Scale className="w-4 h-4" />, isInternal: true },
        { name: "Automações Indústria 6.0", url: "/automacao", icon: <Zap className="w-4 h-4" />, isInternal: true },
        { name: "Licitações", url: "/licitacoes", icon: <Gavel className="w-4 h-4" />, isInternal: true },
        { name: "Capital Finance", url: "/projects/capital-finance", icon: <Zap className="w-4 h-4" />, isInternal: true },
        { name: "Marketing de Excelência", url: "/projects/marketing-excelencia", icon: <Palette className="w-4 h-4" />, isInternal: true },
        { name: "DCA Kode", url: "/kode", icon: <Code className="w-4 h-4" />, isInternal: true },
        { name: "DCA Design Concepts", url: "/concepts", icon: <Palette className="w-4 h-4" />, isInternal: true },
        { name: "Editora", url: "/projects/editora", icon: <BookOpen className="w-4 h-4" />, isInternal: true },
        { name: "Gamefication VR", url: "/games", icon: <Gamepad2 className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "consultoria-especializada",
      title: "Consultoria Especializada",
      icon: <Microscope className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Biomédica", url: "/projects/biomedica", icon: <Stethoscope className="w-4 h-4" />, isInternal: true },
        { name: "CISQ I - Saúde e Quântica", url: "https://cisq.lovable.app", icon: <HeartPulse className="w-4 h-4" /> },
        { name: "Biofísica", url: "/projects/biofisica", icon: <Activity className="w-4 h-4" />, isInternal: true },
        { name: "CISQ II - Sistemas Quânticos", url: "/projects/cisq-ii", icon: <Cpu className="w-4 h-4" />, isInternal: true },
        { name: "C.I.S.C III - Perícia e Sistemas Complexos", url: "/projects/cisc-iii", icon: <Scale className="w-4 h-4" />, isInternal: true },
        { name: "Nardi Tec Sanitização", url: "https://narditec.lovable.app", icon: <Wind className="w-4 h-4" /> },
        { name: "Laboratorial", url: "/projects/laboratorial", icon: <FlaskConical className="w-4 h-4" />, isInternal: true },
        { name: "BIOTEC Cogumelos", url: "/projects/biotec-cogumelos", icon: <FlaskConical className="w-4 h-4" />, isInternal: true },
        { name: "HUGH Shesau (Biotec)", url: "/projects/hugh-shesau", icon: <Dna className="w-4 h-4" />, isInternal: true },
        { name: "Neotropica Serpentário", url: "/projects/neotropica", icon: <Building2 className="w-4 h-4" />, isInternal: true },
        { name: "Bluenardi Hidrosanitária", url: "https://bluenardi.lovable.app", icon: <Waves className="w-4 h-4" /> },
        { name: "Ozônio Médico", url: "/projects/ozonio-medico", icon: <Stethoscope className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "universidade",
      title: "Universidade e Inovação",
      icon: <GraduationCap className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "HUGH Edwin EBERS Smith", url: "/projects/hugh-edwin", icon: <GraduationCap className="w-4 h-4" />, isInternal: true },
        { name: "Instituto Galenus", url: "/projects/instituto-galenus", icon: <BookOpen className="w-4 h-4" />, isInternal: true },
        { name: "Garage Tec (Incubadora)", url: "/projects/garage-tec", icon: <Lightbulb className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "apps",
      title: "Aplicativos & Plataformas",
      icon: <Smartphone className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Concerge", url: "https://concerge.lovable.app/", icon: <Smartphone className="w-4 h-4" /> },
        { name: "Jetfy", url: "https://jetfy.lovable.app", icon: <Plane className="w-4 h-4" /> },
        { name: "Workclass", url: "https://workclass.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Smart Own", url: "/projects/smart-own", icon: <Smartphone className="w-4 h-4" />, isInternal: true },
        { name: "Mobyfy", url: "/projects/mobyfy", icon: <Smartphone className="w-4 h-4" />, isInternal: true },
        { name: "E-Sense", url: "/projects/e-sense", icon: <Smartphone className="w-4 h-4" />, isInternal: true },
        { name: "SAOAB", url: "/projects/saoab", icon: <Smartphone className="w-4 h-4" />, isInternal: true },
        { name: "Opera Broker", url: "/projects/opera-broker", icon: <Smartphone className="w-4 h-4" />, isInternal: true },
        { name: "Ghettos", url: "/projects/ghettos", icon: <Smartphone className="w-4 h-4" />, isInternal: true },
        { name: "SmartVision", url: "/projects/smartvision", icon: <Eye className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "engenharia",
      title: "Engenharia, Aeroespacial & Naval",
      icon: <Building2 className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Urbtec (Arquitetura)", url: "/projects/urbtec", icon: <Building className="w-4 h-4" />, isInternal: true },
        { name: "Arctecturus (P. Futuros)", url: "/projects/arctecturus", icon: <Building className="w-4 h-4" />, isInternal: true },
        { name: "ArcTec (Design Inteligente)", url: "/projects/arctec", icon: <Cpu className="w-4 h-4" />, isInternal: true },
        { name: "Hangar Customs (Oficina)", url: "https://hangarcustoms.lovable.app", icon: <Car className="w-4 h-4" /> },
        { name: "GeoBio | Neovernacular", url: "/projects/geobio", icon: <Building className="w-4 h-4" />, isInternal: true },
        { name: "Aureon", url: "/projects/aureon", icon: <Rocket className="w-4 h-4" />, isInternal: true },
        { name: "Titan", url: "/projects/titan", icon: <Rocket className="w-4 h-4" />, isInternal: true },
        { name: "Horizon", url: "/projects/horizon", icon: <Rocket className="w-4 h-4" />, isInternal: true },
        { name: "Propulsion", url: "/projects/propulsion", icon: <Zap className="w-4 h-4" />, isInternal: true },
        { name: "Cyberboat", url: "/projects/cyberboat", icon: <Anchor className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "eventos",
      title: "Produções de Eventos",
      icon: <Calendar className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Inside Spirit (Produção)", url: "/projects/inside-spirit", icon: <Users className="w-4 h-4" />, isInternal: true },
        { name: "Zenite Estandes", url: "https://zeniteestandes.lovable.app", icon: <Tent className="w-4 h-4" /> },
        { name: "Lagoa Lumina (Espaços)", url: "https://lagoalumina.lovable.app", icon: <Tent className="w-4 h-4" /> },
        { name: "Opera Spaces", url: "/projects/opera-spaces", icon: <Building className="w-4 h-4" />, isInternal: true },
        { name: "Geodex (Feiras)", url: "/projects/geodex", icon: <Tent className="w-4 h-4" />, isInternal: true },
        { name: "Opera Quantum", url: "/projects/opera-quantum", icon: <Tent className="w-4 h-4" />, isInternal: true },
        { name: "CISQ Life Hub", url: "/projects/cisq-life-hub", icon: <Users className="w-4 h-4" />, isInternal: true },
        { name: "Zetetikos", url: "/projects/zetetikos", icon: <Users className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "lojas-lifestyle",
      title: "Lojas & Estilo de Vida",
      icon: <ShoppingBag className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Hangar Tec Marketplace", url: "/projects/hangar-marketplace", icon: <Store className="w-4 h-4" />, isInternal: true },
        { name: "Regenerativa Terra", url: "/projects/regenerativa-terra", icon: <BookOpen className="w-4 h-4" />, isInternal: true },
        { name: "DCA Inside Codes", url: "/projects/dca-inside-codes", icon: <BookOpen className="w-4 h-4" />, isInternal: true },
        { name: "Hangar Premium Motors", url: "/projects/hangar-premium", icon: <Car className="w-4 h-4" />, isInternal: true },
        { name: "Alazão Motors", url: "/projects/alazao-motors", icon: <Car className="w-4 h-4" />, isInternal: true },
        { name: "Purelinn Moda", url: "/projects/purelinn", icon: <Shirt className="w-4 h-4" />, isInternal: true },
        { name: "Loja do Cobre", url: "/projects/loja-cobre", icon: <Store className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "arquitetura-design",
      title: "Arquitetura & Design",
      icon: <Palette className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Casas Zenite", url: "/projects/casas-zenite", icon: <Building2 className="w-4 h-4" />, isInternal: true },
        { name: "Saara Prime Residences", url: "https://saaraprime.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Pyro Glass Residences", url: "/projects/pyro-glass", icon: <Building2 className="w-4 h-4" />, isInternal: true },
        { name: "Aylyn Ambientes", url: "https://aylyn.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "LUX FROST HEMET (Cobre)", url: "/projects/luxfrost-hemet", icon: <Building2 className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "biofisica-saude",
      title: "Biofísica e Bem-Estar",
      icon: <Activity className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Hypersenses", url: "https://hypersenses.lovable.app", icon: <Zap className="w-4 h-4" /> },
        { name: "Hidrogen Shop", url: "https://hidrogen.lovable.app", icon: <Zap className="w-4 h-4" /> },
        { name: "Saara Sahel (Terapêuticos)", url: "/projects/saara-sahel", icon: <Activity className="w-4 h-4" />, isInternal: true },
        { name: "Ozoncare", url: "https://ozonecare.lovable.app", icon: <Wind className="w-4 h-4" /> },
        { name: "Aiolos", url: "https://aiolos.lovable.app", icon: <Wind className="w-4 h-4" /> },
        { name: "Genesis Acqua", url: "https://genesisacqua.lovable.app", icon: <FlaskConical className="w-4 h-4" /> },
      ]
    },
    {
      id: "parceiros",
      title: "Clientes e Parceiros",
      icon: <Users className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Nossos Clientes", url: "/projects/nossos-clientes", icon: <Users className="w-4 h-4" />, isInternal: true },
        { name: "Parceiros Estratégicos", url: "/projects/parceiros-estrategicos", icon: <Users className="w-4 h-4" />, isInternal: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Navbar */}
      <nav className="fixed w-full bg-black/60 backdrop-blur-custom z-50 py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/" 
              className="text-xl md:text-2xl font-black tracking-[4px] hero-gradient-text hover:opacity-90 transition-opacity"
            >
              DCA TEC
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-8 list-none items-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.isInternal ? (
                  <Link 
                    to={link.href}
                    className="px-5 py-2 bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#00ffe0] hover:text-black transition-all"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a 
                    href={link.href} 
                    className="text-xs uppercase tracking-widest font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl py-8 px-6 border-b border-white/10"
          >
            <div className="mb-6 px-2">
              <span className="text-xl font-black tracking-[4px] hero-gradient-text">
                DCA TEC
              </span>
            </div>

            <ul className="flex flex-col gap-6 list-none">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.isInternal ? (
                    <Link 
                      to={link.href} 
                      className="text-lg font-medium text-white/70 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a 
                      href={link.href} 
                      className="text-lg font-medium text-white/70 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </nav>

      {/* Fullbanner Carousel Section */}
      {isBlockActive("hero_carousel") && (
        <HeroCarousel 
          onOpenSchedule={(office) => {
            setSelectedOffice(office || "Brasil (Sede)");
            setShowScheduleModal(true);
          }}
        />
      )}

      {/* Sobre Section */}
      {isBlockActive("sobre") && (
        <section id="sobre" className="py-32 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-[4px] uppercase">Sobre o Grupo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <p className="text-lg text-white/60 leading-relaxed">
                O **Grupo DCA TEC** é um ecossistema de inovação focado em engenharia de ponta, tecnologia disruptiva, 
                arquitetura moderna e ciência aplicada. Conectamos empresas, laboratórios e projetos estratégicos 
                para criar soluções que moldam o futuro das cidades e das indústrias.
              </p>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <h4 className="text-[#00ffe0] font-bold mb-4 flex items-center gap-2">
                  <Factory className="w-5 h-5" /> HOLDING VALE DAS ARAUCÁRIAS SA
                </h4>
                <p className="text-sm text-white/50">
                  Todas as empresas do Grupo DCA TEC estão sob gestão estratégica da Holding Vale das Araucárias, 
                  garantindo sinergia, governança e excelência em cada operação.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Ecossistema Section Header */}
      {categories.some((cat) => isBlockActive(cat.id)) && (
        <section id="ecossistema-titulo" className="pt-32 pb-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-[8px] hero-gradient-text uppercase mb-4">Ecossistema DCA TEC</h2>
            <div className="w-24 h-1 bg-[#00ffe0] mx-auto rounded-full opacity-50" />
          </motion.div>
        </section>
      )}

      {/* Categorias Dinâmicas */}
      {categories.map((cat, catIdx) => {
        if (!isBlockActive(cat.id)) return null;

        const activeItems = cat.items.filter((item) => isProjectActive(getProjectKey(item)));
        if (activeItems.length === 0) return null;

        return (
          <section key={cat.id} id={cat.id} className={`py-24 px-6 max-w-7xl mx-auto ${catIdx % 2 === 0 ? "" : "bg-white/[0.02] rounded-[60px]"}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-12 justify-center md:justify-start">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  {cat.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-[2px] uppercase">{cat.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeItems.map((item, index) => {
                  const isInternal = (item as any).isInternal;
                  const MotionLink = motion.create(Link);
                  const Component = isInternal ? MotionLink : motion.a;
                  const props = isInternal 
                    ? { to: item.url } 
                    : { href: item.url, target: "_blank", rel: "noopener noreferrer" };

                  return (
                    <Component 
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      {...props as any}
                      className="group bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-[#00ffe0]/40 hover:shadow-[0_0_30px_rgba(0,255,200,0.15)] transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-white/40 group-hover:text-[#00ffe0] transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold tracking-wide group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#00ffe0]" />
                    </Component>
                  );
                })}
              </div>
            </motion.div>
          </section>
        );
      })}

      {/* Polo Industrial Destaque */}
      {isBlockActive("parceiros") && (
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <motion.a 
            href="http://valedasaraucarias.dca.tec.br/"
            target="_blank"
            className="block relative group overflow-hidden rounded-[40px] border border-[#00ffe0]/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" 
              alt="Polo Industrial"
              className="w-full h-80 object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-12">
              <h3 className="text-3xl font-bold mb-2 hero-gradient-text">POLO INDUSTRIAL TECNOLOGIA</h3>
              <p className="text-xl text-white/80 mb-6">Vale das Araucárias — Araucárias PR</p>
              <div className="flex items-center gap-2 text-[#00ffe0] font-bold">
                Conhecer o Polo <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </motion.a>
        </section>
      )}

      {/* Contato & Presença Global Section */}
      {(isBlockActive("contato-direto") || isBlockActive("presenca-global")) && (
        <section id="contato" className="py-32 px-6 max-w-7xl mx-auto">
        {isBlockActive("contato-direto") && (
          <div id="contato-direto" className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-[4px] text-left uppercase">Contato Direto</h2>
              <div className="space-y-8">
                <a 
                  href="https://wa.me/5548991796036" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-6 group p-4 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  <div className="p-4 bg-green-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Phone className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">WhatsApp Business</h4>
                    <p className="text-white/60">+55 (48) 99179-6036</p>
                  </div>
                </a>

                <div className="flex items-start gap-6 p-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <Mail className="text-[#00ffe0]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">E-mail Corporativo</h4>
                    <p className="text-white/60">contato@dca.tec.br</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <Globe className="text-[#00ffe0]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Portal Oficial</h4>
                    <p className="text-white/60">dca.tec.br</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 p-10 rounded-[40px] border border-white/10"
            >
              <h3 className="text-xl font-bold mb-6 uppercase tracking-widest">Envie uma Mensagem</h3>
              <form 
                onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitStatus('idle');
                  
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    subject: formData.get('subject') as string,
                    message: formData.get('message') as string,
                    source: 'home',
                    createdAt: serverTimestamp()
                  };

                  try {
                    await addDoc(collection(db, 'leads'), data);
                    
                    try {
                      await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      });
                    } catch (emailError) {
                      console.error("Error sending email notification:", emailError);
                    }

                    setSubmitStatus('success');
                    (e.target as HTMLFormElement).reset();
                  } catch (error) {
                    console.error("Error saving lead:", error);
                    setSubmitStatus('error');
                    handleFirestoreError(error, OperationType.CREATE, 'leads');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    name="name"
                    type="text" 
                    placeholder="Nome" 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#00ffe0] transition-colors appearance-none"
                    required 
                    disabled={isSubmitting}
                  />
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Email" 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#00ffe0] transition-colors appearance-none"
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                <select 
                  name="subject" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#00ffe0] transition-colors appearance-none text-white/60"
                  disabled={isSubmitting}
                  required
                >
                  <option value="" className="bg-black">Selecione o Assunto</option>
                  <option value="Engenharia" className="bg-black">Assunto: Projetos de Engenharia</option>
                  <option value="Arquitetura" className="bg-black">Assunto: Arquitetura & Urbanismo</option>
                  <option value="Biomedica" className="bg-black">Assunto: Consultoria Biomédica</option>
                  <option value="Tecnologia" className="bg-black">Assunto: Apps & Tecnologia</option>
                  <option value="Investimentos" className="bg-black">Assunto: Investimentos / Holding</option>
                </select>
                <textarea 
                  name="message"
                  placeholder="Sua Mensagem" 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#00ffe0] transition-colors"
                  required
                  disabled={isSubmitting}
                ></textarea>
                
                {submitStatus === 'success' && (
                  <p className="text-green-400 text-sm text-center font-medium">Mensagem Enviada! Obrigado pelo contato. Nossa equipe responderá em breve.</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-400 text-sm text-center font-medium">Ocorreu um erro ao enviar. Por favor, tente novamente.</p>
                )}

                <button 
                  type="submit" 
                  className="w-full btn-gradient py-4 rounded-xl text-black font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Global Presence Grid */}
        {isBlockActive("presenca-global") && (
          <div id="presenca-global" className={isBlockActive("contato-direto") ? "mt-32" : ""}>
            <h2 className="text-3xl font-bold text-center mb-16 tracking-[4px] uppercase">Presença Global</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRegions.map((region, idx) => {
                const activeLocations = region.locations ? region.locations.filter(loc => loc.active !== false) : [];
                return (
                  <motion.div
                    key={region.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group bg-white/5 border border-white/10 p-8 rounded-[32px] hover:border-[#00ffe0]/40 transition-all flex flex-col ${
                      region.isCentral ? 'md:col-span-2 lg:col-span-3 bg-gradient-to-br from-[#00ffe0]/5 to-transparent border-[#00ffe0]/20' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[#00ffe0] mb-4">
                        <Globe2 className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">{region.region}</span>
                      </div>
                      
                      {region.description && (
                        <p className="text-sm text-white/60 leading-relaxed mb-8 max-w-3xl">
                          {region.description}
                        </p>
                      )}

                      {region.locations ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {activeLocations.map((loc, i) => (
                            <div key={loc.id || i} className="bg-black/40 p-6 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-2 text-white mb-2">
                                <MapPin className="w-4 h-4 text-[#00ffe0]" />
                                <span className="font-bold">{loc.city}</span>
                              </div>
                              <h4 className="text-sm font-medium mb-2 text-white/80">{loc.name}</h4>
                              <p className="text-xs text-white/40 leading-relaxed font-mono">{loc.address}</p>
                              {(loc.phone || loc.email) && (
                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/50 pt-3 mt-3 border-t border-white/5">
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
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {region.countries?.map((country, i) => (
                            <span key={i} className="px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-xs text-white/60">
                              {country}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedOffice(region.region);
                        setShowScheduleModal(true);
                      }}
                      className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-8 ${
                        region.isCentral 
                          ? 'bg-[#00ffe0] text-black hover:scale-[1.02]' 
                          : 'bg-white/5 border border-white/10 hover:bg-[#00ffe0] hover:text-black hover:border-[#00ffe0]'
                      }`}
                    >
                      Agendar Reunião - {region.region}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      )}

      {/* Scheduling Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowScheduleModal(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl"
          >
            <button 
              onClick={() => {
                setShowScheduleModal(false);
                setScheduleSuccess(false);
                setScheduleError(null);
              }}
              className="absolute right-8 top-8 text-white/20 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">Agendar Reunião</h3>
            <p className="text-white/40 text-sm mb-8 uppercase tracking-widest">Unidade: {selectedOffice}</p>

            <AnimatePresence mode="wait">
              {scheduleSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Solicitação Enviada!</h4>
                    <p className="text-white/40 text-sm leading-relaxed">
                      Seus dados foram registrados. Você será redirecionado para finalizar o agendamento...
                    </p>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        setShowScheduleModal(false);
                        setScheduleSuccess(false);
                      }}
                      className="text-[#00ffe0] text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      Fechar Janela
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Seus Dados:</div>
                    <input 
                      type="text" 
                      placeholder="Seu Nome"
                      value={scheduleLead.name}
                      onChange={(e) => {
                        setScheduleLead({ ...scheduleLead, name: e.target.value });
                        setScheduleError(null);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all text-sm appearance-none"
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="Seu Melhor E-mail"
                      value={scheduleLead.email}
                      onChange={(e) => {
                        setScheduleLead({ ...scheduleLead, email: e.target.value });
                        setScheduleError(null);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all text-sm appearance-none"
                      required
                    />
                    {scheduleError && (
                      <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold animate-pulse">
                        {scheduleError}
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-white/10 w-full" />

                  <div className="space-y-4">
                    <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Escolha como agendar:</div>
                    
                    <button 
                      onClick={async () => {
                        if (!scheduleLead.name || !scheduleLead.email) {
                          setScheduleError("Preencha seu nome e e-mail para continuar");
                          return;
                        }
                        
                        const msg = encodeURIComponent(`Olá, meu nome é ${scheduleLead.name}. Gostaria de agendar uma reunião (Presencial ou Online) para tratar de assuntos da unidade ${selectedOffice}.`);
                        const whatsappUrl = `https://wa.me/5548991796036?text=${msg}`;
                        window.open(whatsappUrl, '_blank');
                        
                        setIsSavingLead(true);
                        try {
                          await addDoc(collection(db, 'leads'), {
                            ...scheduleLead,
                            source: 'schedule_modal_whatsapp',
                            office: selectedOffice,
                            createdAt: serverTimestamp()
                          });
                          setScheduleSuccess(true);
                          setTimeout(() => {
                            setShowScheduleModal(false);
                            setScheduleSuccess(false);
                            setScheduleLead({ name: "", email: "" });
                          }, 3000);
                        } catch (error) {
                          console.error("Error saving schedule lead:", error);
                          setShowScheduleModal(false);
                        } finally {
                          setIsSavingLead(false);
                        }
                      }}
                      disabled={isSavingLead}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4 hover:border-[#00ffe0] transition-all group disabled:opacity-50 relative overflow-hidden"
                    >
                      {isSavingLead && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <div className="w-5 h-5 border-2 border-[#00ffe0] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-all">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Falar com Consultor</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Agendamento via WhatsApp</p>
                      </div>
                    </button>

                    <button 
                      onClick={async () => {
                        if (!scheduleLead.name || !scheduleLead.email) {
                          setScheduleError("Preencha seu nome e e-mail para continuar");
                          return;
                        }

                        const calendlyUrl = `https://calendly.com/contato-dca`;
                        window.open(calendlyUrl, '_blank');

                        setIsSavingLead(true);
                        try {
                          await addDoc(collection(db, 'leads'), {
                            ...scheduleLead,
                            source: 'schedule_modal_calendly',
                            office: selectedOffice,
                            createdAt: serverTimestamp()
                          });
                          setScheduleSuccess(true);
                          setTimeout(() => {
                            setShowScheduleModal(false);
                            setScheduleSuccess(false);
                            setScheduleLead({ name: "", email: "" });
                          }, 3000);
                        } catch (error) {
                          console.error("Error saving schedule lead:", error);
                          setShowScheduleModal(false);
                        } finally {
                          setIsSavingLead(false);
                        }
                      }}
                      disabled={isSavingLead}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4 hover:border-[#00ffe0] transition-all group disabled:opacity-50 relative overflow-hidden"
                    >
                      {isSavingLead && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <div className="w-5 h-5 border-2 border-[#00ffe0] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Calendly</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Escolha o melhor horário</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <span className="text-xl font-black tracking-[4px] hero-gradient-text">
              DCA TEC
            </span>
            <div className="text-white/30 text-[10px] uppercase tracking-[4px]">
              &copy; {new Date().getFullYear()} DCA TEC GROUP. ALL RIGHTS RESERVED.
            </div>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
