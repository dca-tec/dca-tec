import { 
  Zap, 
  Briefcase, 
  Palette, 
  BookOpen, 
  Stethoscope, 
  Activity, 
  Cpu, 
  Scale, 
  Brain, 
  FlaskConical, 
  Dna, 
  GraduationCap, 
  Lightbulb, 
  Smartphone, 
  Eye, 
  Building, 
  Rocket, 
  Anchor, 
  Users, 
  Tent, 
  ShoppingBag, 
  Store, 
  Car, 
  Shirt, 
  Building2,
  Waves
} from "lucide-react";

export interface ProjectInfo {
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  icon: any;
  features: string[];
  stats?: { label: string; value: string }[];
  ctaText?: string;
}

export const projectsData: Record<string, ProjectInfo> = {
  // Consultoria Integrada
  "capital-finance": {
    slug: "capital-finance",
    name: "Capital Finance",
    category: "Consultoria Integrada",
    description: "Gestão estratégica de capital e investimentos.",
    longDescription: "A Capital Finance do Grupo DCA TEC oferece inteligência financeira para expansão de negócios, gestão de patrimônio e estruturação de investimentos estratégicos com foco em resultados sólidos e sustentáveis.",
    icon: Zap,
    features: ["Gestão de Ativos", "Estruturação de Capital", "Consultoria de Investimento"]
  },
  "marketing-excelencia": {
    slug: "marketing-excelencia",
    name: "Marketing de Excelência",
    category: "Consultoria Integrada",
    description: "Branding e estratégia de mercado de alto impacto.",
    longDescription: "Transformamos marcas através de design estratégico, posicionamento premium e marketing orientado a dados. Criamos identidades que transcendem o comum e geram valor percebido imediato.",
    icon: Palette,
    features: ["Branding Premium", "Performance Digital", "Estratégia de Lançamento"]
  },
  "editora": {
    slug: "editora",
    name: "Editora",
    category: "Consultoria Integrada",
    description: "Publicação de conhecimento técnico e científico.",
    longDescription: "O braço editorial da DCA TEC foca na disseminação de conhecimento técnico, científico e filosófico, servindo como base intelectual para todo o ecossistema e seus parceiros.",
    icon: BookOpen,
    features: ["Publicações Científicas", "Conteúdo Técnico", "Propriedade Intelectual"]
  },

  // Consultoria Especializada
  "biomedica": {
    slug: "biomedica",
    name: "Biomédica",
    category: "Consultoria Especializada",
    description: "Inteligência aplicada à saúde e biotecnologia.",
    longDescription: "Consultoria técnica em biomedicina, focada em otimização laboratorial, novos protocolos de diagnóstico e integração de tecnologias avançadas no cuidado com a saúde.",
    icon: Stethoscope,
    features: ["Protocolos de Diagnóstico", "Gestão de Saúde", "Tecnologia Médica"]
  },
  "biofisica": {
    slug: "biofisica",
    name: "Biofísica",
    category: "Consultoria Especializada",
    description: "Estudo dos princípios físicos na biologia.",
    longDescription: "Pesquisa avançada em biofisica aplicada, explorando como os campos magnéticos, frequências e a física quântica interagem com os sistemas biológicos para promover a homeostase.",
    icon: Activity,
    features: ["Biofotônica", "Frequências Biológicas", "Equilíbrio Quântico"]
  },
  "cisq-ii": {
    slug: "cisq-ii",
    name: "CISQ II - Sistemas Quânticos",
    category: "Consultoria Especializada",
    description: "Centro de Inteligência em Sistemas Quânticos.",
    longDescription: "O CISQ II é dedicado à pesquisa e implementação de tecnologias quânticas aplicadas à engenharia de materiais, computação e sistemas complexos de alta precisão.",
    icon: Cpu,
    features: ["Engenharia Quântica", "Materiais Avançados", "Pesquisa Computacional"]
  },
  "pericia-excelencia": {
    slug: "pericia-excelencia",
    name: "Perícia e Excelência",
    category: "Consultoria Especializada",
    description: "Auditoria e perícia técnica de alta complexidade.",
    longDescription: "Serviços especializados de perícia técnica em sistemas complexos, garantindo conformidade, segurança e excelência operacional para grandes indústrias e projetos críticos.",
    icon: Scale,
    features: ["Laudos Técnicos", "Auditoria de Sistemas", "Forense de Engenharia"]
  },
  "cisc-iii": {
    slug: "cisc-iii",
    name: "C.I.S.C III - Sistemas Complexos",
    category: "Consultoria Especializada",
    description: "Inteligência em Sistemas Complexos e Diligências.",
    longDescription: "Focado em diligências de excelência e análise de sistemas complexos, o CISC III provê soluções analíticas para problemas que exigem uma visão sistêmica e profunda da engenharia moderna.",
    icon: Brain,
    features: ["Análise Sistêmica", "Resolução de Conflitos", "Diligências Técnicas"]
  },
  "laboratorial": {
    slug: "laboratorial",
    name: "Laboratorial",
    category: "Consultoria Especializada",
    description: "Soluções integradas para laboratórios de ponta.",
    longDescription: "Projetamos e gerenciamos ambientes laboratoriais de alta tecnologia, desde o design de fluxo até a automação de processos analíticos complexos.",
    icon: FlaskConical,
    features: ["Design de Laboratórios", "Automação Analítica", "Controle de Qualidade"]
  },
  "hugh-shesau": {
    slug: "hugh-shesau",
    name: "HUGH Shesau (Biotec)",
    category: "Consultoria Especializada",
    description: "Biotecnologia, Biofísica e Bioengenharia.",
    longDescription: "Um laboratório de pesquisa avançada em biotecnologia e bioengenharia, focado em hidrodinâmica, saneamento e sanitização de alta performance.",
    icon: Dna,
    features: ["Bioengenharia", "Hidrodinâmica", "Saneamento 4.0"]
  },

  // Universidade
  "hugh-edwin": {
    slug: "hugh-edwin",
    name: "HUGH Edwin EBERS Smith",
    category: "Universidade e Inovação",
    description: "Hub acadêmico e científico de pesquisa avançada.",
    longDescription: "Inspirada no conhecimento ancestral e tecnológico, a universidade HUGH Edwin foca na educação de elite para engenheiros e cientistas do futuro.",
    icon: GraduationCap,
    features: ["Ensino Superior", "Pesquisa e Desenvolvimento", "Extensão Científica"]
  },
  "garage-tec": {
    slug: "garage-tec",
    name: "Garage Tec",
    category: "Universidade e Inovação",
    description: "Centro de Inovação e Incubadora de Projetos.",
    longDescription: "A Garage Tec é a incubadora do Grupo DCA TEC, onde ideias disruptivas são transformadas em protótipos funcionais e empresas viáveis com suporte total do ecossistema.",
    icon: Lightbulb,
    features: ["Incubação de Startups", "Prototipagem Rápida", "Mentorias Técnicas"]
  },

  // Apps
  "smart-own": {
    slug: "smart-own",
    name: "Smart Own",
    category: "Aplicativos",
    description: "Gestão inteligente de propriedade.",
    longDescription: "Prataforma digital para gestão eficiente de ativos de alto valor, unindo tecnologia de segurança e facilidade de operação para proprietários exigentes.",
    icon: Smartphone,
    features: ["Gestão de Ativos", "Segurança Digital", "Relatórios Financeiros"]
  },
  "mobyfy": {
    slug: "mobyfy",
    name: "Mobyfy",
    category: "Aplicativos",
    description: "Mobilidade inteligente e conectada.",
    longDescription: "Soluções de mobilidade urbana e logística que utilizam inteligência de dados para otimizar fluxos e reduzir custos operacionais.",
    icon: Smartphone,
    features: ["Logística Conectada", "Gestão de Rotas", "Monitoramento Real-time"]
  },
  "e-sense": {
    slug: "e-sense",
    name: "E-Sense",
    category: "Aplicativos",
    description: "Monitoramento sensorial por IA.",
    longDescription: "Sistema avançado de sensoriamento remoto e análise ambiental para cidades inteligentes e grandes indústrias.",
    icon: Smartphone,
    features: ["Sensores de IA", "Análise Ambiental", "Alertas Antecipados"]
  },
  "saoab": {
    slug: "saoab",
    name: "SAOAB",
    category: "Aplicativos",
    description: "Sistemas corporativos especializados.",
    longDescription: "Desenvolvimento de softwares sob medida para ordens profissionais e associações, garantindo agilidade e transparência administrativa.",
    icon: Smartphone,
    features: ["Gestão de Membros", "Financeiro Integrado", "Portal do Associado"]
  },
  "opera-broker": {
    slug: "opera-broker",
    name: "Opera Broker",
    category: "Aplicativos",
    description: "Plataforma avançada de corretagem.",
    longDescription: "Ferramenta dedicada ao mercado financeiro e imobiliário, permitindo transações rápidas, seguras e com análise preditiva de mercado.",
    icon: Smartphone,
    features: ["Trading Real-time", "Análise de Riscos", "Integração Bancária"]
  },
  "ghettos": {
    slug: "ghettos",
    name: "Ghettos",
    category: "Aplicativos",
    description: "Rede conectada de comunidades.",
    longDescription: "Uma plataforma de engajamento comunitário e gestão de bairros planejados, focada em segurança colaborativa e serviços locais.",
    icon: Smartphone,
    features: ["Rede Comunitária", "Segurança Local", "Marketplace de Bairro"]
  },
  "smartvision": {
    slug: "smartvision",
    name: "SmartVision",
    category: "Aplicativos",
    description: "Visão computacional e segurança por IA.",
    longDescription: "Tecnologia de ponta em reconhecimento de padrões e análise de vídeo em tempo real para monitoramento de alta performance.",
    icon: Eye,
    features: ["Biometria Facial", "Rastreamento de Objetos", "Segurança Preditiva"]
  },

  // Engenharia
  "urbtec": {
    slug: "urbtec",
    name: "Urbtec",
    category: "Engenharia",
    description: "Arquitetura e Planejamento Urbano.",
    longDescription: "A Urbtec redefine o conceito de cidades através de projetos urbanísticos que priorizam a sustentabilidade, o fluxo inteligente e a harmonia estética.",
    icon: Building,
    features: ["Masterplans Urbanos", "Design de Infraestrutura", "Cidades Verdes"]
  },
  "arctecturus": {
    slug: "arctecturus",
    name: "Arctecturus",
    category: "Engenharia",
    description: "Projetos Inteligentes para o Futuro.",
    longDescription: "Criamos ambientes sofisticados com automação total, gestão por IA e supermateriais como titânio, grafeno e fibra de carbono. Arquitetura minimalista que transforma sonhos em realidade.",
    icon: Building,
    features: ["Arquitetura de Supermateriais", "Gestão via IA", "Automação Total"]
  },
  "arctec": {
    slug: "arctec",
    name: "ArcTec",
    category: "Engenharia",
    description: "Design e Decoração Inteligente.",
    longDescription: "A ArcTec é focada em design e decoração inteligente, transformando espaços com soluções integradas, design exclusivo e sistemas de automação de alto padrão.",
    icon: Cpu,
    features: ["Design de Interiores", "Móveis Inteligentes", "Automação Residencial"]
  },
  "aureon": {
    slug: "aureon",
    name: "Aureon",
    category: "Engenharia",
    description: "Engenharia Aeroespacial de vanguarda.",
    longDescription: "Focada em satélites e tecnologia de órbita baixa, a Aureon provê infraestrutura de comunicação e sensoriamento para as novas fronteiras espaciais.",
    icon: Rocket,
    features: ["Satélites", "Comunicação Orbital", "Dados Aeroespaciais"]
  },
  "titan": {
    slug: "titan",
    name: "Titan",
    category: "Engenharia",
    description: "Sistemas Aeroespaciais pesados.",
    longDescription: "Desenvolvimento de veículos de lançamento e estruturas de alta resistência para missões críticas no setor aeroespacial.",
    icon: Rocket,
    features: ["Veículos de Lançamento", "Estruturas de Titânio", "Engenharia Pesada"]
  },
  "horizon": {
    slug: "horizon",
    name: "Horizon",
    category: "Engenharia",
    description: "Exploração e tecnologias de fronteira.",
    longDescription: "A Horizon pesquisa novas formas de energia e propulsão para permitir viagens aeroespaciais de longa duração e alta eficiência.",
    icon: Rocket,
    features: ["Propulsão Solar", "Engenharia de Missão", "Novas Energias"]
  },
  "propulsion": {
    slug: "propulsion",
    name: "Propulsion",
    category: "Engenharia",
    description: "Motores e sistemas de empuxo.",
    longDescription: "Desenvolvemos motores elétricos e híbridos de alta performance para o setor aeroespacial e naval, focando em eficiência energética absoluta.",
    icon: Zap,
    features: ["Motores Híbridos", "Eficiência Energética", "Propulsão Elétrica"]
  },
  "cyberboat": {
    slug: "cyberboat",
    name: "Cyberboat",
    category: "Engenharia",
    description: "Engenharia naval e cyber-embarcações.",
    longDescription: "Embarcações autônomas e conectadas, projetadas para monitoramento oceânico, logística e transporte de luxo com emissão zero.",
    icon: Anchor,
    features: ["Navegação Autônoma", "Iates Elétricos", "Cyber-segurança Naval"]
  },

  // Eventos
  "inside-spirit": {
    slug: "inside-spirit",
    name: "Inside Spirit",
    category: "Eventos",
    description: "Produção e organização de eventos de elite.",
    longDescription: "Criamos experiências imersivas onde a tecnologia encontra a arte. Da concepção à execução, o Inside Spirit garante que cada evento seja único e impactante.",
    icon: Users,
    features: ["Produção Executiva", "Cenografia Digital", "Gestão de Eventos"]
  },
  "opera-spaces": {
    slug: "opera-spaces",
    name: "Opera Spaces",
    category: "Eventos",
    description: "Locação de espaços premium e modernos.",
    longDescription: "Curadoria de espaços arquitetônicos para eventos corporativos, lançamentos de marcas e congressos científicos de alto nível.",
    icon: Building,
    features: ["Espaços Corporativos", "Auditórios Inteligentes", "Lounges Premium"]
  },
  "geodex": {
    slug: "geodex",
    name: "Geodex",
    category: "Eventos",
    description: "Feiras internacionais de tecnologia.",
    longDescription: "Organização estratégica de feiras setoriais, conectando expositores globais a mercados em ascensão através de uma infraestrutura impecável.",
    icon: Tent,
    features: ["Exposição Tecnológica", "Networking Global", "Gestão de Stands"]
  },
  "opera-quantum": {
    slug: "opera-quantum",
    name: "Opera Quantum",
    category: "Eventos",
    description: "Congressos de ciência e física quântica.",
    longDescription: "O Opera Quantum é o palco das grandes discussões científicas, reunindo mentes brilhantes para debater os avanços da física e suas aplicações industriais.",
    icon: Cpu,
    features: ["Simpósios Científicos", "Palestras Magistrais", "Publishing Pós-Evento"]
  },
  "cisq-life-hub": {
    slug: "cisq-life-hub",
    name: "CISQ Life Hub",
    category: "Eventos",
    description: "Encontros de networking e bem-estar.",
    longDescription: "Um hub de conexões humanas focado no estilo de vida DCA TEC, integrando saúde, negócios e tecnologia em encontros exclusivos.",
    icon: Users,
    features: ["Networking de Elite", "Life Hub Community", "Wellness Events"]
  },
  "zetetikos": {
    slug: "zetetikos",
    name: "Zetetikos",
    category: "Eventos",
    description: "Grupos de estudo e congressos filosóficos.",
    longDescription: "Dedicado ao pensamento crítico e à filosofia da ciência, o Zetetikos promove o questionamento e a busca constante pela verdade.",
    icon: Users,
    features: ["Debates Filosóficos", "Seminários de Lógica", "Grupos de Pesquisa"]
  },

  // Lojas & Lifestyle
  "hangar-marketplace": {
    slug: "hangar-marketplace",
    name: "Hangar Tec Marketplace",
    category: "Lojas & Estilo de Vida",
    description: "E-commerce de tecnologia e equipamentos.",
    longDescription: "O Marketplace oficial do ecossistema, oferecendo desde gadgets exclusivos até equipamentos industriais de alta precisão certificados pela DCA TEC.",
    icon: Store,
    features: ["Curadoria Premium", "Garantia DCA TEC", "Logística Avançada"]
  },
  "regenerativa-terra": {
    slug: "regenerativa-terra",
    name: "Regenerativa Terra",
    category: "Lojas & Estilo de Vida",
    description: "Livraria e sementes do conhecimento.",
    longDescription: "Uma livraria especializada em permacultura, agricultura regenerativa e biologia de solo, promovendo a harmonia entre homem e terra.",
    icon: BookOpen,
    features: ["Livros Raros", "Educação em Regeneração", "E-books Técnicos"]
  },
  "dca-inside-codes": {
    slug: "dca-inside-codes",
    name: "DCA Inside Codes",
    category: "Lojas & Estilo de Vida",
    description: "Ferramentas e códigos para desenvolvedores.",
    longDescription: "Nossa loja para o desenvolvedor moderno. Oferecemos templates, frameworks e scripts proprietários para acelerar a inovação digital.",
    icon: BookOpen,
    features: ["Code Templates", "SDKs Privados", "Bibliotecas UI"]
  },
  "hangar-premium": {
    slug: "hangar-premium",
    name: "Hangar Premium Motors",
    category: "Lojas & Estilo de Vida",
    description: "Showroom de veículos exclusivos.",
    longDescription: "Curadoria e venda de veículos de luxo e alto desempenho, onde cada carro é uma peça de engenharia admirável.",
    icon: Car,
    features: ["Veículos de Luxo", "Consultoria de Compra", "Pós-Venda Premium"]
  },
  "alazao-motors": {
    slug: "alazao-motors",
    name: "Alazão Motors",
    category: "Lojas & Estilo de Vida",
    description: "Veículos utilitários e off-road.",
    longDescription: "Focada em força e resistência, a Alazão Motors oferece veículos preparados para qualquer terreno com a confiabilidade da engenharia DCA.",
    icon: Car,
    features: ["Customização Off-road", "Expedições", "Veículos Robustos"]
  },
  "purelinn": {
    slug: "purelinn",
    name: "Purelinn Moda",
    category: "Lojas & Estilo de Vida",
    description: "Moda em linho tecnológico.",
    longDescription: "Tudo em linho e linho tec com compósito de linho, cobre e prata. A Purelinn une a elegância natural a tecidos que protegem o corpo e regeneram o bem-estar.",
    icon: Shirt,
    features: ["Tecidos Condutivos", "Design Minimalista", "Bem-estar Vestível"]
  },

  // Arquitetura & Design
  "casas-zenite": {
    slug: "casas-zenite",
    name: "Casas Zenite",
    category: "Arquitetura & Design",
    description: "Residências modulares e minimalistas.",
    longDescription: "Projetos residenciais que utilizam o máximo da luz natural e da ventilação cruzada em estruturas de aço e vidro de rápido montagem.",
    icon: Building2,
    features: ["Construção Modular", "Eficiência Térmica", "Design Contemporâneo"]
  },
  "pyro-glass": {
    slug: "pyro-glass",
    name: "Pyro Glass Residences",
    category: "Arquitetura & Design",
    description: "Arquitetura em vidro e fogo.",
    longDescription: "Experiência residencial única onde a transparência do vidro encontra o calor dos ambientes desenhados para acolher através de lareiras e iluminação quente.",
    icon: Building2,
    features: ["Vidros Termoelétricos", "Lareiras de Design", "Ambientes Integrados"]
  },

  // Biofísica e Saúde
  "saara-sahel": {
    slug: "saara-sahel",
    name: "Saara Sahel",
    category: "Biofísica e Bem-Estar",
    description: "Equipamentos e Produtos Terapêuticos.",
    longDescription: "MAD BEDS, Pirâmides Orgônicas Terapêuticas, Caixas Orgônicas e Luminárias Terapêuticas. Tecnologia Saqqara inspirada em Imhotep para a saúde do futuro.",
    icon: Activity,
    features: ["Pirâmides Orgônicas", "Tecnologia Mad Bed", "Cura Vibracional"]
  },
  "ozonio-medico": {
    slug: "ozonio-medico",
    name: "Ozônio Médico",
    category: "Biofísica e Bem-Estar",
    description: "Terapias oxidativas avançadas.",
    longDescription: "Sistemas profissionais para aplicação de ozônio medicinal, focados em regeneração tecidual, desinfetação e reforço imunológico.",
    icon: Stethoscope,
    features: ["Geradores de Ozônio", "Protocolos de Aplicação", "Suporte Clínico"]
  },

  // Parceiros
  "nossos-clientes": {
    slug: "nossos-clientes",
    name: "Nossos Clientes",
    category: "Parceiros",
    description: "Quem confia no Grupo DCA TEC.",
    longDescription: "Atendemos governos, grandes indústrias e indivíduos de alto perfil que buscam o que há de mais avançado em tecnologia e discrição.",
    icon: Users,
    features: ["Case Studies", "Depoimentos", "Portfólio de Sucesso"]
  },
  "parceiros-estrategicos": {
    slug: "parceiros-estrategicos",
    name: "Parceiros Estratégicos",
    category: "Parceiros",
    description: "Nossa rede global de colaboração.",
    longDescription: "Conectamos nossa tecnologia a parceiros em todo o mundo para escalas soluções globais com agilidade e inteligência local.",
    icon: Users,
    features: ["Rede Global", "Joint Ventures", "Co-branding"]
  },
  "luxfrost-hemet": {
    slug: "luxfrost-hemet",
    name: "LUX FROST HEMET",
    category: "Arquitetura & Design",
    description: "Câmaras frias e containers de cobre.",
    longDescription: "A LUX FROST HEMET é uma solução de refrigeração monumental. Móveis que funcionam como câmaras frias, grandes armários ou containers construídos inteiramente em cobre para precisão térmica e estética brutalista.",
    icon: Building2,
    features: ["Precisão Térmica", "Estrutura de Cobre", "Refrigeração Industrial"]
  },
  "geobio": {
    slug: "geobio",
    name: "GEOBIO",
    category: "Engenharia",
    description: "Geopolimerização Ancestral Pozolânica.",
    longDescription: "Pesquisa e aplicação de técnicas ancestrais de geopolimerização para construção civil de ultra-resistência e baixo impacto ambiental, utilizando materiais pozolânicos de alta reatividade.",
    icon: Building,
    features: ["Construção Ancestral", "Materiais Sustentáveis", "Alta Durabilidade"]
  },
  "biotec-cogumelos": {
    slug: "biotec-cogumelos",
    name: "BIOTEC Cogumelos",
    category: "Consultoria Especializada",
    description: "Produção e Laboratório de Cogumelos Medicinais.",
    longDescription: "Laboratório de biotecnologia focado no cultivo controlado e extração de compostos bioativos de cogumelos medicinais para fins terapêuticos e nutricionais.",
    icon: FlaskConical,
    features: ["Cultivo Controlado", "Extração Bioativa", "Pesquisa Micológica"]
  },
  "instituto-galenus": {
    slug: "instituto-galenus",
    name: "Instituto Galenus",
    category: "Universidade e Inovação",
    description: "Medicina Natural, Biblioteca e Cursos.",
    longDescription: "Um centro dedicado ao ensino da medicina natural baseada em evidências, com uma vasta biblioteca técnica e cursos de especialização para profissionais de saúde.",
    icon: GraduationCap,
    features: ["Educação em Saúde", "Biblioteca Técnica", "Medicina Natural"]
  },
  "neotropica": {
    slug: "neotropica",
    name: "Neotropica Serpentário",
    category: "Engenharia",
    description: "Serpentário de Alta Tecnologia com 6 Domos.",
    longDescription: "Infraestrutura bio-tecnológica avançada composta por 6 domos geodésicos para criação, manejo e extração ética de peçonhas para uso farmacêutico e científico.",
    icon: Building2,
    features: ["Domos Geodésicos", "Extração de Peçonhas", "Manejo Ético"]
  },
  "loja-cobre": {
    slug: "loja-cobre",
    name: "Loja Especializada em Cobre",
    category: "Lojas & Estilo de Vida",
    description: "Produtos de fábrica em cobre para diversos setores.",
    longDescription: "Loja de fábrica dedicada à arte e funcionalidade do cobre. Oferecemos desde utensílios luxuosos até componentes técnicos e decorativos de alta pureza.",
    icon: Store,
    features: ["Cobre de Alta Pureza", "Venda Direta de Fábrica", "Design Funcional"]
  }
};
