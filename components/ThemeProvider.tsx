"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
export default function ThemeProvider() {
  const path = usePathname();
  const [mode, setMode] = useState("auto"),
    [settings, setSettings] = useState<Record<string, string>>({});
  const [dark, setDark] = useState(false);
  useEffect(() => {
    function load() {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((d) => {
          if (d.settings && typeof d.settings === "object")
            setSettings(d.settings);
        })
        .catch(() => {});
    }
    load();
    const reset = () => setMode("auto");
    window.addEventListener("barbearia-settings", load);
    window.addEventListener("barbearia-theme-reset", reset);
    return () => {
      window.removeEventListener("barbearia-settings", load);
      window.removeEventListener("barbearia-theme-reset", reset);
    };
  }, []);
  useEffect(() => {
    try {
      setMode(localStorage.getItem("barbearia.theme.v1") || "auto");
    } catch {}
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    function apply() {
      const chosen = mode === "auto" ? settings.theme_mode || "auto" : mode;
      const isDark =
        chosen === "dark" ||
        (chosen === "system" && media.matches) ||
        (chosen === "auto" &&
          !path.startsWith("/admin") &&
          !path.startsWith("/cliente"));
      setDark(isDark);
      const root = document.documentElement;
      root.dataset.theme = isDark ? "dark" : "light";
      for (const [key, variable] of [
        ["primary_color", "--primary"],
        ["accent_color", "--accent"],
      ]) {
        const hex = settings[key];
        if (hex && /^#[\da-f]{6}$/i.test(hex)) {
          root.style.setProperty(variable, hex);
          const rgb = [1, 3, 5]
            .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
            .map((v) =>
              v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
            );
          const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
          root.style.setProperty(
            variable + "-ink",
            lum > 0.179 ? "#071426" : "#ffffff",
          );
        }
      }
    }
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode, settings, path]);
  return (
    <button
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      onClick={() => {
        const next = dark ? "light" : "dark";
        setMode(next);
        try {
          localStorage.setItem("barbearia.theme.v1", next);
        } catch {}
      }}
      className="theme-toggle fixed bottom-5 right-5 z-50 rounded-full border p-3 shadow-lg bg-white text-gray-900"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
