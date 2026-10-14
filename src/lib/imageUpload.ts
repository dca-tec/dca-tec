export interface UploadResult {
  url: string;
  source: "data_url";
  fileName: string;
  fileSizeKb: number;
}

/**
 * Compresses an image file using HTML5 Canvas to an optimal WebP/JPEG data URL.
 * Keeps resolution crisp for widescreen hero banners (up to 1920x1080)
 * while optimizing file size for instantaneous rendering and storage.
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // Safety fallback: if anything hangs or stalls, return direct data URL within 2.5 seconds
    const safetyTimer = setTimeout(() => {
      try {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(fallbackReader.result as string || "");
        fallbackReader.onerror = () => resolve("");
        fallbackReader.readAsDataURL(file);
      } catch {
        resolve("");
      }
    }, 2500);

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        clearTimeout(safetyTimer);
        resolve("");
      };
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        if (!rawDataUrl) {
          clearTimeout(safetyTimer);
          resolve("");
          return;
        }

        const img = new Image();
        img.onerror = () => {
          clearTimeout(safetyTimer);
          // If image decoding in canvas fails, resolve raw data URL directly
          resolve(rawDataUrl);
        };
        img.onload = () => {
          clearTimeout(safetyTimer);
          try {
            let width = img.width || 1200;
            let height = img.height || 800;

            // Calculate proportional scale
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
              resolve(rawDataUrl);
              return;
            }

            // Draw and render
            ctx.drawImage(img, 0, 0, width, height);

            // Attempt WebP first for superior compression, fallback to JPEG
            try {
              const webpData = canvas.toDataURL("image/webp", quality);
              if (webpData && webpData.startsWith("data:image/webp") && webpData.length > 100) {
                resolve(webpData);
                return;
              }
            } catch {
              // fallback to jpeg
            }

            const jpegData = canvas.toDataURL("image/jpeg", quality);
            resolve(jpegData || rawDataUrl);
          } catch {
            resolve(rawDataUrl);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } catch {
      clearTimeout(safetyTimer);
      resolve("");
    }
  });
}

/**
 * Uploads/processes an image file instantaneously from the user's computer:
 * Converts and optimizes it into a high-resolution, web-ready data URL
 * that is saved directly into the Firebase database without any external hosting.
 */
export async function uploadBannerImage(file: File): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG ou WEBP).");
  }

  // Optimize and process directly into web-ready format instantly
  const dataUrl = await compressImageToDataUrl(file);
  if (!dataUrl) {
    throw new Error("Não foi possível processar o arquivo de imagem selecionado.");
  }

  return {
    url: dataUrl,
    source: "data_url",
    fileName: file.name,
    fileSizeKb: Math.round(file.size / 1024),
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
