import { MonumentData } from "../types";

const CONTENT_API_URL = "https://script.google.com/macros/s/AKfycbxAk2pn4B-LuAXW2PXQoXgwR-Oxmd07j9pl8xDEghr7snij20AFqUDgXQ3GWHvK__Mpww/exec";

export const fetchContentData = async (): Promise<MonumentData | null> => {
  try {
    const response = await fetch(`${CONTENT_API_URL}?action=getContent`);
    if (!response.ok) throw new Error("Gagal mengambil data konten");

    const json = await response.json();
    
    // Handle struktur respons API (array flat atau object wrapper)
    let items = [];
    if (json.data && Array.isArray(json.data)) {
        items = json.data;
    } else if (Array.isArray(json)) {
        items = json;
    } else if (json.items && Array.isArray(json.items)) {
        items = json.items;
    }

    // Filter Khusus: Cari Item dengan Owner mengandung kata "yuda"
    const targetItem = items.find((item: any) => {
        const owner = item.Owner || item.owner || "";
        return String(owner).toLowerCase().includes('yuda');
    });

    if (!targetItem) {
        console.warn("Data YudaAR tidak ditemukan di API, menggunakan fallback.");
        return null;
    }

    // Mapping Data dari Spreadsheet ke Interface Aplikasi
    // Sesuai Screenshot: Judul, Lokasi, Isi_Konten, File_URL
    return {
        title: targetItem.Judul || targetItem.title || "Monumen Yudha Mandala",
        location: targetItem.Lokasi || targetItem.location || "Buleleng, Bali",
        // Isi_Konten dipetakan ke history dan description
        description: targetItem.Isi_Konten ? (targetItem.Isi_Konten.substring(0, 100) + "...") : "Monumen perjuangan rakyat Buleleng.",
        history: targetItem.Isi_Konten || targetItem.isi_konten || "Sejarah belum dimuat.",
        flipbookUrl: targetItem.File_URL || targetItem.file_url || "#"
    };

  } catch (error) {
    console.error("Content Fetch Error:", error);
    return null; // Return null agar UI menggunakan fallback/default
  }
};