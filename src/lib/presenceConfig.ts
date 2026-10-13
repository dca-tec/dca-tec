import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface PresenceLocation {
  id: string;
  city: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface PresenceRegion {
  id: string;
  region: string;
  description?: string;
  isCentral?: boolean;
  active: boolean;
  locations?: PresenceLocation[];
  countries?: string[];
  updatedAt?: string;
}

export const DEFAULT_REGIONS: PresenceRegion[] = [
  {
    id: "centrais",
    region: "Centrais de Atendimento",
    description: "Nossos escritórios centrais coordenam o atendimento global. Entre em contato conosco e direcionaremos você para o escritório mais próximo na sua língua nativa.",
    isCentral: true,
    active: true,
    locations: [
      {
        id: "loc-brasil-sede",
        city: "Brasil (Sede)",
        name: "Escritórios em São Paulo, Florianópolis, Curitiba e Rio de Janeiro",
        address: "Atendimento centralizado para toda a América Latina e Europa.",
        phone: "+55 (11) 4003-0000",
        email: "contato@dcatec.com.br",
        active: true,
      },
      {
        id: "loc-miami",
        city: "Estados Unidos",
        name: "Miami Office",
        address: "2801 NW 74th Ave #211, Miami, FL 33122, EUA",
        phone: "+1 (305) 500-0000",
        email: "usa@dcatec.com",
        active: true,
      },
    ],
  },
  {
    id: "latam",
    region: "América Latina",
    active: true,
    countries: ["Peru", "Colômbia", "Venezuela", "Argentina", "Chile"],
  },
  {
    id: "central-america",
    region: "América Central",
    active: true,
    countries: ["Panamá", "Costa Rica", "México"],
  },
  {
    id: "europa",
    region: "Europa",
    active: true,
    countries: [
      "Inglaterra (Reino Unido)", "Alemanha", "Espanha", "França", "Itália", 
      "Suíça", "Bélgica", "Irlanda", "Noruega", "Áustria", "Grécia", 
      "República Checa", "Dinamarca", "Hungria", "Eslováquia", 
      "Lituânia e Letônia", "Islândia", "Sérvia", "Ucrânia", "Malta", "Mônaco"
    ],
  },
  {
    id: "asia-pacifico",
    region: "Ásia Pacífico",
    active: true,
    countries: [
      "Japão (Tokyo)", "China (Hong Kong)", "Indonésia", "Tailândia", 
      "Nova Zelândia", "Austrália", "Índia", "Filipinas", "Singapura"
    ],
  },
  {
    id: "oriente-medio",
    region: "Oriente Médio e África",
    active: true,
    countries: [
      "Emirados Árabes (Dubai)", "Arábia Saudita", "Catar", "Israel", 
      "Iraque", "Irã", "Egito", "África do Sul", "Marrocos", "Maurício", "Moçambique"
    ],
  },
  {
    id: "russia",
    region: "Rússia",
    active: true,
    countries: ["Rússia"],
  },
];

const LOCAL_STORAGE_KEY = "dca_presence_regions_v1";
const EVENT_NAME = "dca_presence_regions_updated";

export function loadStoredRegions(): PresenceRegion[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Erro ao carregar regiões do localStorage:", err);
  }
  return DEFAULT_REGIONS;
}

export function saveStoredRegions(regions: PresenceRegion[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(regions));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: regions }));
  } catch (err) {
    console.warn("Erro ao salvar regiões no localStorage:", err);
  }
}

export function usePresenceRegions() {
  const [regions, setRegions] = useState<PresenceRegion[]>(() => loadStoredRegions());
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "local_only" | "error">("synced");

  useEffect(() => {
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PresenceRegion[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setRegions(customEvent.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handleLocalUpdate);

    // Live subscription to Firestore
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, "site_settings", "regions");
      unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setRegions(data.items);
            saveStoredRegions(data.items);
            setSyncStatus("synced");
          }
        }
      }, (error) => {
        console.info("Firestore regions listener fallback to local:", error.message);
        setSyncStatus("local_only");
      });
    } catch {
      setSyncStatus("local_only");
    }

    return () => {
      window.removeEventListener(EVENT_NAME, handleLocalUpdate);
      unsubscribe();
    };
  }, []);

  const persistRegions = async (nextRegions: PresenceRegion[]) => {
    setIsSaving(true);
    setSyncStatus("saving");
    setRegions(nextRegions);
    saveStoredRegions(nextRegions);

    try {
      const docRef = doc(db, "site_settings", "regions");
      await setDoc(docRef, {
        items: nextRegions,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSyncStatus("synced");
    } catch (err) {
      console.warn("Could not save regions to Firestore (local fallback):", err);
      setSyncStatus("local_only");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRegion = async (regionId: string, forcedValue?: boolean) => {
    const updated = regions.map((r) => {
      if (r.id === regionId) {
        const nextActive = forcedValue !== undefined ? forcedValue : !r.active;
        return { ...r, active: nextActive };
      }
      return r;
    });
    await persistRegions(updated);
  };

  const toggleLocation = async (regionId: string, locationId: string, forcedValue?: boolean) => {
    const updated = regions.map((r) => {
      if (r.id === regionId && r.locations) {
        const updatedLocations = r.locations.map((loc) => {
          if (loc.id === locationId) {
            const nextActive = forcedValue !== undefined ? forcedValue : !loc.active;
            return { ...loc, active: nextActive };
          }
          return loc;
        });
        return { ...r, locations: updatedLocations };
      }
      return r;
    });
    await persistRegions(updated);
  };

  const updateRegion = async (updatedRegion: PresenceRegion) => {
    const exists = regions.some((r) => r.id === updatedRegion.id);
    let next: PresenceRegion[];
    if (exists) {
      next = regions.map((r) => (r.id === updatedRegion.id ? updatedRegion : r));
    } else {
      next = [...regions, updatedRegion];
    }
    await persistRegions(next);
  };

  const addRegion = async (newRegion: Omit<PresenceRegion, "id"> & { id?: string }) => {
    const id = newRegion.id || `region-${Date.now()}`;
    const regionToAdd: PresenceRegion = {
      ...newRegion,
      id,
      active: newRegion.active ?? true,
      updatedAt: new Date().toISOString(),
    };
    await persistRegions([...regions, regionToAdd]);
  };

  const deleteRegion = async (regionId: string) => {
    const next = regions.filter((r) => r.id !== regionId);
    await persistRegions(next);
  };

  const resetRegionsToDefault = async () => {
    await persistRegions(DEFAULT_REGIONS);
  };

  // Active regions for public display
  const activeRegions = regions.filter((r) => r.active);

  return {
    regions,
    activeRegions,
    isSaving,
    syncStatus,
    toggleRegion,
    toggleLocation,
    updateRegion,
    addRegion,
    deleteRegion,
    resetRegionsToDefault,
  };
}
