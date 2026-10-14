import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface HeroBannerCta {
  label: string;
  href: string;
  isExternal?: boolean;
  isInternalRoute?: boolean;
  onClickSchedule?: boolean;
}

export interface HeroBannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image?: string;
  video?: string;
  tags: string[];
  primaryCta: HeroBannerCta;
  secondaryCta?: HeroBannerCta;
  active: boolean;
  order: number;
  navLabel?: string;
  updatedAt?: string;
}

export const DEFAULT_HERO_BANNERS: HeroBannerItem[] = [
  {
    id: "expo-stand",
    badge: "DCA TEC // PRESENÇA GLOBAL & EXPO DE TECNOLOGIA",
    title: "TECNOLOGIA QUE CONECTA PESSOAS E POSSIBILIDADES",
    subtitle: "Soluções integradas de inteligência artificial, biometria de última geração, ciberdefesa e infraestruturas tecnológicas sob medida.",
    image: "/assets/images/dca_expo_stand_1791859526860.jpg",
    tags: [
      "Biometria Avançada",
      "Inteligência Artificial",
      "Cibersegurança",
      "Soluções Sob Medida",
    ],
    primaryCta: {
      label: "Explorar Ecossistema",
      href: "#consultoria-integrada",
    },
    secondaryCta: {
      label: "Agendar Reunião VIP",
      href: "#",
      onClickSchedule: true,
    },
    navLabel: "Expo & Presença",
    active: true,
    order: 1,
  },
  {
    id: "tech-campus",
    badge: "ECOSSISTEMA DCA TEC",
    title: "INNOVATION & TECHNOLOGY GROUP",
    subtitle: "Conectamos empresas, laboratórios científicos, engenharia de ponta e arquitetura disruptiva para construir o futuro das cidades e das indústrias.",
    image: "/assets/images/dca_tech_hub_1791859552329.jpg",
    tags: [
      "Engenharia & Aeroespacial",
      "Biofísica & Saúde",
      "Holding & Gestão",
      "Presença Global",
    ],
    primaryCta: {
      label: "Conhecer o Grupo",
      href: "#sobre",
    },
    secondaryCta: {
      label: "Presença Internacional",
      href: "#contato",
    },
    navLabel: "Innovation Group",
    active: true,
    order: 2,
  },
  {
    id: "polo-industrial",
    badge: "HOLDING VALE DAS ARAUCÁRIAS SA",
    title: "POLO INDUSTRIAL DE ALTA TECNOLOGIA",
    subtitle: "Parque tecnológico e complexo empresarial integrando centros de manufatura 6.0, laboratórios e governança de excelência.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
    tags: [
      "Indústria 6.0",
      "Infraestrutura Verde",
      "Segurança de Dados",
    ],
    primaryCta: {
      label: "Acessar Portal do Polo",
      href: "http://valedasaraucarias.dca.tec.br/",
      isExternal: true,
    },
    secondaryCta: {
      label: "Projetos de Engenharia",
      href: "#engenharia",
    },
    navLabel: "Polo Industrial",
    active: true,
    order: 3,
  },
  {
    id: "automacao-ind",
    badge: "TRANSFORMAÇÃO DIGITAL INDUSTRIAL",
    title: "AUTOMAÇÕES & ENGENHARIA COGNITIVA",
    subtitle: "Pipelines operacionais inteligentes, robótica autônoma, IoT industrial e inteligência fiscal para maximizar performance.",
    video: "https://assets.mixkit.co/videos/preview/mixkit-digital-connection-of-blue-dots-and-lines-21045-large.mp4",
    tags: [
      "Automação Autônoma",
      "Consultoria Fiscal",
      "Governança 360°",
    ],
    primaryCta: {
      label: "Ver Automações 6.0",
      href: "/automacao",
      isInternalRoute: true,
    },
    secondaryCta: {
      label: "Falar com Consultor",
      href: "#contato",
    },
    navLabel: "Automação 6.0",
    active: true,
    order: 4,
  },
];

const LOCAL_STORAGE_KEY = "dca_hero_banners_v1";

export function loadStoredBanners(): HeroBannerItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    }
  } catch (err) {
    console.warn("Error reading banners from localStorage:", err);
  }
  return [...DEFAULT_HERO_BANNERS];
}

export function saveStoredBanners(banners: HeroBannerItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent("dca_hero_banners_updated", { detail: banners }));
  } catch (err) {
    console.warn("Error writing banners to localStorage:", err);
  }
}

export function useHeroBanners() {
  const [banners, setBanners] = useState<HeroBannerItem[]>(() => loadStoredBanners());
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "local_only" | "error">("synced");

  // Sync with localStorage CustomEvent & Firestore doc
  useEffect(() => {
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<HeroBannerItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setBanners(customEvent.detail.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    };
    window.addEventListener("dca_hero_banners_updated", handleLocalUpdate);

    let unsubscribe = () => {};
    try {
      const bannerDocRef = doc(db, "site_settings", "hero_banners");
      unsubscribe = onSnapshot(bannerDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items) && data.items.length > 0) {
            const sorted = [...data.items].sort((a, b) => (a.order || 0) - (b.order || 0));
            setBanners(sorted);
            saveStoredBanners(sorted);
            setSyncStatus("synced");
            return;
          }
        }
      }, (error) => {
        console.info("Firestore hero_banners listener fallback:", error.message);
        setSyncStatus("local_only");
      });
    } catch {
      setSyncStatus("local_only");
    }

    return () => {
      window.removeEventListener("dca_hero_banners_updated", handleLocalUpdate);
      unsubscribe();
    };
  }, []);

  const persistBanners = async (nextBanners: HeroBannerItem[]) => {
    setIsSaving(true);
    setSyncStatus("saving");
    const sorted = [...nextBanners].sort((a, b) => (a.order || 0) - (b.order || 0));
    setBanners(sorted);
    saveStoredBanners(sorted);

    try {
      const bannerDocRef = doc(db, "site_settings", "hero_banners");
      await setDoc(bannerDocRef, {
        items: sorted,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSyncStatus("synced");
    } catch (err) {
      console.warn("Could not save hero_banners to Firestore (using local storage fallback):", err);
      setSyncStatus("local_only");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBannerActive = async (id: string, forcedValue?: boolean) => {
    const nextBanners = banners.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          active: forcedValue !== undefined ? forcedValue : !b.active,
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });
    await persistBanners(nextBanners);
  };

  const updateBanner = async (id: string, updates: Partial<HeroBannerItem>) => {
    const nextBanners = banners.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });
    await persistBanners(nextBanners);
  };

  const createBanner = async (newBanner: Omit<HeroBannerItem, "id">) => {
    const id = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const maxOrder = banners.reduce((acc, b) => Math.max(acc, b.order || 0), 0);
    const item: HeroBannerItem = {
      ...newBanner,
      id,
      order: maxOrder + 1,
      updatedAt: new Date().toISOString(),
    };
    await persistBanners([...banners, item]);
  };

  const deleteBanner = async (id: string) => {
    const nextBanners = banners.filter((b) => b.id !== id);
    await persistBanners(nextBanners);
  };

  const moveBanner = async (id: string, direction: "up" | "down") => {
    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === banners.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Recalculate orders
    const normalized = reordered.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    await persistBanners(normalized);
  };

  const resetToDefaultBanners = async () => {
    await persistBanners(DEFAULT_HERO_BANNERS);
  };

  const bulkSetBannersActive = async (active: boolean) => {
    const updated = banners.map((b) => ({ ...b, active }));
    await persistBanners(updated);
  };

  const activeBanners = banners
    .filter((b) => b.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    banners,
    activeBanners,
    isSaving,
    syncStatus,
    toggleBannerActive,
    updateBanner,
    createBanner,
    deleteBanner,
    moveBanner,
    resetToDefaultBanners,
    bulkSetBannersActive,
  };
}
