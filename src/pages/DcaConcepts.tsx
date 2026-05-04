import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Palette, 
  ChevronRight, 
  ArrowLeft, 
  Mail, 
  Instagram, 
  Linkedin, 
  MessageSquare, 
  PenTool, 
  Camera, 
  Layout, 
  Box,
  Menu,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function DcaConcepts() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const services = [
    {
      title: "Design Gráfico & Branding",
      description: "Identidades visuais autênticas que comunicam a essência e o propósito da sua marca.",
      icon: <Palette className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5"
    },
    {
      title: "Arquitetura & Design de Interiores",
      description: "Espaços que transcendem a função, unindo estética minimalista e engenharia de precisão.",
      icon: <Box className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625"
    },
    {
      title: "Produção Audiovisual",
      description: "Narrativas visuais de alto impacto que conectam sua audiência de forma profunda.",
      icon: <Camera className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d"
    },
    {
      title: "Design Editorial & UI",
      description: "Layouts funcionais e interfaces que priorizam a experiência do usuário e a clareza.",
      icon: <Layout className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bde2"
    }
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      service: formData.get('service') as string,
      message: formData.get('message') as string,
      source: 'dca_concepts',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'leads'), data);
      
      // Optional: notify admin via API
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, subject: `Novo Lead: DCA Concepts - ${data.service}` })
        });
      } catch (e) {
        console.warn("Email notification failed", e);
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
  };

  return (
    <div className="min-h-screen bg-luxury-paper text-luxury-ink font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 py-6 px-8 flex justify-between items-center mix-blend-difference">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform">
             <ArrowLeft className="text-black w-5 h-5 pointer-events-none" />
          </div>
          <span className="text-white text-xs font-black uppercase tracking-[4px]">DCA ECOSYSTEM</span>
        </Link>
        
        <div className="hidden md:flex gap-12 text-white">
          <a href="#services" className="text-[10px] uppercase font-bold tracking-[3px] hover:opacity-50 transition-opacity">Serviços</a>
          <a href="#portfolio" className="text-[10px] uppercase font-bold tracking-[3px] hover:opacity-50 transition-opacity">Portfólio</a>
          <a href="#contact" className="text-[10px] uppercase font-bold tracking-[3px] hover:opacity-50 transition-opacity">Contato</a>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center px-8 md:px-20 relative overflow-hidden bg-luxury-ink text-luxury-paper">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <span className="text-[10px] uppercase font-bold tracking-[6px] text-luxury-gold mb-6 block">Premium Design Studio</span>
          <h1 className="font-serif text-[clamp(3rem,10vw,8rem)] leading-[0.9] italic font-light mb-8">
            Elevamos marcas <br /> 
            <span className="font-normal font-sans tracking-tight not-italic">ao nível de arte.</span>
          </h1>
          <p className="max-w-xl text-lg md:text-xl font-light leading-relaxed opacity-60 mb-12">
            Design Concepts Arrow (DCA) é o braço criativo do ecossistema DCA TEC, 
            unindo estética atemporal e visão estratégica para resultados que transcendem o óbvio.
          </p>
          <a 
            href="#services" 
            className="inline-flex items-center gap-4 px-12 py-5 bg-luxury-gold text-luxury-ink font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
          >
            Nossa Visão <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden opacity-30 grayscale pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" 
            className="w-full h-full object-cover"
            alt="Architecture"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 px-8 md:px-20 bg-luxury-paper">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[6px] text-luxury-gold mb-4 block">Nossa Expertise</span>
            <h2 className="font-serif text-5xl md:text-6xl font-light lowercase transition-all">Curadoria Criativa <span className="italic">& Técnica.</span></h2>
          </div>
          <p className="max-w-md text-luxury-ink/60 leading-relaxed font-light">
            Não apenas criamos, nós curamos. Cada pixel, traço e conceito é meticulosamente planejado para alinhar beleza e funcionalidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1px bg-luxury-ink/10 border border-luxury-ink/10">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-luxury-paper p-12 md:p-16 group hover:bg-luxury-ink hover:text-luxury-paper transition-all overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="text-luxury-gold mb-8 group-hover:scale-110 transition-transform origin-left">
                  {service.icon}
                </div>
                <h3 className="font-serif text-3xl mb-6 font-light">{service.title}</h3>
                <p className="opacity-60 leading-relaxed mb-8 max-w-sm">{service.description}</p>
                <div className="w-12 h-1px bg-luxury-gold transform origin-left transition-all duration-500 scale-x-0 group-hover:scale-x-100" />
              </div>
              
              <div className="absolute right-0 bottom-0 w-48 h-48 opacity-0 group-hover:opacity-20 transition-all duration-700 translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 grayscale pointer-events-none">
                <img src={service.image} className="w-full h-full object-cover rounded-tl-[100px]" alt={service.title} referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portfolio Highlight */}
      <section id="portfolio" className="py-32 bg-luxury-ink text-luxury-paper overflow-hidden">
        <div className="px-8 md:px-20 mb-20 text-center">
           <h2 className="font-serif text-4xl md:text-7xl font-light mb-6 lowercase italic">Projetos <span className="not-italic font-sans font-black tracking-tighter">— Escolhidos.</span></h2>
        </div>

        <div className="flex flex-col md:flex-row h-[70vh]">
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex-1 relative group overflow-hidden border-r border-white/5">
              <img 
                src={`https://picsum.photos/seed/dca${i}/800/1200`} 
                className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000"
                alt="Project"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-12 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[10px] uppercase font-bold tracking-[4px] text-luxury-gold mb-2">Conceito 0{i}</span>
                <h4 className="font-serif text-2xl italic mb-4">Experiência Imersiva {i}</h4>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  Ver Caso <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-8 md:px-20 bg-luxury-paper">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[6px] text-luxury-gold mb-6 block">Inicie seu Projeto</span>
            <h2 className="font-serif text-6xl md:text-7xl font-light italic mb-12">Vamos criar algo <br /> extraordinário juntos.</h2>
            
            <div className="space-y-12">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-[2px] opacity-40 mb-4">Siga-nos</h4>
                <div className="flex gap-8">
                   <a href="#" className="hover:text-luxury-gold transition-colors"><Instagram /></a>
                   <a href="#" className="hover:text-luxury-gold transition-colors"><Linkedin /></a>
                   <a href="#" className="hover:text-luxury-gold transition-colors"><Mail /></a>
                </div>
              </div>
              
              <div className="p-8 border border-luxury-ink/10 rounded-sm">
                <p className="text-sm italic opacity-60 mb-4">"O design não é apenas como parece ou se sente. O design é como funciona."</p>
                <p className="text-xs font-bold uppercase tracking-[2px]">Steve Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 md:p-16 shadow-2xl relative">
            {/* Corner decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-luxury-gold/30 -mr-4 -mt-4 pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="text-[10px] uppercase font-black tracking-[3px] mb-2 block">Nome Completo</label>
                <input 
                  name="name"
                  type="text" 
                  placeholder="Seu nome"
                  className="w-full border-b border-luxury-ink/20 py-4 focus:outline-none focus:border-luxury-gold transition-colors bg-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-black tracking-[3px] mb-2 block">E-mail Corporativo</label>
                <input 
                  name="email"
                  type="email" 
                  placeholder="email@empresa.com"
                  className="w-full border-b border-luxury-ink/20 py-4 focus:outline-none focus:border-luxury-gold transition-colors bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-[3px] mb-2 block">Interesse Principal</label>
                <select 
                  name="service"
                  className="w-full border-b border-luxury-ink/20 py-4 focus:outline-none focus:border-luxury-gold transition-colors bg-transparent appearance-none"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="branding">Branding & Identidade</option>
                  <option value="arquitetura">Arquitetura de Luxo</option>
                  <option value="audiovisual">Produção Audiovisual</option>
                  <option value="editorial">Design Editorial</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-[3px] mb-2 block">O Desafio</label>
                <textarea 
                  name="message"
                  placeholder="Conte-nos sobre seu projeto..."
                  rows={4}
                  className="w-full border-b border-luxury-ink/20 py-4 focus:outline-none focus:border-luxury-gold transition-colors bg-transparent"
                  required
                ></textarea>
              </div>

              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs font-bold uppercase tracking-widest">Agradecemos o contato. Entraremos em sintonia em breve.</motion.p>
                )}
                {submitStatus === 'error' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-xs font-bold uppercase tracking-widest">Houve um descompasso. Tente novamente.</motion.p>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-luxury-ink text-luxury-paper font-black uppercase tracking-[4px] text-xs hover:bg-luxury-gold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Curadoria'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 md:px-20 border-t border-luxury-ink/5 text-center">
        <div className="font-serif text-2xl italic lowercase mb-8">dca.concepts</div>
        <div className="text-[10px] uppercase font-bold tracking-[8px] opacity-30">
          &copy; {new Date().getFullYear()} DCA DESIGN CONCEPTS ARROW. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-luxury-ink text-luxury-paper flex flex-col p-12"
          >
            <div className="flex justify-between items-center mb-24">
              <div className="font-serif text-2xl italic">dca.concepts</div>
              <button onClick={() => setIsMenuOpen(false)}><X className="w-8 h-8" /></button>
            </div>
            
            <div className="flex flex-col gap-12 text-4xl font-serif lowercase italic">
              <a href="#services" onClick={() => setIsMenuOpen(false)}>serviços</a>
              <a href="#portfolio" onClick={() => setIsMenuOpen(false)}>portfólio</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)}>contato</a>
            </div>
            
            <div className="mt-auto pt-24 border-t border-white/10">
               <span className="text-[10px] uppercase font-bold tracking-[4px] opacity-40">DCA Ecosystem — Design Concepts Arrow</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
