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
  Globe2
} from "lucide-react";
import React, { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [scheduleLead, setScheduleLead] = useState({ name: "", email: "" });
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const globalPresence = [
    {
      region: "Centrais de Atendimento",
      description: "Nossos escritórios centrais coordenam o atendimento global. Entre em contato conosco e direcionaremos você para o escritório mais próximo na sua língua nativa.",
      isCentral: true,
      locations: [
        {
          city: "Brasil (Sede)",
          name: "Escritórios em São Paulo, Florianópolis, Curitiba e Rio de Janeiro",
          address: "Atendimento centralizado para toda a América Latina e Europa."
        },
        {
          city: "Estados Unidos",
          name: "Miami Office",
          address: "2801 NW 74th Ave #211, Miami, FL 33122, EUA"
        }
      ]
    },
    {
      region: "América Latina",
      countries: ["Peru", "Colômbia", "Venezuela", "Argentina", "Chile"]
    },
    {
      region: "América Central",
      countries: ["Panamá", "Costa Rica", "México"]
    },
    {
      region: "Europa",
      countries: [
        "Inglaterra (Reino Unido)", "Alemanha", "Espanha", "França", "Itália", 
        "Suíça", "Bélgica", "Irlanda", "Noruega", "Áustria", "Grécia", 
        "República Checa", "Dinamarca", "Hungria", "Eslováquia", 
        "Lituânia e Letônia", "Islândia", "Sérvia", "Ucrânia", "Malta", "Mônaco"
      ]
    },
    {
      region: "Ásia Pacífico",
      countries: [
        "Japão (Tokyo)", "China (Hong Kong)", "Indonésia", "Tailândia", 
        "Nova Zelândia", "Austrália", "Índia", "Filipinas", "Singapura"
      ]
    },
    {
      region: "Oriente Médio e África",
      countries: [
        "Emirados Árabes (Dubai)", "Arábia Saudita", "Catar", "Israel", 
        "Iraque", "Irã", "Egito", "África do Sul", "Marrocos", "Maurício", "Moçambique"
      ]
    },
    {
      region: "Rússia",
      countries: ["Rússia"]
    }
  ];

  const navLinks = [
    { name: "Sobre", href: "#sobre" },
    { name: "Ecossistema", href: "#ecossistema" },
    { name: "Consultoria", href: "#consultoria" },
    { name: "Apps", href: "#apps" },
    { name: "Projetos", href: "#projetos" },
    { name: "Contato", href: "#contato" },
    { name: "Portal", href: "/login", isInternal: true },
  ];

  const categories = [
    {
      id: "ecossistema",
      title: "Ecossistema DCA TEC",
      icon: <Cpu className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Licitações", url: "/licitacoes", icon: <Gavel className="w-4 h-4" />, isInternal: true },
        { name: "Automações Indústria 6.0", url: "/automacao", icon: <Zap className="w-4 h-4" />, isInternal: true },
        { name: "DCA Kode", url: "/kode", icon: <Code className="w-4 h-4" />, isInternal: true },
        { name: "DCA Design Concepts", url: "/concepts", icon: <Palette className="w-4 h-4" />, isInternal: true },
        { name: "Ursa Polaris Games", url: "/games", icon: <Gamepad2 className="w-4 h-4" />, isInternal: true },
      ]
    },
    {
      id: "consultoria",
      title: "Consultoria Especializada",
      icon: <Scale className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Tributária (DCA + OSET)", url: "/restituicao-tributaria", icon: <Scale className="w-4 h-4" />, isInternal: true },
        { name: "CISQ Biomédica", url: "https://cisq.lovable.app", icon: <Microscope className="w-4 h-4" /> },
        { name: "Hypersenses", url: "https://hypersenses.lovable.app", icon: <Zap className="w-4 h-4" /> },
        { name: "Saara Prime", url: "https://saaraprime.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Aiolos", url: "https://aiolos.lovable.app", icon: <Wind className="w-4 h-4" /> },
        { name: "Genesis Acqua", url: "https://genesisacqua.lovable.app", icon: <FlaskConical className="w-4 h-4" /> },
        { name: "Hidrogen", url: "https://hidrogen.lovable.app", icon: <Zap className="w-4 h-4" /> },
        { name: "Narditec Sanitização", url: "https://narditec.lovable.app", icon: <Wind className="w-4 h-4" /> },
        { name: "Ozonecare", url: "https://ozonecare.lovable.app", icon: <Wind className="w-4 h-4" /> },
      ]
    },
    {
      id: "apps",
      title: "Aplicativos & Plataformas",
      icon: <Smartphone className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Concerge", url: "https://concerge.lovable.app/", icon: <Smartphone className="w-4 h-4" /> },
        { name: "Jet Deluxe", url: "https://jetdeluxe.lovable.app", icon: <Plane className="w-4 h-4" /> },
        { name: "Jetfy", url: "https://jetfy.lovable.app", icon: <Plane className="w-4 h-4" /> },
        { name: "Workclass", url: "https://workclass.lovable.app", icon: <Building2 className="w-4 h-4" /> },
      ]
    },
    {
      id: "projetos",
      title: "Projetos, Arquitetura & Engenharia",
      icon: <Building2 className="w-6 h-6 text-[#00ffe0]" />,
      items: [
        { name: "Saara Prime Residences", url: "https://saaraprimeresidences.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Pyramide Residence", url: "https://pyramideresidence.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Aylyn", url: "https://aylyn.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Luxfrost", url: "https://luxfrost.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Zenite Loft", url: "https://zeniteloft.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Zenite Studio", url: "https://zenitestudio.lovable.app", icon: <Building2 className="w-4 h-4" /> },
        { name: "Bluenardi Saneamento", url: "https://bluenardi.lovable.app", icon: <HardHat className="w-4 h-4" /> },
        { name: "Lagoa Lumina", url: "https://lagoalumina.lovable.app", icon: <Tent className="w-4 h-4" /> },
        { name: "Hangar Customs", url: "https://hangarcustoms.lovable.app", icon: <Plane className="w-4 h-4" /> },
        { name: "Zenite Estandes", url: "https://zeniteestandes.lovable.app", icon: <Tent className="w-4 h-4" /> },
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
            className="text-xl font-bold tracking-[4px] hero-gradient-text"
          >
            DCA TEC
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

      {/* Hero Section */}
      <header className="h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20 scale-110 grayscale brightness-150"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-connection-of-blue-dots-and-lines-21045-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#00ffe0]/5 blur-[120px] rounded-full scale-50" />
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold tracking-[8px] hero-gradient-text mb-4 relative z-20"
        >
          DCA TEC
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl mb-10 max-w-2xl tracking-[2px] uppercase"
        >
          Innovation & Technology Group
        </motion.p>
        <motion.a 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          href="#ecossistema" 
          className="btn-gradient px-10 py-4 rounded-full text-black font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          Explorar Ecossistema <ChevronRight className="w-5 h-5" />
        </motion.a>
      </header>

      {/* Sobre Section */}
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

      {/* Categorias Dinâmicas */}
      {categories.map((cat, catIdx) => (
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
              {cat.items.map((item, index) => {
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
      ))}

      {/* Polo Industrial Destaque */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.a 
          href="https://valedasaraucarias.lovable.app/"
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

      {/* Contato Section */}
      <section id="contato" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
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

        {/* Global Presence Grid */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-16 tracking-[4px] uppercase">Presença Global</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalPresence.map((region, idx) => (
              <motion.div
                key={idx}
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
                      {region.locations.map((loc, i) => (
                        <div key={i} className="bg-black/40 p-6 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 text-white mb-2">
                            <MapPin className="w-4 h-4 text-[#00ffe0]" />
                            <span className="font-bold">{loc.city}</span>
                          </div>
                          <h4 className="text-sm font-medium mb-2 text-white/80">{loc.name}</h4>
                          <p className="text-xs text-white/40 leading-relaxed">{loc.address}</p>
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
            ))}
          </div>
        </div>
      </section>

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
      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-white/30 text-[10px] uppercase tracking-[4px]">
            &copy; {new Date().getFullYear()} DCA TEC GROUP. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
