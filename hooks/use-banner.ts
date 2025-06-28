import { useCallback, useEffect, useState } from "react";

const BANNER_KEY = "grameenMartBanner";

export function useBanner() {
  const [banner, setBanner] = useState("");

  const load = useCallback(() => {
    const saved = localStorage.getItem(BANNER_KEY);
    setBanner(saved || "🎉 Special Offer: Free delivery on orders above ₹500! 🎉");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = (text: string) => {
    setBanner(text);
    localStorage.setItem(BANNER_KEY, text);
  };

  return { banner, setBanner: save, reload: load };
}
