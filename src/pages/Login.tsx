import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  LogIn, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        // Check if admin
        if (user.email?.toLowerCase() === "dca.tec.br@gmail.com") {
          navigate("/admin");
          return;
        }

        // Check if client
        const q = query(collection(db, 'acceptances'), where('clientEmail', '==', user.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          navigate("/client/dashboard");
        } else {
          setError("Este e-mail não está vinculado a nenhuma conta ativa no Grupo DCA TEC.");
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Erro ao realizar login com Google. Tente novamente.");
      setLoading(false);
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

          <h2 className="text-2xl font-bold text-center mb-2 uppercase tracking-tight">Bem-vindo</h2>
          <p className="text-white/40 text-center text-sm mb-10">Acesse sua área restrita para gerenciar seus serviços e documentos.</p>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Acessar com Google
              </>
            )}
          </button>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-4">Dúvidas no acesso?</p>
            <a href="mailto:contato@dca.tec.br" className="text-xs text-white/40 hover:text-[#00ffe0] transition-colors">
              Falar com suporte técnico
            </a>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-white/20 uppercase tracking-widest font-bold">
          Segurança Garantida • LGPD Compliance
        </p>
      </motion.div>
    </div>
  );
}
