import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Clock, 
  Check, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-hot-toast";

interface Message {
  role: "user" | "model";
  content: string;
}

interface CollectedData {
  name: string | null;
  contact: string | null;
  location: string | null;
  summary: string | null;
  department: string | null;
}

export default function TriageChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Olá! Sou o assistente virtual do Grupo DCA TEC. Como posso ajudar a otimizar os seus negócios hoje?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados de Triagem extraídos em tempo real
  const [collectedData, setCollectedData] = useState<CollectedData>({
    name: null,
    contact: null,
    location: null,
    summary: null,
    department: null
  });

  // Fluxo de agendamento virtual local
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || appointmentBooked) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/triage-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          currentCollectedData: collectedData
        })
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o agente virtual.");
      }

      const data = await response.json();
      
      // Atualizar dados coletados até o momento
      if (data.collectedData) {
        setCollectedData(prev => {
          const fresh = {
            name: (data.collectedData.name && data.collectedData.name !== "null" && data.collectedData.name !== "") ? data.collectedData.name : prev.name,
            contact: (data.collectedData.contact && data.collectedData.contact !== "null" && data.collectedData.contact !== "") ? data.collectedData.contact : prev.contact,
            location: (data.collectedData.location && data.collectedData.location !== "null" && data.collectedData.location !== "") ? data.collectedData.location : prev.location,
            summary: (data.collectedData.summary && data.collectedData.summary !== "null" && data.collectedData.summary !== "") ? data.collectedData.summary : prev.summary,
            department: (data.collectedData.department && data.collectedData.department !== "null" && data.collectedData.department !== "") ? data.collectedData.department : prev.department
          };
          return fresh;
        });
      }

      setMessages(prev => [...prev, { role: "model", content: data.response }]);

      // Se a IA indicar que chegou a hora de agendar OU se já temos Nome, Contato e Localidade preenchidos
      const hasMandatoryData = data.collectedData && 
        data.collectedData.name && data.collectedData.name !== "null" && data.collectedData.name !== "" &&
        data.collectedData.contact && data.collectedData.contact !== "null" && data.collectedData.contact !== "" &&
        data.collectedData.location && data.collectedData.location !== "null" && data.collectedData.location !== "";

      if ((data.shouldSchedule || hasMandatoryData) && !appointmentBooked) {
        setShowCalendar(true);
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao processar resposta da IA.");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar agendamento e salvar lead no CRM/Firestore
  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor, selecione data e horário.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Salvar Lead no Firestore de acordo com as regras de validação estritas
      let finalEmail = "nao_informado@dca.com";
      let finalPhone = "Sem telefone";

      if (collectedData.contact) {
        const cleanedContact = collectedData.contact.trim();
        if (cleanedContact.includes("@")) {
          // Extrair apenas o e-mail se houver texto ao redor
          const emailMatch = cleanedContact.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          finalEmail = emailMatch ? emailMatch[0] : "nao_informado@dca.com";
        } else {
          // Limitar o telefone a 20 caracteres conforme regra (isValidLead: data.phone.size() <= 20)
          finalPhone = cleanedContact.substring(0, 20);
        }
      }

      let finalName = collectedData.name?.trim() || "Lead via Triagem IA";
      if (finalName.length < 2) {
        finalName = "Lead via Triagem IA";
      } else if (finalName.length > 100) {
        finalName = finalName.substring(0, 100);
      }

      const leadData = {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        company: (collectedData.summary || "DCA Leads").substring(0, 50),
        message: `Agendado pelo Agente Virtual\n\nDepartamento: ${collectedData.department || "Geral"}\nLocalidade: ${collectedData.location || "Não especificada"}\nData da Reunião: ${selectedDate} às ${selectedTime}\nNecessidade extraída: ${collectedData.summary || "Não especificada"}`.substring(0, 2000),
        source: `Triagem Inteligente IA (${collectedData.department || "Triagem Geral"})`.substring(0, 100),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "leads"), leadData);

      // 2. Disparar notificação por email para o Admin e para o Cliente
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: leadData.name,
            email: leadData.email,
            company: leadData.company,
            subject: `Confirmação de Reunião: ${leadData.name} - DCA TEC`,
            message: `Olá, ${leadData.name}!\n\nSua reunião estratégica para o departamento de ${collectedData.department || "Triagem Geral"} foi pré-agendada com sucesso!\n\n📅 Data da Reunião: ${selectedDate}\n⏰ Horário: ${selectedTime}\n📍 Canal de Atendimento: Virtual DCA TEC\n\nQualquer novidade ou ajuste, você pode entrar em contato conosco.\n\nAtenciosamente,\nGrupo DCA TEC\nInovação & Tecnologia Group`,
            source: `Agendamento Triagem (Reunião)`
          })
        });
        console.log("Notificação de confirmação enviada com sucesso.");
      } catch (emailErr) {
        console.error("Erro ao enviar email de confirmação de reunião:", emailErr);
      }

      // 3. Finalizar no Chat
      setAppointmentBooked(true);
      setShowCalendar(false);
      
      const confirmMsg = `Perfeito! Sua reunião estratégica está pré-agendada com sucesso para o dia ${selectedDate} às ${selectedTime}.\n\nPara agilizar, você também pode clicar no botão de confirmação abaixo para receber detalhes de contato rápidos pelo WhatsApp! Nossos especialistas em ${collectedData.department || "sua dor de negócio"} já foram notificados. Tenha um excelente dia!`;
      
      setMessages(prev => [...prev, { role: "model", content: confirmMsg }]);
      toast.success("Reunião agendada! Confirmação enviada e lead salvo.");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao salvar agendamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante do Chat com Animação Premium */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 bg-black border border-[#00ffe0]/40 text-[#00ffe0] rounded-full shadow-[0_0_20px_rgba(0,255,224,0.3)] hover:shadow-[0_0_30px_rgba(0,255,224,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffe0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ffe0]"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Janela de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-[#0d0d0d] border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-black/60 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#00ffe0]/10 rounded-xl flex items-center justify-center text-[#00ffe0] border border-[#00ffe0]/30 shadow-[0_0_15px_rgba(0,255,224,0.15)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#00ffe0]">Recepção Inteligente</h3>
                <p className="text-[10px] text-white/40">DCA TAC Protocol Group</p>
              </div>
              <div className="text-[9px] bg-[#00ffe0]/10 text-[#00ffe0] font-bold px-2 py-1 rounded-md border border-[#00ffe0]/25 uppercase tracking-wider">
                TRIAGEM
              </div>
            </div>

            {/* Painel de Dados Coletados em Tempo Real */}
            <div className="px-5 py-3 bg-[#121212] border-b border-white/5 flex gap-2 justify-between">
              {[
                { icon: User, value: collectedData.name, label: "Nome" },
                { icon: Phone, value: collectedData.contact, label: "Contato" },
                { icon: MapPin, value: collectedData.location, label: "Cidade" },
                { icon: Clock, value: collectedData.department ? "OK" : null, label: "Área" }
              ].map((pill, i) => (
                <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] transition-all bg-white/5 border ${
                  pill.value ? 'border-[#00ffe0]/30 bg-[#00ffe0]/5 text-[#00ffe0]' : 'border-white/5 text-white/30'
                }`}>
                  <pill.icon className="w-3 h-3" />
                  <span className="font-semibold uppercase tracking-wider">{pill.label}</span>
                </div>
              ))}
            </div>

            {/* Corpo de Mensagens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-black/20">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#00ffe0]/15 text-[#00ffe0] border border-[#00ffe0]/40 rounded-tr-none shadow-[0_4px_12px_rgba(0,255,224,0.05)]"
                        : "bg-[#181818] text-white/90 border border-white/5 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Bot digita */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#181818] border border-white/5 text-white/50 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#00ffe0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-[#00ffe0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-[#00ffe0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}

              {/* Módulo de Agendamento Dinâmico */}
              {showCalendar && !appointmentBooked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#181818] border border-[#00ffe0]/30 rounded-2xl p-4 space-y-4"
                >
                  <div className="flex items-center gap-2 text-[#00ffe0]">
                    <Calendar className="w-4 h-4" />
                    <h4 className="text-[11px] font-bold uppercase tracking-widest">Reserve sua Reunião</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1">Escolha o Dia</label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00ffe0]"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-white/40 block mb-1">Selecione o Horário</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["09:00", "11:00", "14:00", "15:30", "17:00"].map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              selectedTime === time
                                ? "bg-[#00ffe0] text-black border-[#00ffe0]"
                                : "bg-black/40 text-white/60 border-white/5 hover:border-white/25"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmAppointment}
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-[#00ffe0] text-black text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,224,0.2)]"
                    >
                      <span>{isLoading ? "Agendando..." : "Confirmar Reunião"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Módulo de Sucesso e Confirmação de WhatsApp / E-mail */}
              {appointmentBooked && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-[#00ffe0]/30 rounded-2xl p-4 space-y-4 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-[#00ffe0]">
                    <div className="w-12 h-12 bg-[#00ffe0]/10 rounded-full border border-[#00ffe0]/30 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(0,255,224,0.15)]">
                      <Check className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#00ffe0]">Agendamento Concluído!</h4>
                    <p className="text-[10px] text-white/70 leading-relaxed">
                      Seu horário foi reservado em nosso sistema para o dia <span className="text-[#00ffe0] font-semibold">{selectedDate}</span> às <span className="text-[#00ffe0] font-semibold">{selectedTime}</span>.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Botão de Enviar ao WhatsApp */}
                    <a
                      href={`https://wa.me/5548991796036?text=${encodeURIComponent(
                        `Olá DCA TEC! Acabei de agendar um atendimento estratégico.\n\n👤 Nome: ${collectedData.name || 'Cliente'}\n📅 Data: ${selectedDate}\n⏰ Horário: ${selectedTime}\n💼 Departamento: ${collectedData.department || 'Geral'}\n📍 Localidade: ${collectedData.location || 'Não especificada'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.2)] active:scale-95"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                      <span>Confirmar no WhatsApp</span>
                    </a>

                    <div className="text-[9px] text-white/40 leading-relaxed">
                      {collectedData.contact?.includes("@") ? (
                        <span>
                          Enviamos também a confirmação oficial no seu e-mail cadastrado: <strong className="text-white/60">{collectedData.contact}</strong>.
                        </span>
                      ) : (
                        <span>
                          Um e-mail de notificação de agendamento foi encaminhado ao nosso comitê executivo com seus dados de contato.
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || appointmentBooked}
                placeholder={appointmentBooked ? "Atendimento concluído." : "Digite sua mensagem..."}
                className="flex-1 bg-[#121212] border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-white/80 placeholder-white/20 outline-none focus:border-[#00ffe0]/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || appointmentBooked}
                className="p-2.5 bg-[#00ffe0] hover:bg-[#00ffe0]/80 text-black rounded-2xl font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
