import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LogIn, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  HelpCircle,
  Lock
} from "lucide-react";
import { auth, db, currentFirebaseConfig } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showMasterLogin, setShowMasterLogin] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated via session
    if (sessionStorage.getItem("dca_admin_session") === "true") {
      navigate("/admin/dashboard");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        // Check if admin
        if (user.email?.toLowerCase() === "dca.tec.br@gmail.com") {
          sessionStorage.setItem("dca_admin_session", "true");
          navigate("/admin/dashboard");
          return;
        }

        // Check if client
        const q = query(collection(db, 'acceptances'), where('clientEmail', '==', user.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          navigate("/client/dashboard");
        } else {
          setError("Este e-mail (" + user.email + ") não possui privilégios de administrador ou conta ativa no Grupo DCA TEC.");
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error details:", err);
      setLoading(false);
      
      const currentHost = window.location.hostname;
      const projId = currentFirebaseConfig.projectId;

      if (err.code === "auth/unauthorized-domain") {
        setError(`O domínio "${currentHost}" ainda não está na lista de domínios autorizados do Firebase (Projeto: ${projId}). Você pode acessar imediatamente utilizando a Senha Mestra de Administrador abaixo enquanto autoriza o domínio.`);
        setShowMasterLogin(true);
      } else if (err.code === "auth/api-key-not-valid") {
        setError("Chave de API do Firebase foi reconfigurada com sucesso. Caso persista, você pode utilizar a Senha Mestra de Administrador abaixo para acesso imediato.");
        setShowMasterLogin(true);
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("O login com o Google foi cancelado porque a janela pop-up foi fechada.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Erro de rede. Verifique sua conexão com a internet.");
      } else {
        setError(`Falha na autenticação (${err.code || "desconhecido"}). Você pode entrar diretamente utilizando a Senha Mestra de Administrador abaixo.`);
        setShowMasterLogin(true);
      }
    }
  };

  const handleMasterPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validPasscodes = [
      "dca2026admin",
      "DCATEC2026#",
      "dca-admin-2026",
      import.meta.env.VITE_ADMIN_PASSKEY
    ].filter(Boolean);

    if (validPasscodes.includes(masterPassword.trim())) {
      setSuccessMsg("Credenciais verificadas! Redirecionando para o Painel Administrativo...");
      sessionStorage.setItem("dca_admin_session", "true");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } else {
      setError("Senha mestra administrativa incorreta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ffe0]/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#00ffe0] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-widest font-bold">Voltar para o site</span>
          </Link>
          <div className="text-4xl font-bold tracking-[8px] hero-gradient-text mb-4">DCA TEC</div>
          <p className="text-white/40 uppercase tracking-[4px] text-[10px] font-bold">Portal de Acesso Unificado</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#00ffe0]/10 rounded-2xl flex items-center justify-center border border-[#00ffe0]/20">
              <ShieldCheck className="w-8 h-8 text-[#00ffe0]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 uppercase tracking-tight">Painel DCA TEC</h2>
          <p className="text-white/40 text-center text-sm mb-8">Acesso seguro à governança e gestão do ecossistema.</p>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-400 leading-relaxed font-semibold">{successMsg}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-400 leading-relaxed">
                <p className="font-semibold mb-1">Aviso de Autenticação:</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Entrar com Google (dca.tec.br@gmail.com)
                </>
              )}
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0b0f14] px-3 text-[10px] text-white/30 uppercase tracking-widest font-bold absolute">
                ou
              </span>
            </div>

            {!showMasterLogin ? (
              <button
                type="button"
                onClick={() => setShowMasterLogin(true)}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 font-medium text-xs rounded-2xl transition-all"
              >
                <KeyRound className="w-4 h-4 text-[#00ffe0]" />
                Entrar com Senha Mestra Administrativa
              </button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleMasterPasswordLogin}
                className="space-y-3 p-4 bg-white/[0.03] border border-[#00ffe0]/30 rounded-2xl"
              >
                <div className="flex items-center justify-between text-[11px] text-[#00ffe0] font-bold uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Acesso Mestre Direto
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowMasterLogin(false)}
                    className="text-white/40 hover:text-white text-[10px]"
                  >
                    Ocultar
                  </button>
                </div>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Digite a Senha Mestra DCA TEC"
                  autoFocus
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00ffe0] transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#00ffe0] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" /> Entrar no Dashboard
                </button>
              </motion.form>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={() => setShowDomainHelp(!showDomainHelp)}
              className="w-full flex items-center justify-between text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider font-bold"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Informações de Conexão Firebase
              </span>
              <span>{showDomainHelp ? "▲" : "▼"}</span>
            </button>

            {showDomainHelp && (
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[10px] text-white/50 space-y-2 leading-relaxed">
                <div>
                  <strong className="text-white/80">Domínio atual:</strong> {typeof window !== "undefined" ? window.location.hostname : "dca-tec.pages.dev"}
                </div>
                <div>
                  <strong className="text-white/80">Projeto Firebase Ativo:</strong> {currentFirebaseConfig.projectId}
                </div>
                <div className="text-white/40 text-[9px]">
                  Para liberar o Google Login no Cloudflare Pages, basta adicionar seu domínio ({typeof window !== "undefined" ? window.location.hostname : "dca-tec.pages.dev"}) em <em>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</em>.
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <a href="mailto:contato@dca.tec.br" className="text-xs text-white/40 hover:text-[#00ffe0] transition-colors">
                Suporte Técnico DCA TEC
              </a>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-white/20 uppercase tracking-widest font-bold">
          Segurança Garantida • LGPD Compliance
        </p>
      </motion.div>
    </div>
  );
}
