import { motion } from "motion/react";
import { ShieldCheck, FileText, Download, Lock, ArrowLeft, KeyRound, AlertCircle, DollarSign, User, CheckCircle2, Upload, Check, Info, FileUp, ExternalLink } from "lucide-react";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { proposalsData } from "../data/proposals";
import { jsPDF } from "jspdf";

export default function HiddenPortal() {
  const { niche } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptStatus, setAcceptStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [clientId, setClientId] = useState<string | null>(null);
  const [contractAgreed, setContractAgreed] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL Parameters
  const clientNameParam = searchParams.get('cliente');
  const proposalValueParam = searchParams.get('valor');

  // SENHA DE ACESSO (Você pode mudar aqui)
  const ACCESS_PASSWORD = "DCA2026";

  const proposal = niche ? proposalsData[niche] : null;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  const generateComprovantePDF = () => {
    if (!proposal) return;
    
    const doc = new jsPDF();
    const date = new Date().toLocaleString('pt-BR');
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 255, 224); // #00ffe0
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GRUPO DCA TEC", 105, 25, { align: "center" });
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("COMPROVANTE DE ACEITE DIGITAL", 105, 60, { align: "center" });
    
    // Content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Data do Aceite: ${date}`, 20, 80);
    doc.text(`ID da Proposta: ${proposal.id}`, 20, 90);
    doc.text(`Portal: ${proposal.badge}`, 20, 100);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 110, 190, 110);
    
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 20, 125);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome/Empresa: ${clientNameParam || "Não informado"}`, 20, 135);
    if (proposalValueParam) {
      doc.text(`Valor do Investimento: R$ ${proposalValueParam}`, 20, 145);
    }
    
    doc.line(20, 155, 190, 155);
    
    doc.setFont("helvetica", "bold");
    doc.text("TERMOS E CONDIÇÕES", 20, 170);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const terms = [
      "1. Este documento comprova o aceite formal da proposta comercial apresentada via portal digital.",
      "2. O aceite registrado vincula as partes ao escopo técnico descrito na proposta.",
      "3. A formalização contratual definitiva ocorrerá em até 48 horas úteis após este registro.",
      "4. Este documento possui validade jurídica como manifestação de vontade digital."
    ];
    doc.text(terms, 20, 180, { maxWidth: 170 });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento gerado eletronicamente pelo sistema de gestão do Grupo DCA TEC.", 105, 280, { align: "center" });
    doc.text(`Código de Autenticidade: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`, 105, 285, { align: "center" });
    
    doc.save(`Comprovante_Aceite_DCA_${proposal.id}.pdf`);
  };

  const generatePropostaPDF = () => {
    if (!proposal) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 255, 224);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GRUPO DCA TEC", 105, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("PROPOSTA COMERCIAL", 105, 60, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 75);
    doc.text(`Referência: ${proposal.title}`, 20, 85);
    
    doc.setDrawColor(0, 255, 224);
    doc.setLineWidth(0.5);
    doc.line(20, 90, 190, 90);
    
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 20, 105);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${clientNameParam || "A quem possa interessar"}`, 20, 115);
    if (proposalValueParam) {
      doc.text(`Valor do Investimento: R$ ${proposalValueParam}`, 20, 125);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("ESCOPO DOS SERVIÇOS", 20, 145);
    doc.setFont("helvetica", "normal");
    let yPos = 155;
    proposal.scope.forEach(item => {
      doc.setFont("helvetica", "bold");
      doc.text(`• ${item.title}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(item.desc, 160);
      doc.text(lines, 30, yPos + 5);
      yPos += 15 + (lines.length * 5);
    });
    
    // Signature
    doc.setFont("helvetica", "bold");
    doc.text("ASSINATURA DIGITAL", 20, 250);
    doc.setFont("helvetica", "normal");
    doc.text("Assinado Digitalmente por: GRUPO DCA TEC", 20, 260);
    doc.text("CNPJ: 00.000.000/0001-00", 20, 265);
    
    doc.save(`Proposta_Comercial_DCA_${proposal.id}.pdf`);
  };

  const generateCronogramaPDF = () => {
    if (!proposal) return;
    const doc = new jsPDF();
    
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 255, 224);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GRUPO DCA TEC", 105, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("CRONOGRAMA E PROCEDIMENTOS", 105, 60, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ETAPAS DO PROCESSO", 20, 80);
    
    const steps = [
      { t: "1. Aceite Digital", d: "Confirmação da proposta via portal (concluído após o clique)." },
      { t: "2. Assinatura do Contrato", d: "Baixar o contrato assinado pela DCA, assinar e fazer o upload no portal." },
      { t: "3. Envio de Documentos", d: "Envio do Contrato Social, RG/CPF dos sócios e Atestados Técnicos." },
      { t: "4. Certificado Digital A1", d: "Necessário para assinaturas e acessos aos portais governamentais." },
      { t: "5. Procuração Eletrônica", d: "Emitir no e-CAC para DCA TEC e fazer o upload do comprovante." },
      { t: "6. Início dos Trabalhos", d: "Após validação documental, iniciamos a operação técnica." }
    ];
    
    let yPos = 95;
    steps.forEach(step => {
      doc.setFont("helvetica", "bold");
      doc.text(step.t, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(step.d, 25, yPos + 7);
      yPos += 18;
    });
    
    doc.setFont("helvetica", "bold");
    doc.text("DOCUMENTOS NECESSÁRIOS", 20, 210);
    doc.setFont("helvetica", "normal");
    const docs = proposal.requiredDocs.map(d => `- ${d.label}`);
    doc.text(docs, 25, 220);
    
    doc.save(`Cronograma_Procedimentos_DCA_${proposal.id}.pdf`);
  };

  const generateContratoPDF = () => {
    if (!proposal) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 255, 224);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GRUPO DCA TEC", 105, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", 105, 60, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CONTRATADA: GRUPO DCA TEC - CNPJ: 00.000.000/0001-00`, 20, 75);
    doc.text(`CONTRATANTE: ${clientNameParam || "____________________________________"}`, 20, 82);
    doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')}`, 20, 89);
    
    doc.setDrawColor(0, 255, 224);
    doc.setLineWidth(0.5);
    doc.line(20, 95, 190, 95);
    
    doc.setFontSize(11);
    let yPos = 110;
    proposal.contractClauses.forEach((clause, idx) => {
      doc.setFont("helvetica", "bold");
      doc.text(`CLÁUSULA ${idx + 1} - ${clause.title}`, 20, yPos);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(clause.content, 170);
      doc.text(lines, 20, yPos + 7);
      yPos += 15 + (lines.length * 5);
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Signatures area
    if (yPos > 240) {
      doc.addPage();
      yPos = 40;
    } else {
      yPos += 20;
    }
    
    doc.line(20, yPos, 90, yPos);
    doc.text("GRUPO DCA TEC", 55, yPos + 7, { align: "center" });
    doc.text("CONTRATADA", 55, yPos + 12, { align: "center" });
    
    doc.line(120, yPos, 190, yPos);
    doc.text(clientNameParam || "CLIENTE", 155, yPos + 7, { align: "center" });
    doc.text("CONTRATANTE", 155, yPos + 12, { align: "center" });
    
    doc.setFontSize(8);
    doc.text("Este documento é uma via para assinatura física/digital externa.", 105, 280, { align: "center" });
    
    doc.save(`Contrato_DCA_TEC_${proposal.id}.pdf`);
  };

  const handleFileDownload = (fileName: string) => {
    if (fileName.includes("Proposta")) {
      generatePropostaPDF();
    } else if (fileName.includes("Cronograma")) {
      generateCronogramaPDF();
    }
  };

  const handleSignContract = async () => {
    if (!clientId || !contractAgreed) return;
    setIsAccepting(true);
    try {
      await updateDoc(doc(db, 'acceptances', clientId), {
        contractSigned: true,
        contractSignedAt: serverTimestamp(),
        status: 'signed'
      });
      setCurrentStep(3);
    } catch (error) {
      console.error("Error signing contract:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleFileUpload = async (type: string) => {
    if (!clientId) return;
    setUploadingDoc(type);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      await addDoc(collection(db, 'documents'), {
        clientId,
        name: `${type}_${clientId.substring(0, 5)}.pdf`,
        type,
        url: "#", // In real app, this would be Firebase Storage URL
        uploadedAt: serverTimestamp()
      });
      setUploadedDocs(prev => [...prev, type]);
    } catch (error) {
      console.error("Error uploading doc:", error);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleAcceptProposal = async () => {
    if (!proposal || !clientEmail) {
      alert("Por favor, informe seu e-mail para prosseguir.");
      return;
    }
    
    setIsAccepting(true);
    setAcceptStatus('idle');

    const clientCode = `DCA-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;

    const data = {
      proposalId: proposal.id,
      acceptedAt: serverTimestamp(),
      status: 'pending',
      userAgent: navigator.userAgent,
      clientName: clientNameParam || "Cliente Portal",
      clientEmail: clientEmail,
      clientCode: clientCode,
      proposalValue: proposalValueParam || null,
      niche: niche,
      contractSigned: false,
      limits: {
        editais: 10,
        pregoes: 10,
        procedimentos: 10
      },
      usage: {
        editais: 0,
        pregoes: 0,
        procedimentos: 0
      }
    };

    try {
      const docRef = await addDoc(collection(db, 'acceptances'), data);
      setClientId(docRef.id);
      setAcceptStatus('success');
      // Auto advance to step 2 after a short delay
      setTimeout(() => setCurrentStep(2), 2000);
    } catch (error) {
      console.error("Error accepting proposal:", error);
      setAcceptStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'acceptances');
    } finally {
      setIsAccepting(false);
    }
  };

  // Se o nicho não existir, redireciona para a home
  if (!proposal) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Portal Não Encontrado</h2>
        <p className="text-white/40 mb-8">O link acessado é inválido ou expirou.</p>
        <button onClick={() => navigate("/")} className="text-[#00ffe0] hover:underline">Voltar ao Início</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ffe0]/5 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-xl relative z-10"
        >
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-[#00ffe0]/10 rounded-2xl border border-[#00ffe0]/20">
              <Lock className="w-8 h-8 text-[#00ffe0]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Acesso Restrito</h2>
          <p className="text-white/40 text-center text-sm mb-8 uppercase tracking-widest">Grupo DCA TEC • Portal {proposal.badge}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a chave de acesso"
                className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00ffe0] transition-all`}
                autoFocus
              />
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-xs font-medium justify-center"
              >
                <AlertCircle className="w-4 h-4" /> Chave de acesso incorreta.
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full btn-gradient py-4 rounded-2xl text-black font-bold text-lg hover:scale-[1.02] transition-transform"
            >
              Desbloquear Portal
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="/" className="text-white/20 hover:text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Voltar ao Início
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ffe0]/30">
      {/* Header */}
      <nav className="p-6 border-b border-white/5 flex justify-between items-center">
        <div className="text-xl font-bold tracking-[4px] hero-gradient-text">DCA TEC</div>
        <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest">
          <Lock className="w-3 h-3" /> Acesso Restrito • {proposal.badge}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-16 gap-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep >= step ? 'bg-[#00ffe0] text-black shadow-[0_0_20px_rgba(0,255,224,0.3)]' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                {currentStep > step ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && <div className={`w-12 h-0.5 rounded-full ${currentStep > step ? 'bg-[#00ffe0]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] text-xs font-bold uppercase tracking-widest mb-6">
                    <ShieldCheck className="w-4 h-4" /> {proposal.badge}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{proposal.title}</h1>
                </div>

                {(clientNameParam || proposalValueParam) && (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-3 min-w-[280px]">
                    {clientNameParam && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#00ffe0]" />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Para:</p>
                          <p className="text-sm font-bold">{clientNameParam}</p>
                        </div>
                      </div>
                    )}
                    {proposalValueParam && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-[#00ffe0]" />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Investimento:</p>
                          <p className="text-sm font-bold">R$ {proposalValueParam}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-white/60 text-lg max-w-3xl">
                {proposal.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00ffe0]/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#00ffe0]" />
                    </div>
                    Escopo de Atuação
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proposal.scope.map((item) => (
                      <div key={item.title} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <h4 className="font-bold text-[#00ffe0] mb-2">{item.title}</h4>
                        <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-8 bg-gradient-to-br from-[#00ffe0]/10 to-transparent border border-[#00ffe0]/20 rounded-[32px]">
                  <h3 className="text-2xl font-bold mb-4">Diferencial DCA TEC</h3>
                  <p className="text-white/70 leading-relaxed mb-6">
                    {proposal.differential}
                  </p>
                  <ul className="space-y-3 text-sm text-white/60">
                    {proposal.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#00ffe0] rounded-full" /> {bullet}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Sidebar / Actions */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] sticky top-24">
                  <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Arquivos Disponíveis</h4>
                  
                  <div className="space-y-4">
                    {proposal.files.map((file, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleFileDownload(file.name)}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-[#00ffe0]/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#00ffe0]" />
                          <div className="text-left">
                            <p className="text-sm font-bold">{file.name}</p>
                            <p className="text-[10px] text-white/30">{file.type.toUpperCase()} • {file.size}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-white/20 group-hover:text-[#00ffe0]" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5">
                    <p className="text-xs text-white/40 mb-4 uppercase tracking-widest font-bold">Registro de Acesso</p>
                    <div className="mb-6">
                      <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2 font-bold">E-mail para Acesso ao Dashboard</label>
                      <input 
                        type="email" 
                        placeholder="seu@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all text-sm"
                        required
                      />
                      <p className="text-[10px] text-white/20 mt-2 italic">Este e-mail será usado para você acompanhar o status dos serviços.</p>
                    </div>

                    <p className="text-xs text-white/40 mb-4 uppercase tracking-widest">Aprovação Online</p>
                    
                    {acceptStatus === 'success' ? (
                      <div className="space-y-4">
                        <div className="p-6 bg-[#00ffe0]/10 border border-[#00ffe0]/20 rounded-2xl text-center">
                          <CheckCircle2 className="w-8 h-8 text-[#00ffe0] mx-auto mb-3" />
                          <p className="text-[#00ffe0] font-bold text-sm uppercase tracking-widest">Proposta Aceita!</p>
                          <p className="text-[10px] text-white/40 mt-1">Avançando para o contrato...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={handleAcceptProposal}
                          disabled={isAccepting}
                          className="w-full py-4 bg-[#00ffe0] text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                          {isAccepting ? 'Processando...' : 'Aceitar Proposta'}
                        </button>
                        {acceptStatus === 'error' && (
                          <p className="text-red-400 text-[10px] mt-2 text-center">Erro ao processar. Tente novamente.</p>
                        )}
                      </>
                    )}
                    
                    <p className="text-[10px] text-white/20 mt-4 text-center">
                      Ao aceitar, você avançará para a assinatura do contrato digital.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight">Contrato de Prestação de Serviços</h2>
              <p className="text-white/40">Leia os termos e assine digitalmente para prosseguir.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden mb-8">
              <div className="p-12 h-[500px] overflow-y-auto space-y-8 text-white/70 leading-relaxed custom-scrollbar">
                <div className="text-center border-b border-white/10 pb-8">
                  <h3 className="text-xl font-bold text-white mb-2">CONTRATO DCA TEC - {proposal.badge}</h3>
                  <p className="text-xs uppercase tracking-widest">Versão Digital 2026.1</p>
                </div>

                {proposal.contractClauses.map((clause, idx) => (
                  <section key={idx} className="space-y-4">
                    <h4 className="font-bold text-white">{idx + 1}. {clause.title}</h4>
                    <p>{clause.content}</p>
                  </section>
                ))}

                <section className="space-y-4">
                  <h4 className="font-bold text-white">{proposal.contractClauses.length + 1}. VALIDADE JURÍDICA</h4>
                  <p>As partes reconhecem a validade desta assinatura digital, realizada via portal seguro DCA TEC, com respaldo na MP 2.200-2/2001, possuindo a mesma eficácia de um documento assinado fisicamente ou via plataforma Gov.br.</p>
                </section>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/10">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center transition-all ${contractAgreed ? 'bg-[#00ffe0] border-[#00ffe0]' : 'border-white/20 group-hover:border-[#00ffe0]/50'}`}
                       onClick={() => setContractAgreed(!contractAgreed)}>
                    {contractAgreed && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <div className="flex-1" onClick={() => setContractAgreed(!contractAgreed)}>
                    <p className="text-sm font-bold text-white mb-1">Li e concordo com os termos do contrato acima.</p>
                    <p className="text-xs text-white/40">Ao marcar esta caixa, você confirma sua identidade e autoriza o início dos serviços.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={handleSignContract}
                disabled={!contractAgreed || isAccepting}
                className="flex-1 btn-gradient py-5 rounded-2xl text-black font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-30 disabled:grayscale"
              >
                {isAccepting ? 'Assinando...' : 'Assinar Contrato Digital'}
              </button>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => window.open('https://assinador.iti.br/', '_blank')}
                  className="w-full px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-bold hover:bg-white/10 transition-all flex items-center gap-3 text-sm"
                >
                  Assinar via Gov.br <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={generateContratoPDF}
                  className="w-full px-8 py-4 bg-[#00ffe0]/10 border border-[#00ffe0]/20 rounded-2xl text-[#00ffe0] font-bold hover:bg-[#00ffe0]/20 transition-all flex items-center gap-3 text-sm"
                >
                  Baixar Contrato <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-[#00ffe0]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00ffe0]/20">
                <FileUp className="w-10 h-10 text-[#00ffe0]" />
              </div>
              <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight">Habilitação Técnica e Documental</h2>
              <p className="text-white/40 max-w-2xl mx-auto">
                Para participarmos dos pregões em seu nome, precisamos dos documentos abaixo. 
                Seus arquivos são armazenados em ambiente criptografado.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#00ffe0]/20 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-[#00ffe0]" />
                  </div>
                  Upload de Documentos
                </h3>

                {proposal.requiredDocs.map((doc) => (
                  <div key={doc.id} className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between group hover:border-[#00ffe0]/30 transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-sm mb-1">{doc.label}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">{doc.desc}</p>
                    </div>
                    
                    {uploadedDocs.includes(doc.id) ? (
                      <div className="flex items-center gap-2 text-[#00ffe0] font-bold text-xs">
                        <CheckCircle2 className="w-5 h-5" /> ENVIADO
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleFileUpload(doc.id)}
                        disabled={uploadingDoc !== null}
                        className="px-6 py-3 bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#00ffe0] hover:text-black transition-all disabled:opacity-50"
                      >
                        {uploadingDoc === doc.id ? 'Enviando...' : 'Selecionar'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {proposal.ecacInstructions && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Info className="w-4 h-4 text-yellow-500" />
                    </div>
                    Instruções e-CAC (Crítico)
                  </h3>

                  <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                    <p className="text-sm text-white/60 leading-relaxed">
                      Para que possamos gerenciar suas certidões e participar de licitações, você deve autorizar a **DCA TEC** no portal e-CAC da Receita Federal.
                    </p>
                    
                    <div className="space-y-4">
                      {proposal.ecacInstructions.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className="text-[#00ffe0] font-mono font-bold">{idx + 1}.</span>
                          <p className="text-xs text-white/50">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                      <p className="text-[10px] text-yellow-500/80 leading-relaxed">
                        <strong>Atenção:</strong> Sem a procuração e-CAC, não conseguimos emitir certidões negativas necessárias para a habilitação.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!proposal.ecacInstructions && (
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#00ffe0] mb-4" />
                  <h4 className="text-lg font-bold mb-2">Tudo Pronto!</h4>
                  <p className="text-white/40 text-sm">Após o upload dos documentos, nossa equipe iniciará a análise técnica imediatamente.</p>
                </div>
              )}

              <button 
                onClick={() => navigate('/')}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 lg:col-span-2"
              >
                Concluir e Ir para o Site <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-10 border border-white/5 rounded-[40px] bg-gradient-to-br from-white/[0.02] to-transparent text-center mt-20"
        >
          <h4 className="text-xl font-bold mb-2">Dúvidas sobre a proposta?</h4>
          <p className="text-white/40 mb-8">Agende uma reunião técnica com nossa equipe especializada.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href={`mailto:${proposal.contactEmail}`} 
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              {proposal.contactEmail}
            </a>
            <a 
              href="https://wa.me/5548991796036" 
              className="px-8 py-3 bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] rounded-xl font-bold hover:bg-[#00ffe0]/20 transition-all"
            >
              Falar via WhatsApp
            </a>
          </div>
        </motion.div>

        <div className="mt-20 text-center">
          <a href="/" className="text-white/20 hover:text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Site Público
          </a>
        </div>
      </main>

      <footer className="py-10 text-center border-t border-white/5">
        <p className="text-white/20 text-[10px] uppercase tracking-[4px]">
          © 2026 Grupo DCA TEC • Ambiente Criptografado
        </p>
      </footer>
    </div>
  );
}
