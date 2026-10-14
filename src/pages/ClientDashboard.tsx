import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gavel, 
  Scale, 
  Cpu, 
  Palette, 
  Megaphone, 
  Globe, 
  HardHat, 
  LogOut, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Download,
  FileUp,
  Trash2,
  ShieldCheck,
  Package,
  Receipt,
  CreditCard,
  MessageSquare,
  Send,
  Building2
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDocs, addDoc, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { formatTime, formatDateTime } from "../lib/dateUtils";

type Department = 'licitacoes' | 'tributaria' | 'ti' | 'design' | 'marketing' | 'web' | 'engenharia' | 'chat';

interface Bidding {
  id: string;
  title: string;
  number?: string;
  organ?: string;
  status: 'analise' | 'participando' | 'vencido' | 'perdido' | 'impugnado' | 'homologado';
  department: string;
  actions: string[];
  createdAt: any;
  notaEmpenhoUrl?: string;
  notaFiscalUrl?: string;
  pagamentoConfirmado?: boolean;
  prazo?: any;
}

interface Acceptance {
  id: string;
  clientName: string;
  clientEmail: string;
  niche: string;
  contractSigned: boolean;
  usage: {
    editais: number;
    pregoes: number;
    procedimentos: number;
  };
  limits: {
    editais: number;
    pregoes: number;
    procedimentos: number;
  };
  cancellationRequested?: boolean;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState<Department | 'chat'>('licitacoes');
  const [acceptance, setAcceptance] = useState<Acceptance | null>(null);
  const [biddings, setBiddings] = useState<Bidding[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Fetch client acceptance record
    const q = query(collection(db, 'acceptances'), where('clientEmail', '==', user.email?.toLowerCase().trim()));
    const unsubAcceptance = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        setAcceptance({ id: docData.id, ...docData.data() } as Acceptance);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'acceptances'));

    return () => unsubAcceptance();
  }, [user]);

  useEffect(() => {
    if (!acceptance) return;

    // Fetch biddings for this client
    const qBiddings = query(collection(db, 'biddings'), where('clientId', '==', acceptance.id));
    const unsubBiddings = onSnapshot(qBiddings, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bidding));
      setBiddings(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'biddings'));

    // Fetch documents
    const qDocs = query(collection(db, 'documents'), where('clientId', '==', acceptance.id));
    const unsubDocs = onSnapshot(qDocs, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'documents'));

    return () => {
      unsubBiddings();
      unsubDocs();
    };
  }, [acceptance]);

  useEffect(() => {
    if (!acceptance) return;

    const qMessages = query(
      collection(db, "messages"),
      where("clientId", "==", acceptance.id),
      orderBy("createdAt", "asc")
    );

    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "messages"));

    return () => unsubMessages();
  }, [acceptance]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !acceptance || !user) return;

    try {
      await addDoc(collection(db, "messages"), {
        clientId: acceptance.id,
        senderId: user.uid,
        senderName: acceptance.clientName || user.email,
        text: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "messages");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !acceptance) return;
    const file = e.target.files[0];
    
    // In a real app, we would upload to Firebase Storage first.
    // For this demo, we'll simulate a successful upload with a mock URL.
    const mockUrl = `https://example.com/docs/${file.name}`;
    
    try {
      await addDoc(collection(db, "documents"), {
        clientId: acceptance.id,
        name: file.name,
        type: file.type,
        url: mockUrl,
        status: 'pending',
        uploadedAt: serverTimestamp()
      });
      alert("Documento enviado para revisão do administrador.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "documents");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleRequestCancellation = async () => {
    if (!acceptance) return;
    try {
      await updateDoc(doc(db, 'acceptances', acceptance.id), {
        cancellationRequested: true,
        cancellationReason: cancelReason,
        cancellationDate: serverTimestamp()
      });
      setShowCancelModal(false);
      alert("Solicitação de cancelamento enviada com sucesso. Nossa equipe entrará em contato conforme as diretrizes da LGPD.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'acceptances');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00ffe0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const departments = [
    { id: 'licitacoes', name: 'Licitações', icon: <Gavel className="w-5 h-5" /> },
    { id: 'tributaria', name: 'Tributária', icon: <Receipt className="w-5 h-5" /> },
    { id: 'ti', name: 'TI & Automação', icon: <Cpu className="w-5 h-5" /> },
    { id: 'design', name: 'Design Concepts', icon: <Palette className="w-5 h-5" /> },
    { id: 'marketing', name: 'Marketing', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'web', name: 'Web & Apps', icon: <Globe className="w-5 h-5" /> },
    { id: 'engenharia', name: 'Engenharia', icon: <Building2 className="w-5 h-5" /> },
    { id: 'chat', name: 'Chat Direto', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5">
          <div className="text-xl font-bold tracking-[4px] hero-gradient-text mb-2">DCA TEC</div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Portal do Cliente</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-4 px-2">Departamentos</p>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                activeDept === dept.id 
                  ? 'bg-[#00ffe0] text-black font-bold shadow-[0_0_20px_rgba(0,255,224,0.2)]' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`${activeDept === dept.id ? 'text-black' : 'text-white/20 group-hover:text-[#00ffe0]'} transition-colors`}>
                {dept.icon}
              </div>
              <span className="text-sm">{dept.name}</span>
              {activeDept === dept.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}

          <div className="pt-8 mt-8 border-t border-white/5">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-4 px-2">Minha Conta</p>
            <button 
              onClick={() => setActiveDept('licitacoes')} // Placeholder for profile
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/40 hover:bg-white/5 hover:text-white transition-all"
            >
              <User className="w-5 h-5 text-white/20" />
              <span className="text-sm">Perfil & Documentos</span>
            </button>
            <button 
              onClick={() => setShowCancelModal(true)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm">Privacidade (LGPD)</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffe0] to-[#0080ff] flex items-center justify-center text-black font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.email}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Cliente Ativo</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-white/40 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Sair do Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
        {activeDept === 'chat' ? (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="mb-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Chat Direto</h2>
              <p className="text-white/40 font-medium">Fale diretamente com seu gerente de contas DCA</p>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-[40px] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/10">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-widest">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-5 rounded-3xl text-sm ${
                        msg.senderId === user.uid 
                          ? 'bg-[#00ffe0] text-black font-medium rounded-tr-none' 
                          : 'bg-white/10 text-white rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-white/20 mt-2 px-2">
                        {msg.senderName} • {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Sua mensagem..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#00ffe0] transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-4 bg-[#00ffe0] text-black rounded-2xl hover:scale-105 transition-transform"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                  {departments.find(d => d.id === activeDept)?.name}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#00ffe0]" />
                    Status: <span className="text-white">Em Conformidade</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                    <Package className="w-4 h-4 text-[#00ffe0]" />
                    Plano: <span className="text-white">Enterprise DCA</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mb-1">Seu Gerente de Contas</p>
                <p className="text-xl font-bold">{acceptance?.accountManager || 'Equipe DCA'}</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {activeDept === 'licitacoes' ? (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Editais em Andamento</h3>
                    {biddings.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-center">
                        <Gavel className="w-16 h-16 text-white/5 mx-auto mb-4" />
                        <p className="text-white/20 font-bold uppercase tracking-widest">Nenhum edital ativo</p>
                      </div>
                    ) : (
                      biddings.map(bid => (
                        <div key={bid.id} className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-8 hover:border-[#00ffe0]/30 transition-all group">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-[#00ffe0]/10 rounded-3xl flex items-center justify-center text-[#00ffe0] group-hover:scale-110 transition-transform">
                                <Gavel className="w-8 h-8" />
                              </div>
                              <div>
                                <h4 className="text-2xl font-bold mb-1">{bid.title}</h4>
                                <p className="text-xs text-white/40 uppercase tracking-widest">{bid.organ} • {bid.number}</p>
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest ${
                              bid.status === 'participando' ? 'bg-blue-500/20 text-blue-400' :
                              bid.status === 'vencido' ? 'bg-green-500/20 text-green-400' :
                              'bg-white/10 text-white/40'
                            }`}>
                              {bid.status}
                            </div>
                          </div>

                          <div className="relative pt-4">
                            <div className="absolute top-[2.25rem] left-0 right-0 h-0.5 bg-white/5" />
                            <div className="relative flex justify-between">
                              {[
                                { label: 'Análise', status: 'analise' },
                                { label: 'Participação', status: 'participando' },
                                { label: 'Homologação', status: 'homologado' }
                              ].map((step, idx) => {
                                const isActive = bid.status === step.status || 
                                  (step.status === 'analise') ||
                                  (step.status === 'participando' && ['vencido', 'perdido', 'homologado'].includes(bid.status));
                                
                                return (
                                  <div key={idx} className="flex flex-col items-center gap-3 relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                      isActive ? 'bg-[#00ffe0] border-[#00ffe0] text-black shadow-[0_0_20px_rgba(0,255,224,0.4)]' : 'bg-[#0a0a0a] border-white/10 text-white/20'
                                    }`}>
                                      {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[#00ffe0]' : 'text-white/20'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-center">
                    <Package className="w-16 h-16 text-white/5 mx-auto mb-4" />
                    <p className="text-white/20 font-bold uppercase tracking-widest">Módulo em fase de implementação</p>
                    <p className="text-sm text-white/10 mt-2">Consulte seu gerente de contas para mais detalhes</p>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Documentos</h3>
                    <label className="cursor-pointer p-2 bg-[#00ffe0]/10 text-[#00ffe0] rounded-xl hover:bg-[#00ffe0] hover:text-black transition-all">
                      <FileUp className="w-4 h-4" />
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <div className="space-y-4">
                    {documents.length === 0 ? (
                      <p className="text-center py-8 text-white/10 text-xs font-bold uppercase tracking-widest">Nenhum documento</p>
                    ) : (
                      documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              doc.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                              doc.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold truncate max-w-[120px]">{doc.name}</p>
                              <p className="text-[10px] text-white/20 uppercase">{doc.status}</p>
                            </div>
                          </div>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-[#00ffe0] transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Receipt className="w-4 h-4" /> Financeiro
                    </button>
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" /> Pagamentos
                    </button>
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="w-full py-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Cancelar Contrato
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight text-red-500">Solicitar Cancelamento</h2>
              <p className="text-white/40 text-sm mb-8">De acordo com a LGPD, você tem o direito de solicitar a exclusão de seus dados e o encerramento da conta.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Motivo (Opcional)</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Conte-nos por que deseja cancelar..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-red-500 outline-none transition-all h-32"
                  />
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-xs text-red-400 leading-relaxed">
                    <strong>Atenção:</strong> Esta ação é irreversível após o processamento. Todos os seus documentos e históricos serão removidos permanentemente de nossos servidores.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleRequestCancellation}
                    className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
