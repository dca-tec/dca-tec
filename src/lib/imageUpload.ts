import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export interface UploadResult {
  url: string;
  source: "storage" | "data_url";
  fileName: string;
}

/**
 * Compresses an image file using HTML5 Canvas to an optimal WebP/JPEG data URL.
 * Keeps resolution sharp (up to 1920x1080) while shrinking file size dramatically (<300KB).
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo de imagem selecionado."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem corrompido ou formato inválido."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to raw data url if canvas context fails
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            return resolve(webpData);
          }
        } catch {
          // ignore and fallback
        }

        const jpegData = canvas.toDataURL("image/jpeg", quality);
        resolve(jpegData);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file:
 * 1. Attempts to upload to Firebase Storage bucket.
 * 2. If Firebase Storage bucket isn't enabled or has permission/CORS restrictions,
 *    it transparently falls back to an optimized high-resolution web Data URL,
 *    storing the image directly in Firestore without any broken links or external hosting needed.
 */
export async function uploadBannerImage(file: File): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).");
  }

  // 1. Try Firebase Storage upload
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `banners/${Date.now()}_${cleanName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      url: downloadUrl,
      source: "storage",
      fileName: file.name,
    };
  } catch (err: any) {
    console.info("Firebase Storage upload not available or restricted, falling back to optimized inline format:", err?.message || err);
  }

  // 2. Fallback: Compress and convert to web-optimized Data URL
  const dataUrl = await compressImageToDataUrl(file);
  return {
    url: dataUrl,
    source: "data_url",
    fileName: file.name,
  };
}

/**
 * Presets of high-tech and official DCA TEC background assets
 */
export const OFFICIAL_DCA_IMAGE_PRESETS = [
  {
    name: "Stand Oficial DCA TEC - Expomaq 2026",
    url: "/assets/images/dca_expo_stand_1791859526860.jpg",
    category: "Oficial",
  },
  {
    name: "DCA Tech Hub & Campus Tecnológico",
    url: "/assets/images/dca_tech_hub_1791859552329.jpg",
    category: "Oficial",
  },
  {
    name: "DCA TEC 3D Logo Holográfico",
    url: "/assets/images/dca_tec_3d_logo_1791860209311.jpg",
    category: "Oficial",
  },
  {
    name: "Polo Industrial de Alta Tecnologia (Holding)",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
    category: "Holding & Indústria",
  },
  {
    name: "Infraestrutura Global & Inteligência Artificial",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80",
    category: "IA & Conectividade",
  },
  {
    name: "Centro de Dados & Ciberdefesa",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80",
    category: "Cybersecurity",
  },
];
