import api from "./api";

export interface BrandingSettings {
  companyName?: string;
  tagline?: string;
  preparedBy?: string;
  website?: string;
  primaryColor?: string;
  logoBase64?: string;
}

export const brandingApi = {
  get: async (): Promise<BrandingSettings> => {
    const { data } = await api.get("/api/organizations/branding");
    return data.data as BrandingSettings;
  },

  update: async (settings: Omit<BrandingSettings, "logoBase64">): Promise<BrandingSettings> => {
    const { data } = await api.put("/api/organizations/branding", settings);
    return data.data as BrandingSettings;
  },

  uploadLogo: async (file: File): Promise<{ logoBase64: string }> => {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await api.post("/api/organizations/branding/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { logoBase64: string };
  },

  deleteLogo: async (): Promise<BrandingSettings> => {
    const { data } = await api.delete("/api/organizations/branding/logo");
    return data.data as BrandingSettings;
  },
};
