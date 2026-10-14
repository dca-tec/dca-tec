import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp,
  Target,
  FileCheck, 
  LogOut, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Building2,
  DollarSign,
  X,
  FileUp,
  Gavel,
  Plus,
  History,
  AlertTriangle,
  Package,
  Loader2,
  FileText,
  Copy,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  Lock,
  Sliders,
  Globe2
} from "lucide-react";
import CyberSecurityMonitor from "../components/CyberSecurityMonitor";
import LaunchManager from "../components/LaunchManager";
import RegionManager from "../components/RegionManager";
import BannerManager from "../components/BannerManager";
import { 
  collection, 
  query, 
  where,
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  limit
} from "firebase/firestore";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { db, auth, googleProvider, handleFirestoreError, OperationType } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateTime, formatTime } from "../lib/dateUtils";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  source: string;
  createdAt: Timestamp;
}

interface Acceptance {
  id: string;
  proposalId: string;
  clientName?: string;
  clientEmail?: string;
  cnpj?: string;
  clientCode?: string;
  proposalValue?: string;
  niche?: string;
  acceptedAt: Timestamp;
  status: 'pending' | 'contacted' | 'signed';
  userAgent?: string;
  contractSigned?: boolean;
  contractSignedAt?: Timestamp;
  limits?: { editais: number; pregoes: number; procedimentos: number };
  usage?: { editais: number; pregoes: number; procedimentos: number };
  cancellationRequested?: boolean;
  cancellationReason?: string;
  checklists?: {
    pj: { [key: string]: boolean };
    licitacao: { [key: string]: boolean };
    automacao: { [key: string]: boolean };
    engenharia: { [key: string]: boolean };
  };
  portals?: string[];
  accountManager?: string;
}

interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Timestamp;
  status?: 'pending' | 'approved' | 'rejected';
}

interface Message {
  id: string;
  clientId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp;
}

interface Bidding {
  id: string;
  clientId: string;
  title: string;
  number?: string;
  organ?: string;
  status: 'analise' | 'participando' | 'vencido' | 'perdido' | 'impugnado' | 'homologado';
  department: string;
  actions: string[];
  createdAt: Timestamp;
  notaEmpenhoUrl?: string;
  notaFiscalUrl?: string;
  pagamentoConfirmado?: boolean;
  prazo?: Timestamp;
}

interface AcquisitionProposal {
  id: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  accessCode: string;
  valuation: string;
  terms: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
  structuredData?: any;
  colorPalette?: 'cyan' | 'orange' | 'gold' | 'purple' | 'emerald';
}

export default function Dashboard() {
  console.log("Dashboard Component Rendering...");
  const [user, setUser] = useState<User | null>(null);
  
  // Fast check if user is already authenticated via session or local storage
  const getSavedSessionAdmin = () => {
    try {
      return (
        sessionStorage.getItem("dca_admin_session") === "true" ||
        localStorage.getItem("dca_admin_session") === "true"
      );
    } catch {
      return false;
    }
  };

  const [isSessionAdmin, setIsSessionAdmin] = useState(getSavedSessionAdmin);
  const [loading, setLoading] = useState(() => !getSavedSessionAdmin());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Acceptance[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [biddings, setBiddings] = useState<Bidding[]>([]);
  const [acquisitions, setAcquisitions] = useState<AcquisitionProposal[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'acquisitions' | 'instructions' | 'cybersecurity' | 'launches' | 'banners' | 'regions'>('leads');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Acceptance | null>(null);
  const [clientDetailTab, setClientDetailTab] = useState<'info' | 'documents' | 'biddings' | 'checklist' | 'chat'>('info');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  const [showAcquisitionModal, setShowAcquisitionModal] = useState(false);
  const [isAddingAcquisition, setIsAddingAcquisition] = useState(false);
  const [showAcquisitionSuccess, setShowAcquisitionSuccess] = useState(false);
  const [generatedAcqCode, setGeneratedAcqCode] = useState("");
  const [newAcquisition, setNewAcquisition] = useState<{
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    valuation: string;
    terms: string;
    colorPalette: 'cyan' | 'orange' | 'gold' | 'purple' | 'emerald';
  }>({
    companyName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    valuation: "",
    terms: "",
    colorPalette: "cyan"
  });
  const [isOptimizingIA, setIsOptimizingIA] = useState(false);
  const [structuredProposalData, setStructuredProposalData] = useState<any>(null);
  const [pncpSearchType, setPncpSearchType] = useState<'cnpj' | 'text'>('text');
  const [pncpQuery, setPncpQuery] = useState("");
  const [pncpResults, setPncpResults] = useState<any[]>([]);
  const [isSearchingPncp, setIsSearchingPncp] = useState(false);
  const [selectedPncpItem, setSelectedPncpItem] = useState<any | null>(null);
  const [selectedAcquisitions, setSelectedAcquisitions] = useState<string[]>([]);

  const searchPncp = async () => {
    if (!pncpQuery) {
      alert("Por favor, insira um termo ou CNPJ para busca.");
      return;
    }

    setIsSearchingPncp(true);
    setPncpResults([]);
    setSelectedPncpItem(null);

    try {
      let url = "";
      if (pncpSearchType === 'cnpj') {
        const cleanCnpj = pncpQuery.replace(/\D/g, '');
        if (cleanCnpj.length < 14) {
          alert("CNPJ inválido.");
          setIsSearchingPncp(false);
          return;
        }
        url = `https://pncp.gov.br/api/pncp/v1/contratacoes?cnpj=${cleanCnpj}&pagina=1&tamanhoPagina=15`;
      } else {
        url = `https://pncp.gov.br/api/pncp/v1/contratacoes?termo=${encodeURIComponent(pncpQuery)}&pagina=1&tamanhoPagina=15`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao consultar PNCP");
      const data = await response.json();
      setPncpResults(data.data || []);
    } catch (error) {
      console.error("PNCP Error:", error);
      alert("Erro ao buscar dados no PNCP. Tente novamente mais tarde.");
    } finally {
      setIsSearchingPncp(false);
    }
  };

  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({ 
    name: "", 
    email: "", 
    cnpj: "",
    clientCode: "",
    niche: "licitacoes", 
    value: "" 
  });
  const [newBidding, setNewBidding] = useState({ 
    clientId: "", 
    title: "", 
    number: "", 
    organ: "", 
    status: "analise" as Bidding['status'],
    department: "licitacoes"
  });
  const [genData, setGenData] = useState({ client: "", value: "", niche: "licitacoes" });
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const navigate = useNavigate();

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    clientes: true,
    vertical: false,
    rede: false
  });

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navItemClass = (id: string) => `w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === id ? 'bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/20 shadow-[0_0_20px_rgba(0,255,224,0.1)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`;
  const subItemClass = (id: string) => `w-full flex items-center gap-4 px-10 py-3 rounded-xl transition-all ${activeTab === id ? 'text-[#00ffe0]' : 'text-white/30 hover:text-white'}`;

  const ADMIN_EMAILS = [
    "dca.tec.br@gmail.com"
  ];
  const ADMIN_EMAIL = ADMIN_EMAILS[0];

  const [directMasterKey, setDirectMasterKey] = useState("");
  const [directKeyError, setDirectKeyError] = useState("");

  const isAuthorizedAdmin = isSessionAdmin || Boolean(user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || ""));

  useEffect(() => {
    // If already validated session admin, no need to wait on auth
    if (isSessionAdmin) {
      setLoading(false);
    }

    // Safety timeout to prevent stuck loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed. User:", currentUser?.email);
      setUser(currentUser);
      if (currentUser && ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || "")) {
        try {
          sessionStorage.setItem("dca_admin_session", "true");
          localStorage.setItem("dca_admin_session", "true");
        } catch (e) {}
        setIsSessionAdmin(true);
      }
      setLoading(false);
      clearTimeout(timer);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [isSessionAdmin]);

  useEffect(() => {
    if (!isAuthorizedAdmin) return;

    // Check if user is authenticated with Firebase Auth
    const isFirebaseAuthAdmin = Boolean(user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || ""));

    if (!isFirebaseAuthAdmin) {
      // In master passcode session without Firebase Auth user, load cached data from localStorage
      // to avoid unauthenticated queries that cause PERMISSION_DENIED and Firestore ca9 crashes
      try {
        const cachedLeads = localStorage.getItem("dca_cached_leads");
        if (cachedLeads) setLeads(JSON.parse(cachedLeads));
        const cachedClients = localStorage.getItem("dca_cached_clients");
        if (cachedClients) setClients(JSON.parse(cachedClients));
        const cachedBiddings = localStorage.getItem("dca_cached_biddings");
        if (cachedBiddings) setBiddings(JSON.parse(cachedBiddings));
        const cachedAcquisitions = localStorage.getItem("dca_cached_acquisitions");
        if (cachedAcquisitions) setAcquisitions(JSON.parse(cachedAcquisitions));
      } catch (e) {}
      return;
    }

    let unsubLeads = () => {};
    let unsubAcceptances = () => {};
    let unsubDocs = () => {};
    let unsubBiddings = () => {};
    let unsubAcquisitions = () => {};

    try {
      const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      unsubLeads = onSnapshot(qLeads, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
        setLeads(data);
        try { localStorage.setItem("dca_cached_leads", JSON.stringify(data)); } catch (e) {}
      }, (err) => {
        console.warn("Leads fetch error:", err.message);
      });

      const qAcceptances = query(collection(db, "acceptances"), orderBy("acceptedAt", "desc"));
      unsubAcceptances = onSnapshot(qAcceptances, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acceptance));
        setClients(data);
        try { localStorage.setItem("dca_cached_clients", JSON.stringify(data)); } catch (e) {}
      }, (err) => {
        console.warn("Acceptances fetch error:", err.message);
      });

      const qDocs = query(collection(db, "documents"), orderBy("uploadedAt", "desc"));
      unsubDocs = onSnapshot(qDocs, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientDocument));
        setDocuments(data);
      }, (err) => {
        console.warn("Documents fetch error:", err.message);
      });

      const qBiddings = query(collection(db, "biddings"), orderBy("createdAt", "desc"));
      unsubBiddings = onSnapshot(qBiddings, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bidding));
        setBiddings(data);
        try { localStorage.setItem("dca_cached_biddings", JSON.stringify(data)); } catch (e) {}
      }, (err) => {
        console.warn("Biddings fetch error:", err.message);
      });

      const qAcquisitions = query(
        collection(db, "acquisitions"), 
        orderBy("createdAt", "desc"),
        limit(50)
      );
      unsubAcquisitions = onSnapshot(qAcquisitions, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcquisitionProposal));
        setAcquisitions(data);
        try { localStorage.setItem("dca_cached_acquisitions", JSON.stringify(data)); } catch (e) {}
      }, (err) => {
        console.warn("Acquisitions fetch error:", err.message);
      });
    } catch (err) {
      console.warn("Error setting up listeners:", err);
    }

    return () => {
      try { unsubLeads(); } catch (e) {}
      try { unsubAcceptances(); } catch (e) {}
      try { unsubDocs(); } catch (e) {}
      try { unsubBiddings(); } catch (e) {}
      try { unsubAcquisitions(); } catch (e) {}
    };
  }, [isAuthorizedAdmin, user]);

  useEffect(() => {
    if (!selectedClient || !user) {
      setMessages([]);
      return;
    }

    const qMessages = query(
      collection(db, "messages"),
      where("clientId", "==", selectedClient.id),
      orderBy("createdAt", "asc")
    );

    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "messages"));

    return () => {
      try { unsubMessages(); } catch (e) {}
    };
  }, [selectedClient, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;

    try {
      await addDoc(collection(db, "messages"), {
        clientId: selectedClient.id,
        senderId: user?.uid || "admin_master",
        senderName: user?.displayName || "DCA ADMIN",
        text: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "messages");
    }
  };

  const handleUpdateChecklist = async (type: 'pj' | 'licitacao' | 'automacao' | 'engenharia', item: string, value: boolean) => {
    if (!selectedClient) return;

    const newChecklists = {
      ...selectedClient.checklists,
      [type]: {
        ...(selectedClient.checklists?.[type] || {}),
        [item]: value
      }
    };

    try {
      await updateDoc(doc(db, "acceptances", selectedClient.id), {
        checklists: newChecklists
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "acceptances");
    }
  };

  const handleApproveDocument = async (docId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "documents", docId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "documents");
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert("Por favor, preencha o nome e o e-mail do cliente.");
      return;
    }
    try {
      const finalCode = newClient.clientCode || `DCA-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEmail = newClient.email.trim().toLowerCase();
      
      await addDoc(collection(db, "acceptances"), {
        clientName: newClient.name,
        clientEmail: cleanEmail,
        cnpj: newClient.cnpj,
        clientCode: finalCode,
        niche: newClient.niche,
        proposalValue: newClient.value,
        proposalId: `MANUAL_${newClient.niche.toUpperCase()}`,
        acceptedAt: serverTimestamp(),
        status: 'pending',
        contractSigned: false,
        limits: { editais: 10, pregoes: 10, procedimentos: 10 },
        usage: { editais: 0, pregoes: 0, procedimentos: 0 }
      });
      setShowClientModal(false);
      setNewClient({ name: "", email: "", cnpj: "", clientCode: "", niche: "licitacoes", value: "" });
      alert("Cliente registrado com sucesso!");
    } catch (error) {
      console.error("Error adding client:", error);
      handleFirestoreError(error, OperationType.CREATE, "acceptances");
    }
  };

  const handleUpdateClientEmail = async (id: string, newEmail: string) => {
    try {
      await updateDoc(doc(db, "acceptances", id), { clientEmail: newEmail });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "acceptances");
    }
  };

  const handleGenerateClientCode = async (clientId: string) => {
    const newCode = `DCA-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await updateDoc(doc(db, "acceptances", clientId), { clientCode: newCode });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "acceptances");
    }
  };

  const handleAddBidding = async () => {
    if (!newBidding.clientId || !newBidding.title) return;
    try {
      await addDoc(collection(db, "biddings"), {
        ...newBidding,
        actions: ["Edital registrado no sistema"],
        pagamentoConfirmado: false,
        createdAt: serverTimestamp()
      });
      
      // Update usage in acceptance
      const acceptance = clients.find(a => a.id === newBidding.clientId);
      if (acceptance) {
        const newUsage = { 
          ...acceptance.usage, 
          editais: (acceptance.usage?.editais || 0) + 1 
        };
        await updateDoc(doc(db, "acceptances", acceptance.id), { usage: newUsage });
      }

      setShowBiddingModal(false);
      setPncpQuery("");
      setPncpResults([]);
      setSelectedPncpItem(null);
      setNewBidding({ clientId: "", title: "", number: "", organ: "", status: "analise", department: "licitacoes" });
    } catch (error) {
      console.error("Error adding bidding:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência!");
  };

  const handleOptimizeWithAI = async () => {
    if (!newAcquisition.terms && !newAcquisition.valuation) {
      alert("Por favor, preencha pelo menos os termos ou o valuation para que a IA possa organizar.");
      return;
    }

    setIsOptimizingIA(true);
    try {
      const response = await fetch("/api/optimize-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: newAcquisition.companyName,
          valuation: newAcquisition.valuation,
          terms: newAcquisition.terms
        })
      });

      const responseText = await response.text();
      let structuredData;
      
      try {
        structuredData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        throw new Error("O servidor retornou uma resposta inválida. Tente novamente.");
      }

      if (!response.ok) {
        throw new Error(structuredData?.error || "Falha ao processar com IA");
      }

      if (!structuredData) {
        throw new Error("A IA não retornou dados estruturados.");
      }
      
      console.log("IA Optimized Data:", structuredData);
      setStructuredProposalData(structuredData);
      
      // Update the fields if AI found better versions
      setNewAcquisition(prev => ({
        ...prev,
        valuation: structuredData.valuationSummary || prev.valuation,
        terms: structuredData.installments || prev.terms
      }));

      alert("Proposta organizada com sucesso pela IA!");
    } catch (error: any) {
      console.error("AI Optimization Error:", error);
      alert(`Erro ao otimizar com IA: ${error.message || "Tente preencher manualmente"}`);
    } finally {
      setIsOptimizingIA(false);
    }
  };

  const handleAddAcquisition = async () => {
    console.log("Iniciando criação de proposta M&A:", newAcquisition);
    if (!newAcquisition.companyName || !newAcquisition.ownerEmail) {
      alert("Erro: O nome da empresa e o e-mail do proprietário são obrigatórios.");
      return;
    }

    setIsAddingAcquisition(true);
    try {
      let finalStructuredData = structuredProposalData;

      // Auto-optimize with AI if terms are present but AI hasn't run yet
      if (!finalStructuredData && newAcquisition.terms.length > 20) {
        console.log("Auto-optimizing with AI before saving...");
        
        try {
          const response = await fetch("/api/optimize-proposal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: newAcquisition.companyName,
              valuation: newAcquisition.valuation,
              terms: newAcquisition.terms
            })
          });

          const responseText = await response.text();
          let aiResult;
          
          try {
            aiResult = responseText ? JSON.parse(responseText) : null;
          } catch (e) {
            console.error("Failed to parse AI JSON:", responseText);
          }

          if (response.ok && aiResult) {
            finalStructuredData = aiResult;
            setStructuredProposalData(finalStructuredData);
          } else {
            console.warn("AI Optimization non-critical failure, saving raw proposal instead.");
          }
        } catch (aiErr) {
          console.error("Critical AI Optimization Error (Fallback used):", aiErr);
          // Don't throw - continue with raw saving
        }
      }

      const code = `DCA-MA-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const acquisitionData = {
        ...newAcquisition,
        accessCode: code,
        status: 'sent',
        createdAt: serverTimestamp(),
        structuredData: finalStructuredData
      };

      await addDoc(collection(db, "acquisitions"), acquisitionData);
      setGeneratedAcqCode(code);
      setShowAcquisitionSuccess(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowAcquisitionModal(false);
        setShowAcquisitionSuccess(false);
        setNewAcquisition({
          companyName: "",
          ownerName: "",
          ownerEmail: "",
          ownerPhone: "",
          valuation: "",
          terms: "",
          colorPalette: "cyan"
        });
        setStructuredProposalData(null);
      }, 3000);

    } catch (error) {
      console.error("Falha ao salvar proposta M&A:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      if (errorMessage.includes("permission-denied")) {
        alert("Erro: Permissão negada. Certifique-se de que você está logado com o e-mail administrador (dca.tec.br@gmail.com).");
      } else {
        alert(`Houve um erro técnico ao salvar a proposta: ${errorMessage}. Tente recarregar a página.`);
      }
    } finally {
      setIsAddingAcquisition(false);
    }
  };

  const handleRegenerateAI = async (proposalId: string) => {
    const prop = acquisitions.find(a => a.id === proposalId);
    if (!prop) return;

    setIsOptimizingIA(true);
    try {
      const response = await fetch("/api/optimize-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: prop.companyName,
          valuation: prop.valuation,
          terms: prop.terms
        })
      });

      const responseText = await response.text();
      let aiResult;
      try {
        aiResult = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error("Failed to parse AI response:", responseText);
      }

      if (response.ok && aiResult) {
        await updateDoc(doc(db, "acquisitions", proposalId), {
          structuredData: aiResult
        });
        alert("IA processada com sucesso! A proposta foi atualizada.");
      } else {
        throw new Error("A IA não retornou uma resposta válida.");
      }
    } catch (error: any) {
      console.error("Regeneration Error:", error);
      alert(`Erro ao reprocessar IA: ${error.message}`);
    } finally {
      setIsOptimizingIA(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("dca_admin_session");
      localStorage.removeItem("dca_admin_session");
      setIsSessionAdmin(false);
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Deseja realmente excluir este lead?")) return;
    try {
      await deleteDoc(doc(db, "leads", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "leads");
    }
  };

  const handleDeleteAcquisition = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta proposta de M&A? Esta ação é irreversível.")) return;
    try {
      await deleteDoc(doc(db, "acquisitions", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "acquisitions");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "acceptances", id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "acceptances");
    }
  };

  const handleDeleteAcceptance = async (id: string) => {
    if (!confirm("Deseja realmente excluir este aceite? Isso removerá o acesso do cliente ao portal.")) return;
    try {
      await deleteDoc(doc(db, "acceptances", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "acceptances");
    }
  };

  const handleLogGovUsage = async (docId: string, docName: string, clientId: string) => {
    try {
      const client = clients.find(a => a.id === clientId);
      await addDoc(collection(db, "compliance_logs"), {
        docId,
        docName,
        clientId,
        clientName: client?.clientName || "Desconhecido",
        action: "Exportação para Compras.gov.br",
        performedBy: user?.email,
        timestamp: serverTimestamp(),
        status: "success"
      });
      alert(`Uso do documento "${docName}" registrado com sucesso para fins de compliance.`);
    } catch (error) {
      console.error("Error logging gov usage:", error);
    }
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === 'leads' ? leads : activeTab === 'acquisitions' ? acquisitions : clients;
    if (dataToExport.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'leads') {
      csvContent += "Nome,Email,Telefone,Empresa/CNPJ,Assunto,Origem,Data\n";
      leads.forEach(l => {
        const date = formatDateTime(l.createdAt);
        csvContent += `"${l.name}","${l.email}","${l.phone || ""}","${l.company || ""}","${l.subject || ""}","${l.source}","${date}"\n`;
      });
    } else if (activeTab === 'acquisitions') {
      const items = selectedAcquisitions.length > 0 
        ? acquisitions.filter(a => selectedAcquisitions.includes(a.id)) 
        : acquisitions;
      
      csvContent += "Empresa,Proprietario,Email,Telefone,Valuation,Codigo,Status,Data,Termos\n";
      items.forEach(a => {
        const date = formatDateTime(a.createdAt);
        csvContent += `"${a.companyName}","${a.ownerName}","${a.ownerEmail}","${a.ownerPhone || ""}","${a.valuation}","${a.accessCode}","${a.status}","${date}","${a.terms.replace(/"/g, '""')}"\n`;
      });
    } else {
      csvContent += "Proposta,Cliente,Email,Valor,Portal,Status,Data\n";
      clients.forEach(a => {
        const date = formatDateTime(a.acceptedAt);
        csvContent += `"${a.proposalId}","${a.clientName || ""}","${a.clientEmail || ""}","${a.proposalValue || ""}","${a.niche || ""}","${a.status}","${date}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dca_tec_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateLink = () => {
    console.log("Generating link with data:", genData);
    if (!genData.client) {
      alert("Por favor, informe o nome do cliente.");
      return;
    }
    try {
      const baseUrl = window.location.origin;
      const params = new URLSearchParams();
      params.append("cliente", genData.client);
      if (genData.value) params.append("valor", genData.value);
      
      const link = `${baseUrl}/portal/${genData.niche}?${params.toString()}`;
      setGeneratedLink(link);
      alert("Link mágico gerado com sucesso! Veja abaixo.");
    } catch (err) {
      console.error("Generator Error:", err);
      alert("Erro ao gerar link.");
    }
  };

  const handleSendProposalEmail = async (email: string, clientName: string) => {
    if (!generatedLink) return;
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          email: email,
          subject: "Proposta Comercial - Grupo DCA TEC",
          message: `Olá ${clientName}, segue o link para acessar sua proposta personalizada e o portal de serviços: ${generatedLink}`,
          source: 'Admin Dashboard (Proposta)'
        })
      });

      if (response.ok) {
        alert("Proposta enviada com sucesso para o e-mail do cliente!");
      } else {
        throw new Error("Falha ao enviar e-mail");
      }
    } catch (error) {
      console.error("Error sending proposal email:", error);
      alert("Erro ao enviar e-mail. Verifique as configurações de SMTP.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 border-4 border-[#00ffe0] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#00ffe0]/70 text-xs uppercase tracking-widest font-bold">Verificando Credenciais...</p>
          <button
            type="button"
            onClick={() => setLoading(false)}
            className="mt-2 text-xs text-white/50 hover:text-[#00ffe0] underline transition-colors"
          >
            Acessar com Senha Mestra ou Conta Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    console.log("Access Denied for user:", user?.email, "isSessionAdmin:", isSessionAdmin);

    const handleDirectMasterUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      const validPasscodes = [
        "dca2026admin",
        "DCATEC2026#",
        "dca-admin-2026",
        import.meta.env.VITE_ADMIN_PASSKEY
      ].filter(Boolean);

      if (validPasscodes.includes(directMasterKey.trim())) {
        try {
          sessionStorage.setItem("dca_admin_session", "true");
          localStorage.setItem("dca_admin_session", "true");
        } catch (e) {}
        setIsSessionAdmin(true);
        setDirectKeyError("");
      } else {
        setDirectKeyError("Senha mestra incorreta.");
      }
    };

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 uppercase tracking-widest">Acesso Restrito</h1>
        <p className="text-white/40 mb-8 max-w-md">
          Este painel é exclusivo para administradores do Grupo DCA TEC ({ADMIN_EMAIL}). 
          {user ? ` Sua conta atual (${user.email}) não possui permissão de administrador.` : ' Por favor, conecte-se com sua conta autorizada ou utilize a Senha Mestra.'}
        </p>

        {/* Direct Master Passcode Box */}
        <div className="w-full max-w-sm mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00ffe0] mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Acesso Mestre Imediato
          </p>
          <form onSubmit={handleDirectMasterUnlock} className="space-y-3">
            <input 
              type="password"
              placeholder="Digite a Senha Mestra DCA TEC"
              value={directMasterKey}
              onChange={(e) => setDirectMasterKey(e.target.value)}
              className="w-full px-4 py-3 bg-black/80 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00ffe0] transition-colors"
            />
            {directKeyError && (
              <p className="text-xs text-red-400">{directKeyError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-[#00ffe0] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
            >
              Desbloquear Painel
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleLogin}
            className="btn-gradient px-8 py-3.5 rounded-2xl text-black font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform"
          >
            {user ? 'Trocar de Conta Google' : 'Entrar com Google'}
          </button>
          
          {user && (
            <button 
              onClick={handleLogout}
              className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              Sair
            </button>
          )}

          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3.5 rounded-2xl bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] font-bold flex items-center justify-center gap-3 hover:bg-[#00ffe0]/20 transition-all"
          >
            Atualizar Status
          </button>
        </div>
        
        <button 
          onClick={() => navigate("/")}
          className="mt-12 text-white/30 hover:text-white flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Site
        </button>
      </div>
    );
  }

  const filteredLeads = (leads || []).filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = (clients || []).filter(a => 
    a.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.proposalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cnpj?.includes(searchTerm) ||
    a.clientCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use this to hide scrollbar but keep functionality
  const sidebarNavStyle = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00ffe0] selection:text-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-black border-r border-white/5 z-50 hidden lg:flex flex-col p-6 overflow-hidden">
        <div className="text-2xl font-black tracking-[6px] hero-gradient-text mb-12 shrink-0 px-4">DCA ADMIN</div>
        
        <nav 
          className="flex-1 space-y-2 overflow-y-auto pr-2 no-scrollbar" 
        >
          <button onClick={() => setActiveTab('leads')} className={navItemClass('leads')}>
            <Users className="w-5 h-5 shadow-sm" />
            <span className="font-bold text-xs uppercase tracking-[2px]">Leads & Contatos</span>
            <span className="ml-auto bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono">{leads.length}</span>
          </button>

          <button onClick={() => setActiveTab('acquisitions')} className={navItemClass('acquisitions')}>
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-[2px]">M&A Strategic Hub</span>
          </button>

          <button onClick={() => setActiveTab('cybersecurity')} className={navItemClass('cybersecurity')}>
            <ShieldCheck className="w-5 h-5 text-[#00ffe0]" />
            <span className="font-bold text-xs uppercase tracking-[2px]">Cybersecurity & IA</span>
            <div className="ml-auto w-2 h-2 bg-[#00ffe0] rounded-full animate-pulse" />
          </button>

          <button onClick={() => setActiveTab('launches')} className={navItemClass('launches')}>
            <Sliders className="w-5 h-5 text-[#00ffe0]" />
            <span className="font-bold text-xs uppercase tracking-[2px]">Lançamentos & Blocos</span>
            <span className="ml-auto bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/20 px-2 py-0.5 rounded text-[10px] font-mono">
              Marketing
            </span>
          </button>

          <button onClick={() => setActiveTab('banners')} className={navItemClass('banners')}>
            <Layers className="w-5 h-5 text-[#00ffe0]" />
            <span className="font-bold text-xs uppercase tracking-[2px]">Banners do Topo</span>
            <span className="ml-auto bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/20 px-2 py-0.5 rounded text-[10px] font-mono">
              Hero
            </span>
          </button>

          <button onClick={() => setActiveTab('regions')} className={navItemClass('regions')}>
            <Globe2 className="w-5 h-5 text-[#00ffe0]" />
            <span className="font-bold text-xs uppercase tracking-[2px]">Regiões Atendidas</span>
            <span className="ml-auto bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/20 px-2 py-0.5 rounded text-[10px] font-mono">
              Hubs
            </span>
          </button>

          {/* Collapsible Group: Clientes */}
          <div className="pt-4">
            <button 
              onClick={() => toggleSubmenu('clientes')}
              className="w-full flex items-center justify-between px-6 py-3 text-[10px] font-black uppercase tracking-[3px] text-white/20 hover:text-white/40 transition-colors"
            >
              CLIENTES DCA TEC
              <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${openSubmenus.clientes ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {openSubmenus.clientes && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1 mt-1"
                >
                  <button onClick={() => setActiveTab('clients')} className={subItemClass('clients')}>
                    <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'clients' ? 'bg-[#00ffe0]' : 'bg-white/10'}`} />
                    <span className="text-xs font-bold uppercase tracking-widest">Consultoria Integrada</span>
                  </button>
                  <button className={subItemClass('consultoria_especializada')}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Consultoria Especializada</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsible Group: Vertical */}
          <div className="pt-2">
            <button 
              onClick={() => toggleSubmenu('vertical')}
              className="w-full flex items-center justify-between px-6 py-3 text-[10px] font-black uppercase tracking-[3px] text-white/20 hover:text-white/40 transition-colors"
            >
              VERTICAL CLIENTES
              <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${openSubmenus.vertical ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {openSubmenus.vertical && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1 mt-1"
                >
                  {['Aplicativos', 'Projetos', 'Publicidade'].map((v) => (
                    <button key={v} className={subItemClass(v.toLowerCase())}>
                      <Package className="w-4 h-4 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest">{v}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsible Group: Rede */}
          <div className="pt-2">
            <button 
              onClick={() => toggleSubmenu('rede')}
              className="w-full flex items-center justify-between px-6 py-3 text-[10px] font-black uppercase tracking-[3px] text-white/20 hover:text-white/40 transition-colors"
            >
              REDE & EXPANSÃO
              <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${openSubmenus.rede ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {openSubmenus.rede && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1 mt-1"
                >
                  {['Parceiros', 'Fornecedores', 'Investidores', 'Franquias', 'Filiais', 'Holding'].map((v) => (
                    <button key={v} className={subItemClass(v.toLowerCase())}>
                      <Building2 className="w-4 h-4 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest">{v}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setActiveTab('instructions')} className={navItemClass('instructions')}>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-[2px]">Instruções</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6">
            {user?.photoURL ? (
              <img src={user?.photoURL} alt={user?.displayName || "Admin"} className="w-10 h-10 rounded-full border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#00ffe0]/10 border border-[#00ffe0]/30 flex items-center justify-center text-[#00ffe0] font-black text-xs shrink-0">
                DCA
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.displayName || "Administrador DCA"}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email || "Acesso Mestre Direto"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2 uppercase tracking-tight">
              {activeTab === 'leads' ? 'Gestão de Leads & Contatos' : 
               activeTab === 'clients' ? 'Consultoria Integrada' : 
               activeTab === 'acquisitions' ? 'M&A Strategic Hub' : 
               activeTab === 'instructions' ? 'Instruções' : 
               activeTab === 'cybersecurity' ? 'Monitor de Cybersecurity & LGPD' :
               activeTab === 'launches' ? 'Estratégia de Lançamento & Visibilidade' :
               activeTab === 'banners' ? 'Gestão de Banners do Topo' :
               activeTab === 'regions' ? 'Gestão de Regiões Atendidas & Hubs' :
               activeTab === 'consultoria_especializada' ? 'Consultoria Especializada' :
               'Área em Desenvolvimento'}
            </h1>
            <p className="text-white/40 text-sm">
               {activeTab === 'leads' || activeTab === 'clients' || activeTab === 'acquisitions' 
                 ? 'Acompanhe as interações em tempo real.'
                 : activeTab === 'cybersecurity' ? 'Proteção Zero Trust e Auditoria LGPD Ativa.' 
                 : activeTab === 'launches' ? 'Controle sequencial de blocos da página inicial e projetos do ecossistema.'
                 : activeTab === 'banners' ? 'Ative, inative, edite ou crie novos banners do carrossel principal da página inicial.'
                 : activeTab === 'regions' ? 'Ative, desative, abra novas unidades ou modifique os endereços de contato da Presença Global.' :
                 'Esta seção está sendo preparada para o próximo rollout.'}
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto relative z-50">
            {activeTab === 'clients' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Abrindo modal de novo cliente...");
                  const code = `DCA-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
                  setNewClient(prev => ({ ...prev, clientCode: code }));
                  setShowClientModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00ffe0] text-black rounded-xl hover:scale-105 transition-transform text-sm font-bold uppercase tracking-widest cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Novo Cliente
              </button>
            )}

            {activeTab === 'acquisitions' && (
              <button 
                onClick={() => {
                  setStructuredProposalData(null);
                  setShowAcquisitionModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#00ffe0] text-black rounded-xl hover:scale-105 transition-transform text-sm font-bold uppercase tracking-widest cursor-pointer"
              >
                <Target className="w-4 h-4" /> Criar Intenção M&A
              </button>
            )}
            
            <button 
              onClick={() => {
                alert("Acionando Gerador de Link...");
                setShowGenerator(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] rounded-xl hover:bg-[#00ffe0]/20 transition-all text-sm font-bold uppercase tracking-widest cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> Link de Vendas
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>

            {activeTab === 'acquisitions' && (
              <button 
                onClick={() => {
                  const items = selectedAcquisitions.length > 0 
                    ? acquisitions.filter(a => selectedAcquisitions.includes(a.id)) 
                    : acquisitions;
                  const data = JSON.stringify(items, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `archive_ma_${selectedAcquisitions.length > 0 ? 'selected_' : 'all_'}${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  alert(`${items.length} proposta(s) exportada(s) para auditoria. Nota: Para salvar os PDFs, você deve entrar em cada portal e gerar o documento.`);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all text-sm font-bold uppercase tracking-widest"
                title="Exportar Seleção para Auditoria"
              >
                <History className="w-4 h-4" /> Arquivar {selectedAcquisitions.length > 0 ? `(${selectedAcquisitions.length})` : ''}
              </button>
            )}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-[#00ffe0] outline-none transition-all text-sm"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {activeTab === 'acquisitions' ? (
            <>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Propostas M&A</p>
                <div className="text-4xl font-bold">{acquisitions.length}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Aceitas / Visualizadas</p>
                <div className="text-4xl font-bold flex items-baseline gap-2">
                  <span className="text-green-400">{acquisitions.filter(a => a.status === 'accepted').length}</span>
                  <span className="text-sm text-white/20">/</span>
                  <span className="text-[#00ffe0]">{acquisitions.filter(a => a.status === 'viewed').length}</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Aguardando (Sent)</p>
                <div className="text-4xl font-bold text-white/60">
                  {acquisitions.filter(a => a.status === 'sent').length}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Total de Leads</p>
                <div className="text-4xl font-bold">{leads.length}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Clientes Ativos</p>
                <div className="text-4xl font-bold">{clients.length}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Conversão</p>
                <div className="text-4xl font-bold text-[#00ffe0]">
                  {leads.length > 0 ? ((clients.length / leads.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* Data Table / Cards */}
        <div className="space-y-4">
          {activeTab === 'instructions' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-10 rounded-[40px]">
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight text-[#00ffe0]">Manual do Gerente de Contas</h3>
                <div className="space-y-6 text-white/60 leading-relaxed">
                  <p>Bem-vindo à área de gestão da DCA TEC. Como gerente de contas, você é responsável por guiar o cliente em todas as etapas do processo.</p>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#00ffe0]/10 flex items-center justify-center text-[#00ffe0] font-bold shrink-0">1</div>
                      <p><strong className="text-white">Onboarding:</strong> Verifique se o cliente assinou o contrato e se o Certificado Digital A1 já foi coletado.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#00ffe0]/10 flex items-center justify-center text-[#00ffe0] font-bold shrink-0">2</div>
                      <p><strong className="text-white">Documentação:</strong> Revise todos os documentos enviados pelo cliente. Somente aprove se estiverem dentro da validade.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#00ffe0]/10 flex items-center justify-center text-[#00ffe0] font-bold shrink-0">3</div>
                      <p><strong className="text-white">Licitações:</strong> Utilize a busca PNCP para encontrar editais. Ao participar, atualize o status e o histórico em tempo real.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-10 rounded-[40px]">
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-tight text-[#00ffe0]">Checklist Geral PJ</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    "Proposta para cliente PJ enviada",
                    "Contrato cliente PJ assinado",
                    "Certificado digital A1 validado",
                    "Procuração PJ para representação",
                    "Checklist de documentos completo",
                    "Procedimentos de conformidade realizados"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-[#00ffe0]" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'acquisitions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <button 
                onClick={() => {
                  if (selectedAcquisitions.length === acquisitions.length) {
                    setSelectedAcquisitions([]);
                  } else {
                    setSelectedAcquisitions(acquisitions.map(a => a.id));
                  }
                }}
                className="text-[10px] uppercase tracking-widest font-black text-white/40 hover:text-[#00ffe0] transition-colors"
              >
                {selectedAcquisitions.length === acquisitions.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              {selectedAcquisitions.length > 0 && (
                <button 
                  onClick={async () => {
                    if (confirm(`Deseja excluir as ${selectedAcquisitions.length} propostas selecionadas?`)) {
                      for (const id of selectedAcquisitions) {
                        await deleteDoc(doc(db, "acquisitions", id));
                      }
                      setSelectedAcquisitions([]);
                    }
                  }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-red-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Excluir Selecionados
                </button>
              )}
            </div>
            {acquisitions.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                <Target className="w-16 h-16 text-white/5 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Nenhuma Proposta Ativa</h3>
                <p className="text-white/20 text-sm max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                  Comece captando novas empresas para o ecossistema DCA.
                </p>
                <button 
                  onClick={() => {
                setStructuredProposalData(null); // Clear previous AI data
                setShowAcquisitionModal(true);
              }}
                  className="mt-8 px-8 py-4 bg-[#00ffe0] text-black font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs"
                >
                  Criar Primeira Proposta
                </button>
              </div>
            ) : (
              acquisitions.map((acq) => (
                <motion.div 
                  layout
                  key={acq.id}
                  className={`bg-white/5 border p-8 rounded-[32px] hover:border-[#00ffe0]/30 transition-all group flex gap-6 ${
                    selectedAcquisitions.includes(acq.id) ? 'border-[#00ffe0]/40 bg-[#00ffe0]/5' : 'border-white/10'
                  }`}
                >
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setSelectedAcquisitions(prev => 
                          prev.includes(acq.id) ? prev.filter(id => id !== acq.id) : [...prev, acq.id]
                        );
                      }}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedAcquisitions.includes(acq.id) ? 'bg-[#00ffe0] border-[#00ffe0] text-black' : 'border-white/10 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00ffe0]/10 rounded-2xl flex items-center justify-center text-[#00ffe0]">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight">{acq.companyName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Código: <span className="text-white/80">{acq.accessCode}</span></span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              acq.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 
                              acq.status === 'viewed' ? 'bg-[#00ffe0]/10 text-[#00ffe0]' : 'bg-white/10 text-white/40'
                            }`}>
                              {acq.status === 'sent' ? 'Enviada' : 
                               acq.status === 'viewed' ? 'Visualizada' : 
                               acq.status === 'accepted' ? 'Aceita' : 'Recusada'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Proprietário</p>
                          <p className="text-sm font-bold">{acq.ownerName}</p>
                          <p className="text-xs text-white/40">{acq.ownerEmail}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Valuation</p>
                          <p className="text-sm font-bold text-[#00ffe0] tracking-tight">{acq.valuation}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Criada em</p>
                          <p className="text-xs text-white/60 font-medium">
                            {formatDate(acq.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <div className="flex gap-2">
                        {!acq.structuredData && (
                          <button 
                            onClick={() => handleRegenerateAI(acq.id)}
                            disabled={isOptimizingIA}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] rounded-xl hover:bg-[#00ffe0] hover:text-black transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {isOptimizingIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Reprocessar IA
                          </button>
                        )}
                        <button 
                          onClick={() => window.open(`/ma/${acq.companyName.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          <ExternalLink className="w-4 h-4" /> Visualizar
                        </button>
                        <button 
                          onClick={() => handleDeleteAcquisition(acq.id)}
                          className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          title="Excluir Proposta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          const link = `${window.location.origin}/ma/${acq.companyName.toLowerCase().replace(/\s+/g, '-')}`;
                          const message = `Olá ${acq.ownerName}, segue o link do nosso portal estratégico de aquisição para a ${acq.companyName}:\n\n${link}\n\nCódigo de Acesso: ${acq.accessCode}`;
                          
                          if (acq.ownerPhone) {
                            const cleanPhone = acq.ownerPhone.replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
                          } else {
                            navigator.clipboard.writeText(message);
                            alert("Link e código copiados para o WhatsApp! (Telefone não cadastrado)");
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] rounded-xl hover:bg-[#00ffe0]/20 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Phone className="w-4 h-4" /> Enviar p/ WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leads' && filteredLeads.map((lead) => (
            <motion.div 
              layout
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.08] transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold">{lead.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] uppercase tracking-widest text-white/60">
                      {lead.source}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#00ffe0]" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#00ffe0]" />
                      {lead.company || lead.source === 'tributaria' ? 'CNPJ não inf.' : 'Empresa não inf.'}
                      {lead.company && <span className="text-white">{lead.company}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#00ffe0]" />
                      {formatDateTime(lead.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-white/50">
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#00ffe0]" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.subject && (
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#00ffe0]" />
                        Assunto: <span className="text-white">{lead.subject}</span>
                      </div>
                    )}
                    {lead.service && (
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#00ffe0]" />
                        Serviço: <span className="text-white uppercase tracking-tighter font-bold">{lead.service}</span>
                      </div>
                    )}
                  </div>

                  {lead.message && (
                    <div className="p-4 bg-black/40 rounded-2xl text-sm text-white/70 italic border border-white/5">
                      "{lead.message}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 relative z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Preparando proposta para ${lead.name || lead.company}`);
                      setGenData({ ...genData, client: lead.name || lead.company || "" });
                      setShowGenerator(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00ffe0]/10 border border-[#00ffe0]/20 text-[#00ffe0] rounded-xl hover:bg-[#00ffe0] hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                    title="Gerar Proposta para este Lead"
                  >
                    <FileCheck className="w-4 h-4" /> Gerar Proposta
                  </button>
                  <button 
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <a 
                    href={`mailto:${lead.email}`}
                    className="p-3 rounded-xl bg-[#00ffe0]/10 text-[#00ffe0] hover:bg-[#00ffe0] hover:text-black transition-all"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}

          {activeTab === 'clients' && filteredClients.map((acc) => (
            <motion.div 
              layout
              key={acc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedClient(acc)}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.08] transition-all group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-[#00ffe0]">
                      {acc.clientName || acc.proposalId}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      acc.status === 'signed' ? 'bg-green-500/20 text-green-400' : 
                      acc.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {acc.status === 'signed' ? 'Assinado' : acc.status === 'contacted' ? 'Em Contato' : 'Pendente'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#00ffe0]" />
                      {acc.cnpj || 'CNPJ não informado'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#00ffe0]" />
                      <span className="text-white/70">{acc.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#00ffe0]" />
                      {formatDateTime(acc.acceptedAt)}
                    </div>
                    {acc.cnpj && (
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#00ffe0]" />
                        CNPJ: <span className="text-white">{acc.cnpj}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#00ffe0]" />
                      Código: {acc.clientCode ? (
                        <span className="text-white uppercase">{acc.clientCode}</span>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateClientCode(acc.id);
                          }}
                          className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2"
                        >
                          Gerar Código
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleDeleteAcceptance(acc.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir Aceite"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <select 
                    value={acc.status}
                    onChange={(e) => handleUpdateStatus(acc.id, e.target.value)}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#00ffe0] transition-all"
                  >
                    <option value="pending">Pendente</option>
                    <option value="contacted">Em Contato</option>
                    <option value="signed">Assinado</option>
                  </select>
                  <button className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {activeTab === 'clients' && filteredClients.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px]">
              <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-bold uppercase tracking-widest text-sm">Nenhum cliente encontrado</p>
            </div>
          )}

          {activeTab === 'cybersecurity' && <CyberSecurityMonitor />}
          {activeTab === 'launches' && <LaunchManager />}
          {activeTab === 'banners' && <BannerManager />}
          {activeTab === 'regions' && <RegionManager />}
        </div>
      </main>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-10 border-b border-white/5 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl font-bold uppercase tracking-tight">{selectedClient.clientName || 'Cliente'}</h2>
                    {selectedClient.clientCode ? (
                      <span className="px-3 py-1 bg-[#00ffe0]/10 text-[#00ffe0] border border-[#00ffe0]/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {selectedClient.clientCode}
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleGenerateClientCode(selectedClient.id)}
                        className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
                      >
                        Gerar Código
                      </button>
                    )}
                  </div>
                  <p className="text-white/40 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {selectedClient.clientEmail}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-3 bg-white/5 rounded-2xl text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="px-10 py-4 bg-black/40 border-b border-white/5 flex gap-8 overflow-x-auto custom-scrollbar">
                {[
                  { id: 'info', label: 'Informações', icon: Users },
                  { id: 'checklist', label: 'Checklist', icon: FileCheck },
                  { id: 'biddings', label: 'Editais', icon: Gavel },
                  { id: 'documents', label: 'Documentos', icon: FileUp },
                  { id: 'chat', label: 'Chat', icon: Mail }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setClientDetailTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 ${
                      clientDetailTab === tab.id ? 'border-[#00ffe0] text-[#00ffe0]' : 'border-transparent text-white/40 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10">
                {clientDetailTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4">Dados Cadastrais</h4>
                        <div className="space-y-4">
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/20 uppercase mb-1">CNPJ</p>
                            <p className="text-sm font-bold">{selectedClient.cnpj || 'Não informado'}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/20 uppercase mb-1">Nicho / Departamento</p>
                            <p className="text-sm font-bold uppercase">{selectedClient.niche}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/20 uppercase mb-1">Gerente de Contas</p>
                            <p className="text-sm font-bold">{selectedClient.accountManager || 'Não atribuído'}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/20 uppercase mb-1">Investimento</p>
                            <p className="text-sm font-bold">R$ {selectedClient.proposalValue || '0,00'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4">Departamentos & Integração</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { id: 'licitacoes', label: 'Licitações', icon: Gavel },
                            { id: 'tributaria', label: 'Tributária', icon: DollarSign },
                            { id: 'engenharia', label: 'Engenharia', icon: Building2 },
                            { id: 'automacao', label: 'Automação', icon: Package }
                          ].map(dept => {
                            const Icon = dept.icon;
                            const isActive = selectedClient.niche === dept.id;
                            return (
                              <div 
                                key={dept.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                                  isActive 
                                    ? 'bg-[#00ffe0]/10 border-[#00ffe0] text-[#00ffe0]' 
                                    : 'bg-white/5 border-white/5 text-white/20'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{dept.label}</span>
                                {isActive && <span className="text-[8px] bg-[#00ffe0] text-black px-1.5 py-0.5 rounded font-black">ATIVO</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4">Portais Cadastrados</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Compras.gov.br', 'Licitações-e', 'Portal de Compras Públicas', 'BBMNET'].map(portal => (
                            <button
                              key={portal}
                              onClick={async () => {
                                const newPortals = selectedClient.portals?.includes(portal)
                                  ? selectedClient.portals.filter(p => p !== portal)
                                  : [...(selectedClient.portals || []), portal];
                                await updateDoc(doc(db, "acceptances", selectedClient.id), { portals: newPortals });
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                selectedClient.portals?.includes(portal)
                                  ? 'bg-[#00ffe0]/10 border-[#00ffe0] text-[#00ffe0]'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                              }`}
                            >
                              {portal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4">Status & Compliance</h4>
                        <div className="space-y-4">
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-white/20 uppercase mb-1">Status do Contrato</p>
                              <p className={`text-sm font-bold ${selectedClient.contractSigned ? 'text-green-400' : 'text-yellow-400'}`}>
                                {selectedClient.contractSigned ? 'Assinado' : 'Pendente'}
                              </p>
                            </div>
                            {selectedClient.contractSigned && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/20 uppercase mb-1">Uso de Limites</p>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                              <div className="text-center">
                                <p className="text-[10px] text-white/40">Editais</p>
                                <p className="text-sm font-bold">{selectedClient.usage?.editais || 0}/{selectedClient.limits?.editais || 10}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-white/40">Pregões</p>
                                <p className="text-sm font-bold">{selectedClient.usage?.pregoes || 0}/{selectedClient.limits?.pregoes || 10}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-white/40">Proc.</p>
                                <p className="text-sm font-bold">{selectedClient.usage?.procedimentos || 0}/{selectedClient.limits?.procedimentos || 10}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {clientDetailTab === 'checklist' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { 
                        id: 'pj', 
                        label: 'Onboarding & PJ', 
                        items: [
                          'Proposta Comercial Aceita', 
                          'Contrato Digital Assinado', 
                          'Certificado Digital A1 Coletado', 
                          'Procuração e-CAC Ativa', 
                          'Documentos de Sócios (RG/CPF)',
                          'Contrato Social Consolidado'
                        ] 
                      },
                      { 
                        id: 'licitacao', 
                        label: 'Licitações (Operacional)', 
                        items: [
                          'Cadastro Compras.gov.br', 
                          'Cadastro Licitações-e', 
                          'Cadastro Portais Privados', 
                          'Busca de Editais (PNCP)', 
                          'Análise Técnica de Editais',
                          'Análise Jurídica de Editais',
                          'Envio de Propostas',
                          'Participação em Pregões',
                          'Gestão de Recursos/Impugnações',
                          'Homologação de Itens'
                        ] 
                      },
                      { 
                        id: 'automacao', 
                        label: 'Automação & Web3', 
                        items: [
                          'Briefing de Projeto', 
                          'Arquitetura de Fluxo', 
                          'Desenvolvimento de Agentes', 
                          'Integração de APIs', 
                          'Testes de Stress',
                          'Deploy em Produção',
                          'Treinamento de Equipe'
                        ] 
                      },
                      { 
                        id: 'engenharia', 
                        label: 'Engenharia & Tributário', 
                        items: [
                          'Levantamento de Dados', 
                          'Análise de Balanço', 
                          'Cálculo de Créditos', 
                          'Elaboração de Laudo', 
                          'Protocolo Administrativo',
                          'Acompanhamento de Processo'
                        ] 
                      }
                    ].map(section => (
                      <div key={section.id} className="bg-white/5 border border-white/10 p-6 rounded-[32px]">
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${
                          selectedClient.niche === section.id ? 'text-[#00ffe0]' : 'text-white/40'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${selectedClient.niche === section.id ? 'bg-[#00ffe0] animate-pulse' : 'bg-white/20'}`} />
                          {section.label}
                        </h4>
                        <div className="space-y-3">
                          {section.items.map(item => (
                            <button
                              key={item}
                              onClick={() => handleUpdateChecklist(section.id as any, item, !selectedClient.checklists?.[section.id as 'pj' | 'licitacao' | 'automacao']?.[item])}
                              className="w-full flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5 hover:border-[#00ffe0]/30 transition-all group"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                selectedClient.checklists?.[section.id as 'pj' | 'licitacao' | 'automacao']?.[item]
                                  ? 'bg-[#00ffe0] border-[#00ffe0] text-black'
                                  : 'border-white/20 group-hover:border-[#00ffe0]'
                              }`}>
                                {selectedClient.checklists?.[section.id as 'pj' | 'licitacao' | 'automacao']?.[item] && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className={`text-[10px] text-left leading-tight ${selectedClient.checklists?.[section.id as 'pj' | 'licitacao' | 'automacao']?.[item] ? 'text-white' : 'text-white/40'}`}>
                                {item}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {clientDetailTab === 'chat' && (
                  <div className="flex flex-col h-[500px] bg-black/40 rounded-[32px] border border-white/5 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20">
                          <Mail className="w-12 h-12 mb-4 opacity-10" />
                          <p className="text-sm font-bold uppercase tracking-widest">Inicie uma conversa com o cliente</p>
                        </div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${user && msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                              user && msg.senderId === user.uid 
                                ? 'bg-[#00ffe0] text-black font-medium rounded-tr-none' 
                                : 'bg-white/10 text-white rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-white/20 mt-1 px-1">
                              {msg.senderName} • {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 bg-black/60 border-t border-white/5 flex gap-4">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00ffe0] transition-all text-sm"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="px-6 py-3 bg-[#00ffe0] text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}

                {clientDetailTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Documentos do Cliente</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.filter(d => d.clientId === selectedClient.id).length === 0 ? (
                        <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                          <FileUp className="w-10 h-10 text-white/10 mx-auto mb-4" />
                          <p className="text-white/30 text-sm">Nenhum documento enviado.</p>
                        </div>
                      ) : (
                        documents.filter(d => d.clientId === selectedClient.id).map(doc => (
                          <div key={doc.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                doc.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                doc.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold truncate max-w-[200px]">{doc.name}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{doc.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.status !== 'approved' && (
                                <button 
                                  onClick={() => handleApproveDocument(doc.id, 'approved')}
                                  className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                                  title="Aprovar"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {doc.status !== 'rejected' && (
                                <button 
                                  onClick={() => handleApproveDocument(doc.id, 'rejected')}
                                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                  title="Rejeitar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-[#00ffe0] hover:text-black transition-all"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {clientDetailTab === 'biddings' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Editais Vinculados</h4>
                      <button 
                        onClick={() => {
                          setNewBidding({...newBidding, clientId: selectedClient.id});
                          setShowBiddingModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00ffe0] text-black rounded-xl text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Plus className="w-3 h-3" /> Novo Edital
                      </button>
                    </div>
                    {biddings.filter(b => b.clientId === selectedClient.id).length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                        <Gavel className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/30">Nenhuma licitação vinculada a este cliente.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {biddings.filter(b => b.clientId === selectedClient.id).map(bid => (
                          <div key={bid.id} className="bg-white/5 border border-white/10 p-8 rounded-[32px] space-y-8">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#00ffe0]/10 rounded-2xl flex items-center justify-center text-[#00ffe0]">
                                  <Gavel className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold">{bid.title}</h4>
                                  <p className="text-xs text-white/40 uppercase tracking-widest">{bid.organ} • {bid.number}</p>
                                </div>
                              </div>
                              <select 
                                value={bid.status}
                                onChange={async (e) => {
                                  await updateDoc(doc(db, "biddings", bid.id), { status: e.target.value });
                                }}
                                className="bg-black border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#00ffe0] transition-all"
                              >
                                <option value="analise">Análise</option>
                                <option value="participando">Participando</option>
                                <option value="vencido">Vencido</option>
                                <option value="perdido">Perdido</option>
                                <option value="impugnado">Impugnado</option>
                                <option value="homologado">Homologado</option>
                              </select>
                            </div>

                            {/* Detailed Timeline */}
                            <div className="relative">
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
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
                                    <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isActive ? 'bg-[#00ffe0] border-[#00ffe0] text-black shadow-[0_0_15px_rgba(0,255,224,0.4)]' : 'bg-black border-white/10 text-white/20'
                                      }`}>
                                        {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                      </div>
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[#00ffe0]' : 'text-white/20'}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                              <button 
                                onClick={() => {
                                  const proposalText = `PROPOSTA COMERCIAL\n\nEdital: ${bid.title}\nÓrgão: ${bid.organ}\nNúmero: ${bid.number}\n\nValor: R$ ${selectedClient.proposalValue || '0,00'}\n\nAtenciosamente,\n${selectedClient.clientName}`;
                                  copyToClipboard(proposalText);
                                }}
                                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#00ffe0] hover:text-black transition-all"
                              >
                                Gerar Proposta Chat
                              </button>
                              <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                Histórico Completo
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register Client Modal */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClientModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowClientModal(false)}
                className="absolute right-8 top-8 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight">Registrar Novo Cliente</h2>
              <p className="text-white/40 text-sm mb-8">Cadastre manualmente um cliente para acesso ao portal.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Importar de Lead Existente</label>
                  <select 
                    onChange={(e) => {
                      const lead = leads.find(l => l.id === e.target.value);
                      if (lead) {
                        setNewClient({
                          ...newClient,
                          name: lead.name || lead.company || "",
                          email: lead.email || ""
                        });
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all appearance-none text-sm"
                  >
                    <option value="">Selecione um lead para importar...</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `(${lead.company})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Nome do Cliente / Empresa</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Garage TEC"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">E-mail de Acesso (Google)</label>
                  <input 
                    type="email" 
                    placeholder="Ex: garage.tec.br@gmail.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">CNPJ (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="00.000.000/0000-00"
                      value={newClient.cnpj}
                      onChange={(e) => setNewClient({...newClient, cnpj: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Código Interno</label>
                    <input 
                      type="text" 
                      placeholder="Ex: CLI-001"
                      value={newClient.clientCode}
                      onChange={(e) => setNewClient({...newClient, clientCode: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Valor do Contrato (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 15.000,00"
                      value={newClient.value}
                      onChange={(e) => setNewClient({...newClient, value: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Departamento / Niche</label>
                    <select 
                      value={newClient.niche}
                      onChange={(e) => setNewClient({...newClient, niche: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all text-white"
                    >
                      <option value="licitacoes" className="bg-black">Licitações</option>
                      <option value="tributaria" className="bg-black">Tributária</option>
                      <option value="engenharia" className="bg-black">Engenharia</option>
                      <option value="ti" className="bg-black">TI & Automação</option>
                      <option value="automacoes" className="bg-black">Automações Indústria 6.0</option>
                      <option value="kode" className="bg-black">DCA Kode (Software)</option>
                      <option value="concepts" className="bg-black">Design Concepts</option>
                      <option value="marketing" className="bg-black">Marketing & Growth</option>
                      <option value="web" className="bg-black">Web & Apps</option>
                      <option value="games" className="bg-black">Ursa Polaris Games</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddClient();
                  }}
                  className="w-full btn-gradient py-4 rounded-2xl text-black font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform"
                >
                  Registrar Cliente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proposal Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGenerator(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowGenerator(false)}
                className="absolute right-8 top-8 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight">Gerador de Link de Proposta</h2>
              <p className="text-white/40 text-sm mb-8">Crie um link personalizado para enviar ao seu cliente.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Selecionar de Leads Existentes (Opcional)</label>
                  <select 
                    onChange={(e) => {
                      const lead = leads.find(l => l.id === e.target.value);
                      if (lead) {
                        setGenData({ ...genData, client: lead.name || lead.company || "" });
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all appearance-none text-sm"
                  >
                    <option value="">Selecione um lead...</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `(${lead.company})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Nome do Cliente / Empresa</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Empresa de Engenharia LTDA"
                    value={genData.client}
                    onChange={(e) => setGenData({...genData, client: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Valor do Investimento (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 15.000,00"
                    value={genData.value}
                    onChange={(e) => setGenData({...genData, value: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Portal de Destino</label>
                  <select 
                    value={genData.niche}
                    onChange={(e) => setGenData({...genData, niche: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all text-white"
                  >
                    <option value="licitacoes" className="bg-black">Portal de Licitações</option>
                    <option value="tributaria" className="bg-black">Consultoria Tributária</option>
                    <option value="engenharia" className="bg-black">Engenharia & Arquitetura</option>
                    <option value="ti" className="bg-black">TI & Automação</option>
                    <option value="automacoes" className="bg-black">Automações Indústria 6.0</option>
                    <option value="kode" className="bg-black">DCA Kode (Software)</option>
                    <option value="concepts" className="bg-black">Design Concepts</option>
                    <option value="marketing" className="bg-black">Marketing & Growth</option>
                    <option value="web" className="bg-black">Web & Apps</option>
                    <option value="games" className="bg-black">Ursa Polaris Games</option>
                  </select>
                </div>

                <button 
                  onClick={handleGenerateLink}
                  className="w-full btn-gradient py-4 rounded-2xl text-black font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform"
                >
                  Gerar Link Mágico
                </button>

                {generatedLink && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-white/5 border border-[#00ffe0]/20 rounded-2xl"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#00ffe0] font-bold mb-3">Link Gerado com Sucesso:</p>
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 mb-4">
                      <p className="text-xs text-white/40 truncate flex-1">{generatedLink}</p>
                      <button 
                        onClick={() => copyToClipboard(generatedLink)}
                        className="text-[#00ffe0] hover:scale-110 transition-transform"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => copyToClipboard(generatedLink)}
                        className="py-3 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Copiar Link
                      </button>
                      
                      <button 
                        onClick={() => {
                          const lead = leads.find(l => l.name === genData.client || l.company === genData.client);
                          if (lead?.email) {
                            handleSendProposalEmail(lead.email, lead.name);
                          } else {
                            const email = prompt("Digite o e-mail do cliente para enviar a proposta:");
                            if (email) handleSendProposalEmail(email, genData.client);
                          }
                        }}
                        disabled={isSendingEmail}
                        className="py-3 bg-[#00ffe0] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {isSendingEmail ? 'Enviando...' : 'Enviar por E-mail'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Bidding Modal */}
      <AnimatePresence>
        {showBiddingModal && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-6 text-white">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBiddingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowBiddingModal(false)}
                className="absolute right-8 top-8 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight">Vincular Novo Edital</h2>
              <p className="text-white/40 text-sm mb-8">Registre uma nova licitação para acompanhamento.</p>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                {/* PNCP Search Section */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[#00ffe0] font-bold">Busca de Oportunidades (PNCP)</label>
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => setPncpSearchType('text')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${pncpSearchType === 'text' ? 'bg-[#00ffe0] text-black' : 'text-white/40'}`}
                      >
                        Termo
                      </button>
                      <button 
                        onClick={() => setPncpSearchType('cnpj')}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${pncpSearchType === 'cnpj' ? 'bg-[#00ffe0] text-black' : 'text-white/40'}`}
                      >
                        CNPJ
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={pncpSearchType === 'text' ? "Ex: Mobiliário, Software, Limpeza..." : "CNPJ do Órgão"}
                      value={pncpQuery}
                      onChange={(e) => setPncpQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchPncp()}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-[#00ffe0] outline-none transition-all"
                    />
                    <button 
                      onClick={searchPncp}
                      disabled={isSearchingPncp}
                      className="px-4 bg-[#00ffe0] text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isSearchingPncp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>

                  {pncpResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Resultados Encontrados:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {pncpResults.map((res, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPncpItem(res)}
                            className={`w-full text-left p-3 bg-white/5 border rounded-xl transition-all group ${selectedPncpItem === res ? 'border-[#00ffe0] bg-[#00ffe0]/5' : 'border-white/5 hover:border-white/20'}`}
                          >
                            <p className="text-xs font-bold group-hover:text-[#00ffe0] line-clamp-1">{res.objeto}</p>
                            <div className="flex justify-between mt-1 items-center">
                              <span className="text-[9px] text-white/40 uppercase truncate max-w-[150px]">{res.orgaoEntidade?.razaoSocial}</span>
                              <span className="text-[9px] text-[#00ffe0] font-bold">Ver Resumo</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Preview */}
                  <AnimatePresence>
                    {selectedPncpItem && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-6 bg-[#00ffe0]/5 border border-[#00ffe0]/20 rounded-2xl overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xs font-bold text-[#00ffe0] uppercase tracking-widest">Resumo do Edital</h4>
                          <button onClick={() => setSelectedPncpItem(null)} className="text-white/20 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] text-white/40 uppercase font-bold mb-1">Objeto Completo</p>
                            <p className="text-xs text-white/80 leading-relaxed">{selectedPncpItem.objeto}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold mb-1">Órgão</p>
                              <p className="text-[10px] text-white/80 font-bold">{selectedPncpItem.orgaoEntidade?.razaoSocial}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold mb-1">Número/Ano</p>
                              <p className="text-[10px] text-white/80 font-bold">{selectedPncpItem.numeroSequencial}/{selectedPncpItem.anoCompra}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold mb-1">Valor Estimado</p>
                              <p className="text-[10px] text-[#00ffe0] font-bold">
                                {selectedPncpItem.valorTotalEstimado ? 
                                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPncpItem.valorTotalEstimado) : 
                                  'Não informado'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-bold mb-1">Data de Abertura</p>
                              <p className="text-[10px] text-white/80 font-bold">
                                {selectedPncpItem.dataPublicacaoPncp ? new Date(selectedPncpItem.dataPublicacaoPncp).toLocaleDateString('pt-BR') : '-'}
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setNewBidding({
                                ...newBidding,
                                title: selectedPncpItem.objeto || "",
                                number: `${selectedPncpItem.numeroSequencial}/${selectedPncpItem.anoCompra}`,
                                organ: selectedPncpItem.orgaoEntidade?.razaoSocial || "",
                              });
                              setSelectedPncpItem(null);
                              setPncpResults([]);
                            }}
                            className="w-full py-3 bg-[#00ffe0] text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform"
                          >
                            Vincular este Edital ao Cliente
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Cliente</label>
                  <select 
                    value={newBidding.clientId}
                    onChange={(e) => setNewBidding({...newBidding, clientId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all appearance-none"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.clientName || acc.clientEmail}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Título do Objeto</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Aquisição de Equipamentos de TI"
                    value={newBidding.title}
                    onChange={(e) => setNewBidding({...newBidding, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Nº Edital</label>
                    <input 
                      type="text" 
                      placeholder="001/2026"
                      value={newBidding.number}
                      onChange={(e) => setNewBidding({...newBidding, number: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Órgão</label>
                    <input 
                      type="text" 
                      placeholder="Prefeitura de..."
                      value={newBidding.organ}
                      onChange={(e) => setNewBidding({...newBidding, organ: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Departamento</label>
                  <select 
                    value={newBidding.department}
                    onChange={(e) => setNewBidding({...newBidding, department: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all appearance-none"
                  >
                    <option value="licitacoes">Licitações</option>
                    <option value="tributaria">Tributária</option>
                    <option value="ti">TI & Automação</option>
                    <option value="design">Design Concepts</option>
                    <option value="marketing">Marketing</option>
                    <option value="web">Web & Apps</option>
                    <option value="engenharia">Engenharia</option>
                  </select>
                </div>

                <button 
                  onClick={handleAddBidding}
                  className="w-full btn-gradient py-4 rounded-2xl text-black font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform"
                >
                  Registrar Licitação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register Acquisition Modal */}
      <AnimatePresence>
        {showAcquisitionModal && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAcquisitionModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowAcquisitionModal(false)}
                className="absolute right-8 top-8 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-[#00ffe0]" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">Nova Proposta M&A</h2>
              </div>
              <p className="text-white/40 text-sm mb-8">Elabore uma proposta estratégica para aquisição de empresa.</p>
              
              <AnimatePresence mode="wait">
                {showAcquisitionSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-[#00ffe0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-[#00ffe0]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 uppercase">Proposta Gerada!</h3>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed">
                      A proposta foi registrada com sucesso. <br />
                      Código de acesso para o cliente:
                    </p>
                    <div className="bg-[#00ffe0]/10 border border-[#00ffe0]/30 p-6 rounded-2xl mb-8 relative group">
                      <span className="text-3xl font-mono font-black tracking-[8px] text-[#00ffe0]">{generatedAcqCode}</span>
                      <button 
                        onClick={() => copyToClipboard(generatedAcqCode)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#00ffe0] text-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copiar Código"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest animate-pulse">
                      A janela fechará automaticamente...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Empresa Alvo</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Real Fit Academia"
                          value={newAcquisition.companyName}
                          onChange={(e) => setNewAcquisition({...newAcquisition, companyName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Valuation Proposto</label>
                        <input 
                          type="text" 
                          placeholder="Ex: R$ 1.500.000,00"
                          value={newAcquisition.valuation}
                          onChange={(e) => setNewAcquisition({...newAcquisition, valuation: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Nome do Proprietário</label>
                        <input 
                          type="text" 
                          placeholder="Ex: João Silva"
                          value={newAcquisition.ownerName}
                          onChange={(e) => setNewAcquisition({...newAcquisition, ownerName: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">E-mail do Proprietário</label>
                        <input 
                          type="email" 
                          placeholder="proprietario@empresa.com"
                          value={newAcquisition.ownerEmail}
                          onChange={(e) => setNewAcquisition({...newAcquisition, ownerEmail: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Telefone/WhatsApp</label>
                      <input 
                        type="tel" 
                        placeholder="Ex: (11) 99999-9999"
                        value={newAcquisition.ownerPhone}
                        onChange={(e) => setNewAcquisition({...newAcquisition, ownerPhone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold">Principais Termos & Sinergia</label>
                      <button 
                        type="button"
                        onClick={handleOptimizeWithAI}
                        disabled={isOptimizingIA}
                        className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest bg-[#00ffe0]/10 text-[#00ffe0] px-3 py-1 rounded-full hover:bg-[#00ffe0]/20 transition-all disabled:opacity-50"
                      >
                        {isOptimizingIA ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        Otimizar com IA
                      </button>
                    </div>
                    <textarea 
                      rows={6}
                      placeholder="Cole aqui os termos brutos ou rascunhos. A IA irá organizar os pontos principais..."
                      value={newAcquisition.terms}
                      onChange={(e) => setNewAcquisition({...newAcquisition, terms: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#00ffe0] outline-none transition-all resize-y text-sm min-h-[120px]"
                    />
                    {structuredProposalData && (
                      <p className="text-[9px] text-[#00ffe0]/60 font-bold mt-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Conteúdo estruturado pronto para o portal.
                      </p>
                    )}

                    <div className="space-y-4 py-4">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest block">Paleta de Cores da Proposta</label>
                      <div className="flex gap-4">
                        {(['cyan', 'orange', 'gold', 'purple', 'emerald'] as const).map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewAcquisition(prev => ({ ...prev, colorPalette: color }))}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              newAcquisition.colorPalette === color ? 'scale-110 border-white ring-4 ring-white/10' : 'border-transparent'
                            } ${
                              color === 'cyan' ? 'bg-[#00ffe0]' :
                              color === 'orange' ? 'bg-[#f97316]' :
                              color === 'gold' ? 'bg-[#FFD700]' :
                              color === 'purple' ? 'bg-[#A855F7]' : 'bg-[#10B981]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddAcquisition}
                      disabled={isAddingAcquisition}
                      className="w-full py-5 bg-[#00ffe0] text-black font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                      {isAddingAcquisition ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Gerar Proposta e Código de Acesso"
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
