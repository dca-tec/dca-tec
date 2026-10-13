import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface SiteBlock {
  id: string;
  name: string;
  category: "Hero & Identidade" | "Institucional" | "Ecossistema" | "Estratégia & Contato";
  description: string;
  anchor: string;
  defaultActive: boolean;
  order: number;
}

export interface SiteProjectItem {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  url: string;
  isInternal: boolean;
  description: string;
  defaultActive: boolean;
  launchPhase: "Fase 1 (Imediato)" | "Fase 2 (Q1)" | "Fase 3 (Q2)" | "Fase 4 (Q3)" | "Especial";
}

export const DEFAULT_BLOCKS: SiteBlock[] = [
  {
    id: "hero_carousel",
    name: "Carrossel Fullbanner (Hero Principal)",
    category: "Hero & Identidade",
    description: "Carrossel com banner oficial da Expomaq 2026, stand DCA TEC, inovação tecnológica e agendamento VIP.",
    anchor: "#",
    defaultActive: true,
    order: 1,
  },
  {
    id: "sobre",
    name: "Sobre o Grupo DCA TEC & Holding",
    category: "Institucional",
    description: "Apresentação institucional do Grupo DCA TEC e gestão corporativa da Holding Vale das Araucárias SA.",
    anchor: "#sobre",
    defaultActive: true,
    order: 2,
  },
  {
    id: "consultoria-integrada",
    name: "Consultoria Integrada (Negócios & Indústria)",
    category: "Ecossistema",
    description: "Tributária, Automações 6.0, Licitações, Capital Finance, Marketing, Kode, Concepts e Games VR.",
    anchor: "#consultoria-integrada",
    defaultActive: true,
    order: 3,
  },
  {
    id: "consultoria-especializada",
    name: "Consultoria Especializada (Ciência & Saúde)",
    category: "Ecossistema",
    description: "Biomédica, Biofísica, CISQ II Quântica, Perícia C.I.S.C III, Biotecnologia e Ozonioterapia.",
    anchor: "#consultoria-especializada",
    defaultActive: true,
    order: 4,
  },
  {
    id: "universidade",
    name: "Universidade e Inovação",
    category: "Ecossistema",
    description: "HUGH Edwin EBERS Smith, Instituto Galenus e Garage Tec Incubadora de Startups.",
    anchor: "#universidade",
    defaultActive: true,
    order: 5,
  },
  {
    id: "apps",
    name: "Aplicativos & Plataformas Digitais",
    category: "Ecossistema",
    description: "Concerge, Jetfy, Workclass, Smart Own, Mobyfy, E-Sense, SAOAB, Opera Broker, Ghettos e SmartVision.",
    anchor: "#apps",
    defaultActive: true,
    order: 6,
  },
  {
    id: "engenharia",
    name: "Engenharia, Aeroespacial & Naval",
    category: "Ecossistema",
    description: "Urbtec, Arctecturus, ArcTec Design, Hangar Customs, GeoBio, Aureon, Titan, Horizon, Propulsion e Cyberboat.",
    anchor: "#engenharia",
    defaultActive: true,
    order: 7,
  },
  {
    id: "eventos",
    name: "Produções de Eventos & Live Marketing",
    category: "Ecossistema",
    description: "Inside Spirit, Zenite Estandes, Lagoa Lumina, Opera Spaces, Geodex, Opera Quantum e CISQ Life Hub.",
    anchor: "#eventos",
    defaultActive: true,
    order: 8,
  },
  {
    id: "lojas-lifestyle",
    name: "Lojas & Estilo de Vida",
    category: "Ecossistema",
    description: "Hangar Marketplace, Regenerativa Terra, DCA Inside Codes, Motors, Purelinn e Loja do Cobre.",
    anchor: "#lojas-lifestyle",
    defaultActive: true,
    order: 9,
  },
  {
    id: "arquitetura-design",
    name: "Arquitetura & Design de Alto Padrão",
    category: "Ecossistema",
    description: "Casas Zenite, Saara Prime, Pyro Glass, Aylyn Ambientes e LUX FROST HEMET.",
    anchor: "#arquitetura-design",
    defaultActive: true,
    order: 10,
  },
  {
    id: "biofisica-saude",
    name: "Biofísica, Saúde & Bem-Estar",
    category: "Ecossistema",
    description: "Hypersenses, Hidrogen Shop, Saara Sahel, Ozoncare, Aiolos e Genesis Acqua.",
    anchor: "#biofisica-saude",
    defaultActive: true,
    order: 11,
  },
  {
    id: "parceiros",
    name: "Clientes e Parceiros Corporativos",
    category: "Institucional",
    description: "Seção de clientes estratégicos e rede de cooperação empresarial.",
    anchor: "#parceiros",
    defaultActive: true,
    order: 12,
  },
  {
    id: "pilares",
    name: "Pilares Estratégicos (Fundamentos)",
    category: "Estratégia & Contato",
    description: "Governança Corporativa, Inovação Contínua, Segurança Zero Trust e Escala Global.",
    anchor: "#pilares",
    defaultActive: true,
    order: 13,
  },
  {
    id: "contato",
    name: "Central de Contato & Propostas VIP",
    category: "Estratégia & Contato",
    description: "Formulário para envio de proposta, canais diretos e presença global.",
    anchor: "#contato",
    defaultActive: true,
    order: 14,
  },
];

export const DEFAULT_PROJECTS: SiteProjectItem[] = [
  // Consultoria Integrada
  {
    id: "tributaria",
    name: "Tributária (Restituição)",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/restituicao-tributaria",
    isInternal: true,
    description: "Recuperação de créditos tributários e auditoria fiscal de alta performance.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "automacao",
    name: "Automações Indústria 6.0",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/automacao",
    isInternal: true,
    description: "Robótica industrial, sensores IoT e linhas de manufatura autônoma.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "licitacoes",
    name: "Licitações Públicas",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/licitacoes",
    isInternal: true,
    description: "Gestão completa de editais, pregões e contratos com o setor público.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "capital-finance",
    name: "Capital Finance",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/projects/capital-finance",
    isInternal: true,
    description: "Gestão estratégica de capital, estruturação de M&A e investimentos.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "marketing-excelencia",
    name: "Marketing de Excelência",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/projects/marketing-excelencia",
    isInternal: true,
    description: "Branding de luxo, reposicionamento de mercado e campanhas de impacto.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "kode",
    name: "DCA Kode",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/kode",
    isInternal: true,
    description: "Desenvolvimento de software de alta performance, cloud e infraestrutura.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "concepts",
    name: "DCA Design Concepts",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/concepts",
    isInternal: true,
    description: "Laboratório de design industrial, estética futurista e interfaces.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "editora",
    name: "Editora DCA TEC",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/projects/editora",
    isInternal: true,
    description: "Publicações técnicas, científicas e produção de conhecimento.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "games",
    name: "Gamefication VR (Ursa Polaris)",
    category: "Consultoria Integrada",
    categoryId: "consultoria-integrada",
    url: "/games",
    isInternal: true,
    description: "Experiências imersivas em realidade virtual, gamificação corporativa.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },

  // Consultoria Especializada
  {
    id: "biomedica",
    name: "Biomédica",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/biomedica",
    isInternal: true,
    description: "Inteligência médica aplicada, gestão laboratorial e saúde preventiva.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "cisq-i",
    name: "CISQ I - Saúde e Quântica",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "https://cisq.lovable.app",
    isInternal: false,
    description: "Pesquisas em biofotônica e campos energéticos para o bem-estar.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "biofisica",
    name: "Biofísica",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/biofisica",
    isInternal: true,
    description: "Frequências eletromagnéticas aplicadas à regulação celular e homeostase.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "cisq-ii",
    name: "CISQ II - Sistemas Quânticos",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/cisq-ii",
    isInternal: true,
    description: "Sistemas quânticos aplicados à física de materiais e processamento.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "cisc-iii",
    name: "C.I.S.C III - Perícia e Sistemas",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/cisc-iii",
    isInternal: true,
    description: "Perícia técnica forense de engenharia e modelagem matemática.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "narditec",
    name: "Nardi Tec Sanitização",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "https://narditec.lovable.app",
    isInternal: false,
    description: "Sanitização avançada com biotecnologia e padrões hospitalares.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "laboratorial",
    name: "Laboratorial",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/laboratorial",
    isInternal: true,
    description: "Infraestrutura analítica de ponta para testagem e biometria.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "biotec-cogumelos",
    name: "BIOTEC Cogumelos",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/biotec-cogumelos",
    isInternal: true,
    description: "Cultivo controlado de cogumelos medicinais e micologia aplicada.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "hugh-shesau",
    name: "HUGH Shesau (Biotec)",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/hugh-shesau",
    isInternal: true,
    description: "P&D em biologia sintética e formulações regenerativas.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "neotropica",
    name: "Neotropica Serpentário",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/neotropica",
    isInternal: true,
    description: "Conservação biológica e extração ética de peptídeos bioativos.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "bluenardi",
    name: "Bluenardi Hidrosanitária",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "https://bluenardi.lovable.app",
    isInternal: false,
    description: "Engenharia hidrossanitária ecológica e purificação sustentável.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "ozonio-medico",
    name: "Ozônio Médico",
    category: "Consultoria Especializada",
    categoryId: "consultoria-especializada",
    url: "/projects/ozonio-medico",
    isInternal: true,
    description: "Protocolos terapêuticos de ozonioterapia clínica e industrial.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },

  // Universidade e Inovação
  {
    id: "hugh-edwin",
    name: "HUGH Edwin EBERS Smith",
    category: "Universidade e Inovação",
    categoryId: "universidade",
    url: "/projects/hugh-edwin",
    isInternal: true,
    description: "Cátedra de estudos avançados em ciências naturais e exatas.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "instituto-galenus",
    name: "Instituto Galenus",
    category: "Universidade e Inovação",
    categoryId: "universidade",
    url: "/projects/instituto-galenus",
    isInternal: true,
    description: "Formação contínua de executivos, pesquisadores e médicos.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "garage-tec",
    name: "Garage Tec (Incubadora)",
    category: "Universidade e Inovação",
    categoryId: "universidade",
    url: "/projects/garage-tec",
    isInternal: true,
    description: "Incubadora de hardware, robótica e startups de impacto profundo.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },

  // Aplicativos & Plataformas
  {
    id: "concerge",
    name: "Concerge",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "https://concerge.lovable.app/",
    isInternal: false,
    description: "Plataforma de concierge inteligente para condomínios e hospitalidade.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "jetfy",
    name: "Jetfy",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "https://jetfy.lovable.app",
    isInternal: false,
    description: "Marketplace de fretamento e gestão de voos executivos particulares.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "workclass",
    name: "Workclass",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "https://workclass.lovable.app",
    isInternal: false,
    description: "Ecossistema de produtividade e colaboração de alta diretoria.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "smart-own",
    name: "Smart Own",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/smart-own",
    isInternal: true,
    description: "Gestão inteligente de patrimônio e ativos compartilhados fracionados.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "mobyfy",
    name: "Mobyfy",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/mobyfy",
    isInternal: true,
    description: "Mobilidade corporativa sob demanda e gestão de frotas inteligentes.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "e-sense",
    name: "E-Sense",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/e-sense",
    isInternal: true,
    description: "Monitoramento por sensores IoT preditivos para frotas e logística.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "saoab",
    name: "SAOAB",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/saoab",
    isInternal: true,
    description: "Automação e gestão de processos jurídicos para escritórios modernos.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "opera-broker",
    name: "Opera Broker",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/opera-broker",
    isInternal: true,
    description: "Terminais para corretores de alta renda e investimentos imobiliários.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "ghettos",
    name: "Ghettos",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/ghettos",
    isInternal: true,
    description: "Plataforma de cultura urbana, conexão comunitária e eventos.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "smartvision",
    name: "SmartVision",
    category: "Aplicativos & Plataformas",
    categoryId: "apps",
    url: "/projects/smartvision",
    isInternal: true,
    description: "Visão computacional e reconhecimento óptico para segurança perimetral.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },

  // Engenharia, Aeroespacial & Naval
  {
    id: "urbtec",
    name: "Urbtec (Arquitetura)",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/urbtec",
    isInternal: true,
    description: "Planejamento urbano sustentável e infraestrutura inteligente.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "arctecturus",
    name: "Arctecturus (P. Futuros)",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/arctecturus",
    isInternal: true,
    description: "Design futurista e estruturas para colonização e habitats avançados.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "arctec",
    name: "ArcTec (Design Inteligente)",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/arctec",
    isInternal: true,
    description: "Engenharia de precisão com materiais compósitos de última geração.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "hangar-customs",
    name: "Hangar Customs (Oficina)",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "https://hangarcustoms.lovable.app",
    isInternal: false,
    description: "Customização artesanal e preparação aerodinâmica de supercarros.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "geobio",
    name: "GeoBio | Neovernacular",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/geobio",
    isInternal: true,
    description: "Arquitetura viva, biomimetismo e integração com a geologia local.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "aureon",
    name: "Aureon",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/aureon",
    isInternal: true,
    description: "Sistemas aeroespaciais de satélites e monitoramento orbital.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "titan",
    name: "Titan",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/titan",
    isInternal: true,
    description: "Veículos pesados autônomos para mineração e logística extrema.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "horizon",
    name: "Horizon",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/horizon",
    isInternal: true,
    description: "Drones de longa distância e patrulhamento aéreo ecológico.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "propulsion",
    name: "Propulsion",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/propulsion",
    isInternal: true,
    description: "Motores elétricos e híbridos de alta densidade energética.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "cyberboat",
    name: "Cyberboat",
    category: "Engenharia & Aeroespacial",
    categoryId: "engenharia",
    url: "/projects/cyberboat",
    isInternal: true,
    description: "Embarcações solares ultra-velozes em fibra de carbono.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },

  // Eventos
  {
    id: "inside-spirit",
    name: "Inside Spirit (Produção)",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "/projects/inside-spirit",
    isInternal: true,
    description: "Megaeventos culturais, experiências sensoriais e festivais imersivos.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "zenite-estandes",
    name: "Zenite Estandes",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "https://zeniteestandes.lovable.app",
    isInternal: false,
    description: "Estandes arquitetônicos para feiras e congressos internacionais.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "lagoa-lumina",
    name: "Lagoa Lumina (Espaços)",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "https://lagoalumina.lovable.app",
    isInternal: false,
    description: "Complexo de eventos corporativos cercado por natureza e tecnologia.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "opera-spaces",
    name: "Opera Spaces",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "/projects/opera-spaces",
    isInternal: true,
    description: "Arenas e lounges tecnológicos para ativações de marcas globais.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "geodex",
    name: "Geodex (Feiras)",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "/projects/geodex",
    isInternal: true,
    description: "Domos geodésicos desmontáveis para feiras sustentáveis.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "opera-quantum",
    name: "Opera Quantum",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "/projects/opera-quantum",
    isInternal: true,
    description: "Espetáculos com projeção holográfica e lasers de alta frequência.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "cisq-life-hub",
    name: "CISQ Life Hub",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "/projects/cisq-life-hub",
    isInternal: true,
    description: "Encontros de biohackers, longevidade e medicina integrativa.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "zetetikos",
    name: "Zetetikos",
    category: "Produções de Eventos",
    categoryId: "eventos",
    url: "/projects/zetetikos",
    isInternal: true,
    description: "Simpósios de filosofia, epistemologia e ética científica.",
    defaultActive: true,
    launchPhase: "Fase 4 (Q3)",
  },

  // Lojas & Estilo de Vida
  {
    id: "hangar-marketplace",
    name: "Hangar Tec Marketplace",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/hangar-marketplace",
    isInternal: true,
    description: "E-commerce de componentes, eletrônicos industriais e colecionáveis.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "regenerativa-terra",
    name: "Regenerativa Terra",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/regenerativa-terra",
    isInternal: true,
    description: "Produtos agroecológicos regenerativos e alimentos funcionais.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "dca-inside-codes",
    name: "DCA Inside Codes",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/dca-inside-codes",
    isInternal: true,
    description: "Vestuário técnico, streetwear inteligente e lifestyle tecnológico.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "hangar-premium",
    name: "Hangar Premium Motors",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/hangar-premium",
    isInternal: true,
    description: "Showroom de veículos raros, blindados e protótipos esportivos.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "alazao-motors",
    name: "Alazão Motors",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/alazao-motors",
    isInternal: true,
    description: "Comércio especializado de clássicos automotivos restaurados.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "purelinn",
    name: "Purelinn Moda",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/purelinn",
    isInternal: true,
    description: "Moda premium em puro linho orgânico com corte contemporâneo.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "loja-cobre",
    name: "Loja do Cobre",
    category: "Lojas & Estilo de Vida",
    categoryId: "lojas-lifestyle",
    url: "/projects/loja-cobre",
    isInternal: true,
    description: "Peças decorativas e condutivas em cobre puro bactericida.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },

  // Arquitetura & Design
  {
    id: "casas-zenite",
    name: "Casas Zenite",
    category: "Arquitetura & Design",
    categoryId: "arquitetura-design",
    url: "/projects/casas-zenite",
    isInternal: true,
    description: "Residências pré-fabricadas inteligentes com eficiência energética A+.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "saara-prime",
    name: "Saara Prime Residences",
    category: "Arquitetura & Design",
    categoryId: "arquitetura-design",
    url: "https://saaraprime.lovable.app",
    isInternal: false,
    description: "Condomínio de altíssimo padrão com integração biomórfica à paisagem.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
  {
    id: "pyro-glass",
    name: "Pyro Glass Residences",
    category: "Arquitetura & Design",
    categoryId: "arquitetura-design",
    url: "/projects/pyro-glass",
    isInternal: true,
    description: "Fachadas inteligentes em vidro autolimpante com proteção térmica.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "aylyn",
    name: "Aylyn Ambientes",
    category: "Arquitetura & Design",
    categoryId: "arquitetura-design",
    url: "https://aylyn.lovable.app",
    isInternal: false,
    description: "Interiores biofílicos e marcenaria de precisão milimétrica.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "luxfrost-hemet",
    name: "LUX FROST HEMET (Cobre)",
    category: "Arquitetura & Design",
    categoryId: "arquitetura-design",
    url: "/projects/luxfrost-hemet",
    isInternal: true,
    description: "Revestimentos térmicos luxuosos com ligas de cobre e bronze escovado.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },

  // Biofísica e Bem-Estar
  {
    id: "hypersenses",
    name: "Hypersenses",
    category: "Biofísica e Bem-Estar",
    categoryId: "biofisica-saude",
    url: "https://hypersenses.lovable.app",
    isInternal: false,
    description: "Câmaras de privação sensorial e alinhamento neural frequencial.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "hidrogen-shop",
    name: "Hidrogen Shop",
    category: "Biofísica e Bem-Estar",
    categoryId: "biofisica-saude",
    url: "https://hidrogen.lovable.app",
    isInternal: false,
    description: "Geradores de hidrogênio molecular para hidratação antioxidante.",
    defaultActive: true,
    launchPhase: "Fase 2 (Q1)",
  },
  {
    id: "saara-sahel",
    name: "Saara Sahel (Terapêuticos)",
    category: "Biofísica e Bem-Estar",
    categoryId: "biofisica-saude",
    url: "/projects/saara-sahel",
    isInternal: true,
    description: "Óleos essenciais ozonizados e extratos botânicos do deserto.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "ozoncare",
    name: "Ozoncare",
    category: "Biofísica e Bem-Estar",
    categoryId: "biofisica-saude",
    url: "https://ozonecare.lovable.app",
    isInternal: false,
    description: "Dermocosméticos ozonizados de grau farmacêutico e regeneração celular.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "aiolos",
    name: "Aiolos",
    category: "Biofísica e Bem-Estar",
    categoryId: "biofisica-saude",
    url: "https://aiolos.lovable.app",
    isInternal: false,
    description: "Purificadores de ar por plasma frio e ionização catalítica.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },
  {
    id: "genesis-acqua",
    name: "Genesis Acqua",
    category: "Biofísica e Bem-Estar",
    categoryId: "biofisica-saude",
    url: "https://genesisacqua.lovable.app",
    isInternal: false,
    description: "Sistemas quânticos de estruturação e remineralização de água viva.",
    defaultActive: true,
    launchPhase: "Fase 3 (Q2)",
  },

  // Clientes e Parceiros
  {
    id: "nossos-clientes",
    name: "Nossos Clientes",
    category: "Clientes e Parceiros",
    categoryId: "parceiros",
    url: "/projects/nossos-clientes",
    isInternal: true,
    description: "Relação de indústrias, governos e empresas do ecossistema DCA TEC.",
    defaultActive: true,
    launchPhase: "Fase 1 (Imediato)",
  },
];

const LOCAL_STORAGE_KEY = "dca_site_visibility_v2";

export interface VisibilitySettingsState {
  blocks: Record<string, boolean>;
  projects: Record<string, boolean>;
  projectPhases: Record<string, string>;
  updatedAt?: string;
}

export function getDefaultVisibilityState(): VisibilitySettingsState {
  const blocks: Record<string, boolean> = {};
  DEFAULT_BLOCKS.forEach((b) => {
    blocks[b.id] = b.defaultActive;
  });

  const projects: Record<string, boolean> = {};
  const projectPhases: Record<string, string> = {};
  DEFAULT_PROJECTS.forEach((p) => {
    projects[p.id] = p.defaultActive;
    projectPhases[p.id] = p.launchPhase;
  });

  return { blocks, projects, projectPhases, updatedAt: new Date().toISOString() };
}

export function loadStoredSettings(): VisibilitySettingsState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaultVisibilityState();
      return {
        blocks: { ...defaults.blocks, ...(parsed.blocks || {}) },
        projects: { ...defaults.projects, ...(parsed.projects || {}) },
        projectPhases: { ...defaults.projectPhases, ...(parsed.projectPhases || {}) },
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("Error reading site visibility from localStorage:", err);
  }
  return getDefaultVisibilityState();
}

export function saveStoredSettings(state: VisibilitySettingsState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    // Trigger storage event for cross-component re-renders in same window
    window.dispatchEvent(new CustomEvent("dca_visibility_updated", { detail: state }));
  } catch (err) {
    console.warn("Error writing site visibility to localStorage:", err);
  }
}

/**
 * React Hook for consuming and updating site visibility in real time
 */
export function useSiteVisibility() {
  const [state, setState] = useState<VisibilitySettingsState>(() => loadStoredSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "local_only" | "error">("synced");

  // Subscribe to local storage events and Firestore document
  useEffect(() => {
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<VisibilitySettingsState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      }
    };
    window.addEventListener("dca_visibility_updated", handleLocalUpdate);

    // Live subscribe to Firestore if available
    let unsubscribe = () => {};
    try {
      const settingsRef = doc(db, "site_settings", "visibility");
      unsubscribe = onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const defaults = getDefaultVisibilityState();
          const merged: VisibilitySettingsState = {
            blocks: { ...defaults.blocks, ...(data.blocks || {}) },
            projects: { ...defaults.projects, ...(data.projects || {}) },
            projectPhases: { ...defaults.projectPhases, ...(data.projectPhases || {}) },
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
          setState(merged);
          saveStoredSettings(merged);
          setSyncStatus("synced");
        }
      }, (error) => {
        // Fallback to local storage quietly
        console.info("Firestore site_settings listener:", error.message);
        setSyncStatus("local_only");
      });
    } catch {
      setSyncStatus("local_only");
    }

    return () => {
      window.removeEventListener("dca_visibility_updated", handleLocalUpdate);
      unsubscribe();
    };
  }, []);

  const persistState = async (nextState: VisibilitySettingsState) => {
    setIsSaving(true);
    setSyncStatus("saving");
    setState(nextState);
    saveStoredSettings(nextState);

    try {
      const settingsRef = doc(db, "site_settings", "visibility");
      await setDoc(settingsRef, {
        blocks: nextState.blocks,
        projects: nextState.projects,
        projectPhases: nextState.projectPhases,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSyncStatus("synced");
    } catch (err) {
      console.warn("Could not save settings to Firestore (using local storage fallback):", err);
      setSyncStatus("local_only");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBlock = async (blockId: string, forcedValue?: boolean) => {
    const current = state.blocks[blockId] !== false;
    const nextVal = forcedValue !== undefined ? forcedValue : !current;
    const nextState: VisibilitySettingsState = {
      ...state,
      blocks: {
        ...state.blocks,
        [blockId]: nextVal,
      },
      updatedAt: new Date().toISOString(),
    };
    await persistState(nextState);
  };

  const toggleProject = async (projectId: string, forcedValue?: boolean) => {
    const current = state.projects[projectId] !== false;
    const nextVal = forcedValue !== undefined ? forcedValue : !current;
    const nextState: VisibilitySettingsState = {
      ...state,
      projects: {
        ...state.projects,
        [projectId]: nextVal,
      },
      updatedAt: new Date().toISOString(),
    };
    await persistState(nextState);
  };

  const setProjectPhase = async (projectId: string, phase: string) => {
    const nextState: VisibilitySettingsState = {
      ...state,
      projectPhases: {
        ...state.projectPhases,
        [projectId]: phase,
      },
      updatedAt: new Date().toISOString(),
    };
    await persistState(nextState);
  };

  const bulkSetBlocks = async (active: boolean) => {
    const nextBlocks: Record<string, boolean> = {};
    DEFAULT_BLOCKS.forEach((b) => {
      nextBlocks[b.id] = active;
    });
    const nextState: VisibilitySettingsState = {
      ...state,
      blocks: nextBlocks,
      updatedAt: new Date().toISOString(),
    };
    await persistState(nextState);
  };

  const bulkSetProjects = async (active: boolean, categoryId?: string) => {
    const nextProjects = { ...state.projects };
    DEFAULT_PROJECTS.forEach((p) => {
      if (!categoryId || p.categoryId === categoryId) {
        nextProjects[p.id] = active;
      }
    });
    const nextState: VisibilitySettingsState = {
      ...state,
      projects: nextProjects,
      updatedAt: new Date().toISOString(),
    };
    await persistState(nextState);
  };

  const resetToDefaults = async () => {
    const defaults = getDefaultVisibilityState();
    await persistState(defaults);
  };

  const isBlockActive = (blockId: string): boolean => {
    return state.blocks[blockId] !== false;
  };

  const isProjectActive = (projectId: string): boolean => {
    return state.projects[projectId] !== false;
  };

  return {
    blocks: state.blocks,
    projects: state.projects,
    projectPhases: state.projectPhases,
    updatedAt: state.updatedAt,
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
  };
}
