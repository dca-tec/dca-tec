import { FileText, ShieldCheck, Zap, Microscope, Building2, HardHat, Gavel } from "lucide-react";

export interface ProposalContent {
  id: string;
  title: string;
  description: string;
  badge: string;
  scope: { title: string; desc: string }[];
  differential: string;
  bullets: string[];
  files: { name: string; size: string; type: 'pdf' | 'doc' }[];
  contactEmail: string;
  contractClauses: { title: string; content: string }[];
  requiredDocs: { id: string; label: string; desc: string }[];
  ecacInstructions?: string[];
}

export const proposalsData: Record<string, ProposalContent> = {
  licitacoes: {
    id: "licitacoes",
    title: "Representação em Licitações & Contratos Públicos",
    description: "A DCA TEC oferece uma solução completa de representação para empresas que buscam expandir sua atuação no mercado público, garantindo conformidade técnica e alta performance em certames.",
    badge: "Representação Estratégica",
    scope: [
      { title: "Monitoramento", desc: "Varredura diária de editais em todos os portais (BLL, ComprasNet, etc)." },
      { title: "Análise Jurídica", desc: "Estudo detalhado de editais e impugnações estratégicas." },
      { title: "Documentação", desc: "Gestão completa de certidões e habilitação técnica." },
      { title: "Operação", desc: "Participação ativa em lances e negociações em tempo real." }
    ],
    differential: "Nossa metodologia une a expertise em engenharia e tecnologia com a inteligência jurídica necessária para vencer licitações complexas. Não apenas participamos; nós construímos a estratégia de vitória.",
    bullets: [
      "Inteligência de dados para análise de concorrentes.",
      "Suporte técnico especializado em diversas áreas.",
      "Gestão de pós-venda e acompanhamento de empenhos."
    ],
    files: [
      { name: "Proposta Comercial (Assinada)", size: "1.2 MB", type: "pdf" },
      { name: "Cronograma e Procedimentos", size: "0.8 MB", type: "pdf" }
    ],
    contactEmail: "licitacoes@dca.tec.br",
    contractClauses: [
      { title: "OBJETO", content: "O presente contrato tem por objeto a prestação de serviços de representação em licitações e contratos públicos, conforme escopo detalhado na proposta comercial." },
      { title: "OBRIGAÇÕES DA CONTRATADA", content: "Realizar a análise técnica e jurídica de editais, representar o CONTRATANTE em pregões eletrônicos e executar procedimentos administrativos necessários." },
      { title: "OBRIGAÇÕES DO CONTRATANTE", content: "Fornecer Certificado Digital A1 válido, realizar a procuração eletrônica no portal e-CAC e disponibilizar documentos de habilitação." }
    ],
    requiredDocs: [
      { id: 'contrato_social', label: 'Contrato Social Consolidado', desc: 'Última alteração contratual completa.' },
      { id: 'certificado_a1', label: 'Certificado Digital A1', desc: 'Arquivo .pfx necessário para os portais.' },
      { id: 'atestado_tecnico', label: 'Atestado de Capacidade Técnica', desc: 'Documento emitido por cliente comprovando aptidão.' },
      { id: 'contrato_assinado', label: 'Contrato Assinado (DCA + Cliente)', desc: 'Versão final com ambas as assinaturas.' },
      { id: 'procuracao_ecac', label: 'Procuração e-CAC', desc: 'Documento emitido e assinado via Gov.br.' }
    ],
    ecacInstructions: [
      "Acesse o portal e-CAC com sua conta Gov.br (Ouro/Prata).",
      "Vá em 'Procurações' > 'Cadastrar Procuração'.",
      "No campo 'Dados do Procurador', insira nosso CNPJ: 00.000.000/0001-00.",
      "Marque a opção: 'Todos os serviços'.",
      "Defina a vigência para 12 ou 24 meses.",
      "Assine com seu certificado digital."
    ]
  },
  tributaria: {
    id: "tributaria",
    title: "Recuperação de Créditos & Inteligência Tributária",
    description: "Transformamos tributos pagos indevidamente em caixa imediato para sua empresa. Analisamos os últimos 60 meses de impostos com risco zero.",
    badge: "Recuperação Fiscal",
    scope: [
      { title: "Revisão Fiscal", desc: "Análise minuciosa dos últimos 5 anos de impostos pagos." },
      { title: "Restituição", desc: "Processo administrativo para devolução de valores direto na conta CNPJ." },
      { title: "Redução de Passivos", desc: "Negociação de dívidas tributárias com até 70% de redução." }
    ],
    differential: "Processo 100% administrativo com segurança jurídica garantida por auditoria digital avançada.",
    bullets: [
      "Risco Zero: Pagamento apenas sobre o êxito.",
      "Velocidade: Créditos homologados em até 60 dias.",
      "Transparência total em cada etapa do processo."
    ],
    files: [
      { name: "Proposta Comercial (Assinada)", size: "1.1 MB", type: "pdf" },
      { name: "Cronograma e Procedimentos", size: "0.7 MB", type: "pdf" }
    ],
    contactEmail: "tributario@dca.tec.br",
    contractClauses: [
      { title: "OBJETO", content: "O presente contrato visa a prestação de serviços de auditoria e recuperação de créditos tributários pagos indevidamente ou a maior." },
      { title: "HONORÁRIOS", content: "A CONTRATADA fará jus a um percentual sobre o proveito econômico efetivamente obtido pelo CONTRATANTE (Success Fee)." },
      { title: "SIGILO", content: "Ambas as partes comprometem-se a manter sigilo absoluto sobre os dados financeiros e fiscais compartilhados." }
    ],
    requiredDocs: [
      { id: 'extratos_simples', label: 'Extratos do Simples Nacional', desc: 'Relatórios mensais dos últimos 60 meses.' },
      { id: 'xml_notas', label: 'Arquivos XML das Notas Fiscais', desc: 'Notas fiscais de saída do período analisado.' },
      { id: 'contrato_social', label: 'Contrato Social', desc: 'Para validação dos representantes legais.' }
    ],
    ecacInstructions: [
      "Acesse o portal e-CAC.",
      "Vá em 'Procurações' > 'Cadastrar Procuração'.",
      "Insira o CNPJ da DCA TEC.",
      "Selecione os serviços: 'Simples Nacional' e 'Restituição e Compensação'.",
      "Assine digitalmente."
    ]
  },
  engenharia: {
    id: "engenharia",
    title: "Engenharia de Alta Performance & Infraestrutura",
    description: "Soluções em engenharia civil e industrial com foco em inovação e gestão de ativos.",
    badge: "Engenharia & Tecnologia",
    scope: [
      { title: "Gestão de Obras", desc: "Acompanhamento técnico com monitoramento remoto." },
      { title: "Projetos Estruturais", desc: "Cálculos avançados para estruturas complexas." },
      { title: "Eficiência Energética", desc: "Sistemas inteligentes de redução de consumo." }
    ],
    differential: "Integração de sensores IoT e análise de dados em projetos de engenharia.",
    bullets: [
      "Metodologia BIM em todos os projetos.",
      "Relatórios de progresso em tempo real.",
      "Foco em sustentabilidade e durabilidade."
    ],
    files: [
      { name: "Proposta Comercial (Assinada)", size: "1.5 MB", type: "pdf" },
      { name: "Cronograma e Procedimentos", size: "0.9 MB", type: "pdf" }
    ],
    contactEmail: "engenharia@dca.tec.br",
    contractClauses: [
      { title: "OBJETO", content: "Prestação de serviços técnicos de engenharia, consultoria e gestão de infraestrutura conforme projeto anexo." },
      { title: "RESPONSABILIDADE TÉCNICA", content: "A CONTRATADA emitirá a devida ART (Anotação de Responsabilidade Técnica) para todos os serviços executados." },
      { title: "CRONOGRAMA", content: "Os prazos de execução seguirão rigorosamente o cronograma físico-financeiro aprovado pelas partes." }
    ],
    requiredDocs: [
      { id: 'matricula_imovel', label: 'Matrícula do Imóvel', desc: 'Documento atualizado do local da intervenção.' },
      { id: 'alvara_construcao', label: 'Alvará de Construção', desc: 'Licença municipal para execução de obras.' },
      { id: 'projetos_anteriores', label: 'Projetos Anteriores', desc: 'Plantas e cortes existentes para análise.' }
    ]
  },
  automacao: {
    id: "automacao",
    title: "Automação Inteligente & Soluções Web3",
    description: "Desenvolvimento de sistemas personalizados, automação de processos e integração com tecnologias blockchain.",
    badge: "Inovação Digital",
    scope: [
      { title: "Automação de Processos", desc: "Eliminação de tarefas repetitivas via software e IA." },
      { title: "Desenvolvimento Web3", desc: "Smart contracts e aplicações descentralizadas." },
      { title: "Integração de APIs", desc: "Conexão entre sistemas para fluxo de dados contínuo." }
    ],
    differential: "Foco em escalabilidade e segurança máxima utilizando as tecnologias mais modernas do mercado.",
    bullets: [
      "Arquitetura de microsserviços.",
      "Segurança por design.",
      "Suporte técnico especializado."
    ],
    files: [
      { name: "Proposta Técnica", size: "1.8 MB", type: "pdf" },
      { name: "Roadmap de Desenvolvimento", size: "0.5 MB", type: "pdf" }
    ],
    contactEmail: "tech@dca.tec.br",
    contractClauses: [
      { title: "OBJETO", content: "Desenvolvimento e licenciamento de software customizado conforme especificações técnicas." },
      { title: "PROPRIEDADE INTELECTUAL", content: "Os direitos sobre o código-fonte serão transferidos ao CONTRATANTE após a quitação integral dos serviços." },
      { title: "MANUTENÇÃO", content: "Garantia de correção de bugs por 90 dias após o deploy em produção." }
    ],
    requiredDocs: [
      { id: 'briefing_tecnico', label: 'Briefing Técnico', desc: 'Documento detalhando as funcionalidades desejadas.' },
      { id: 'acesso_servidores', label: 'Credenciais de Acesso', desc: 'Acessos necessários para deploy e configuração.' }
    ]
  }
};
