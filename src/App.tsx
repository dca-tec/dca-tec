import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import TriageChatWidget from "./components/TriageChatWidget";

// Lazy load pages for better performance
const HiddenPortal = lazy(() => import("./pages/HiddenPortal"));
const TaxRecovery = lazy(() => import("./pages/TaxRecovery"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const Login = lazy(() => import("./pages/Login"));
const AcquisitionPortal = lazy(() => import("./pages/AcquisitionPortal"));
const Home = lazy(() => import("./pages/Home"));
const DcaConcepts = lazy(() => import("./pages/DcaConcepts"));
const DcaKode = lazy(() => import("./pages/DcaKode"));
const UrsaPolarisGames = lazy(() => import("./pages/UrsaPolarisGames"));
const Licitacoes = lazy(() => import("./pages/Licitacoes"));
const Industria = lazy(() => import("./pages/Industria"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-[#00ffe0] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <TriageChatWidget />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/concepts" element={<DcaConcepts />} />
          <Route path="/kode" element={<DcaKode />} />
          <Route path="/games" element={<UrsaPolarisGames />} />
          <Route path="/licitacoes" element={<Licitacoes />} />
          <Route path="/automacao" element={<Industria />} />
          <Route path="/ma/:proposalId" element={<AcquisitionPortal />} />
          <Route path="/portal-oculto-dca" element={<HiddenPortal />} />
          <Route path="/restituicao-tributaria" element={<TaxRecovery />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/cliente/dashboard" element={<ClientDashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
