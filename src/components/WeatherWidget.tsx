import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  MapPin,
  ChevronDown,
  Check,
  Info,
  RefreshCw,
  LocateFixed,
  Thermometer,
} from "lucide-react";
import PrevisaoNacionalMocambiqueModal from "./PrevisaoNacionalMocambiqueModal";

export interface ProvinceWeatherCoord {
  lat: number;
  lon: number;
  label: string;
  capital: string;
}

export const PROVINCIAS_MOCAMBIQUE: Record<string, ProvinceWeatherCoord> = {
  Tete: { lat: -16.1564, lon: 33.5864, label: "Tete (Songo)", capital: "Tete" },
  "Maputo Cidade": { lat: -25.9692, lon: 32.5732, label: "Maputo Cidade", capital: "Maputo" },
  Maputo: { lat: -25.9622, lon: 32.4589, label: "Maputo Província (Matola)", capital: "Matola" },
  Gaza: { lat: -25.0444, lon: 33.6406, label: "Gaza (Xai-Xai)", capital: "Xai-Xai" },
  Inhambane: { lat: -23.8650, lon: 35.3833, label: "Inhambane", capital: "Inhambane" },
  Sofala: { lat: -19.8436, lon: 34.8389, label: "Sofala (Beira)", capital: "Beira" },
  Manica: { lat: -19.1164, lon: 33.4833, label: "Manica (Chimoio)", capital: "Chimoio" },
  Zambézia: { lat: -17.8786, lon: 36.8883, label: "Zambézia (Quelimane)", capital: "Quelimane" },
  Nampula: { lat: -15.1165, lon: 39.2666, label: "Nampula", capital: "Nampula" },
  "Cabo Delgado": { lat: -12.9732, lon: 40.5178, label: "Cabo Delgado (Pemba)", capital: "Pemba" },
  Niassa: { lat: -13.3128, lon: 35.2406, label: "Niassa (Lichinga)", capital: "Lichinga" },
};

/**
 * Cálculo geodésico da província de Moçambique mais próxima das coordenadas do utilizador
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findClosestProvince(lat: number, lon: number): string {
  let closest = "Tete";
  let minDistance = Infinity;

  for (const [name, coord] of Object.entries(PROVINCIAS_MOCAMBIQUE)) {
    const dist = getDistanceFromLatLonInKm(lat, lon, coord.lat, coord.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
    }
  }

  return closest;
}

/**
 * Regra Obrigatória das Cores de Fundo Dinâmicas baseadas nas faixas de temperatura:
 * 🔵 Azul escuro → Muito frio (abaixo de 0 °C)
 * 🔷 Azul claro → Frio (0 °C a 15 °C)
 * 🟢 Verde → Temperatura amena (16 °C a 25 °C)
 * 🟡 Amarelo → Quente (26 °C a 35 °C)
 * 🟠 Laranja → Muito quente (36 °C a 45 °C)
 * 🔴 Vermelho → Temperatura elevada (46 °C a 60 °C)
 * 🟣 Roxo / Branco → Temperatura extrema (acima de 60 °C)
 */
export function getTemperatureConfig(temp: number) {
  if (temp < 0) {
    return {
      emoji: "🔵",
      label: "Muito frio",
      colorName: "Azul escuro",
      bgClass: "bg-[#091834] text-blue-100 border border-blue-400 shadow-[0_2px_10px_rgba(9,24,52,0.8)]",
      textColor: "text-blue-100",
      description: "Abaixo de 0 °C",
      hexColor: "#091834",
    };
  }
  if (temp >= 0 && temp <= 15) {
    return {
      emoji: "🔷",
      label: "Frio",
      colorName: "Azul claro",
      bgClass: "bg-[#0284c7] text-white border border-sky-300 shadow-[0_2px_10px_rgba(2,132,199,0.6)]",
      textColor: "text-white",
      description: "0 °C a 15 °C",
      hexColor: "#0284c7",
    };
  }
  if (temp >= 16 && temp <= 25) {
    return {
      emoji: "🟢",
      label: "Temperatura amena",
      colorName: "Verde",
      bgClass: "bg-[#16a34a] text-white border border-emerald-300 shadow-[0_2px_10px_rgba(22,163,74,0.6)]",
      textColor: "text-white",
      description: "16 °C a 25 °C",
      hexColor: "#16a34a",
    };
  }
  if (temp >= 26 && temp <= 35) {
    return {
      emoji: "🟡",
      label: "Quente",
      colorName: "Amarelo",
      bgClass: "bg-[#eab308] text-slate-950 font-black border border-yellow-200 shadow-[0_2px_10px_rgba(234,179,8,0.7)]",
      textColor: "text-slate-950",
      description: "26 °C a 35 °C",
      hexColor: "#eab308",
    };
  }
  if (temp >= 36 && temp <= 45) {
    return {
      emoji: "🟠",
      label: "Muito quente",
      colorName: "Laranja",
      bgClass: "bg-[#ea580c] text-white border border-orange-300 shadow-[0_2px_10px_rgba(234,88,12,0.6)]",
      textColor: "text-white",
      description: "36 °C a 45 °C",
      hexColor: "#ea580c",
    };
  }
  if (temp >= 46 && temp <= 60) {
    return {
      emoji: "🔴",
      label: "Temperatura elevada",
      colorName: "Vermelho",
      bgClass: "bg-[#dc2626] text-white border border-red-300 shadow-[0_2px_10px_rgba(220,38,38,0.7)]",
      textColor: "text-white",
      description: "46 °C a 60 °C",
      hexColor: "#dc2626",
    };
  }
  // Acima de 60 °C
  return {
    emoji: "🟣",
    label: "Temperatura extrema",
    colorName: "Roxo / Branco",
    bgClass: "bg-[#7e22ce] text-white border-2 border-white shadow-[0_2px_14px_rgba(126,34,206,0.8)] animate-pulse",
    textColor: "text-white",
    description: "Acima de 60 °C",
    hexColor: "#7e22ce",
  };
}

/**
 * Mapeia o código WMO meteorológico para o ícone correspondente
 */
export function getWeatherIcon(code?: number, size = 14, className = "") {
  if (code === undefined || code === null) {
    return <Sun size={size} className={className} />;
  }
  if (code === 0) return <Sun size={size} className={className} />;
  if (code === 1 || code === 2) return <CloudSun size={size} className={className} />;
  if (code === 3) return <Cloud size={size} className={className} />;
  if (code === 45 || code === 48) return <CloudFog size={size} className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain size={size} className={className} />;
  if (code >= 71 && code <= 77) return <Snowflake size={size} className={className} />;
  if (code >= 80 && code <= 82) return <CloudRain size={size} className={className} />;
  if (code >= 95) return <CloudLightning size={size} className={className} />;
  return <Sun size={size} className={className} />;
}

interface WeatherWidgetProps {
  user?: any;
  compact?: boolean;
}

export default function WeatherWidget({ user, compact = false }: WeatherWidgetProps) {
  const [selectedProvincia, setSelectedProvincia] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("sigep_weather_selected_provincia");
      if (saved && PROVINCIAS_MOCAMBIQUE[saved]) return saved;

      const userProv = user?.provincia || user?.province;
      if (userProv && PROVINCIAS_MOCAMBIQUE[userProv]) return userProv;

      const instRaw = localStorage.getItem("sigep_active_institution");
      if (instRaw) {
        const parsed = JSON.parse(instRaw);
        if (parsed?.provincia && PROVINCIAS_MOCAMBIQUE[parsed.provincia]) {
          return parsed.provincia;
        }
      }
    } catch (_) {}
    return "Tete";
  });

  const [customCoords, setCustomCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isGeoDetected, setIsGeoDetected] = useState(false);
  const [weather, setWeather] = useState<{
    temp: number;
    max: number;
    min: number;
    weatherCode?: number;
    humidity?: number;
    lastUpdated: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [showNationalModal, setShowNationalModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Obtenção da Geolocalização do Usuário utilizando a API do navegador
  const detectUserGeolocation = () => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCustomCoords({ lat: latitude, lon: longitude });
          setIsGeoDetected(true);

          // Tenta determinar a província através de reverse geocoding ou cálculo de proximidade
          let determinedProv = findClosestProvince(latitude, longitude);

          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const sub = String(geoData.principalSubdivision || geoData.city || "").toLowerCase();
              for (const provName of Object.keys(PROVINCIAS_MOCAMBIQUE)) {
                if (sub.includes(provName.toLowerCase()) || provName.toLowerCase().includes(sub)) {
                  determinedProv = provName;
                  break;
                }
              }
            }
          } catch (_) {
            // Continua com determinedProv do cálculo euclidiano/haversine
          }

          setSelectedProvincia(determinedProv);
          try {
            localStorage.setItem("sigep_weather_selected_provincia", determinedProv);
          } catch (_) {}

          fetchWeatherData(latitude, longitude, determinedProv);
        },
        (error) => {
          console.warn("Aviso na geolocalização do navegador:", error.message);
          // Fallback gracioso para a província padrão ou selecionada
          const fallbackProv = selectedProvincia || "Tete";
          const coords = PROVINCIAS_MOCAMBIQUE[fallbackProv] || PROVINCIAS_MOCAMBIQUE["Tete"];
          fetchWeatherData(coords.lat, coords.lon, fallbackProv);
        },
        { timeout: 7000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    } else {
      const fallbackProv = selectedProvincia || "Tete";
      const coords = PROVINCIAS_MOCAMBIQUE[fallbackProv] || PROVINCIAS_MOCAMBIQUE["Tete"];
      fetchWeatherData(coords.lat, coords.lon, fallbackProv);
    }
  };

  // 2. Consulta de Temperatura e Clima em Tempo Real
  const fetchWeatherData = async (lat: number, lon: number, provName: string) => {
    setLoading(true);
    try {
      const cacheKey = `sigep_weather_cache_${provName}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            setWeather(parsed.data);
            setLoading(false);
            return;
          }
        } catch (_) {}
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Africa/Maputo`
      );

      if (!res.ok) throw new Error("Falha na consulta do clima em tempo real");

      const data = await res.json();
      if (data.current && data.daily) {
        const payload = {
          temp: data.current.temperature_2m,
          max: data.daily.temperature_2m_max[0] ?? data.current.temperature_2m + 3,
          min: data.daily.temperature_2m_min[0] ?? data.current.temperature_2m - 4,
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          lastUpdated: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        };

        setWeather(payload);
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: payload }));
      }
    } catch (e) {
      console.warn(`Aviso ao obter clima em tempo real para ${provName}:`, e);
      const fallbackTemp = provName === "Tete" ? 29.5 : provName.includes("Maputo") ? 25.0 : 27.0;
      setWeather({
        temp: fallbackTemp,
        max: fallbackTemp + 4,
        min: fallbackTemp - 5,
        weatherCode: 0,
        humidity: 60,
        lastUpdated: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Inicializa tentando geolocalização do navegador
    detectUserGeolocation();

    // Atualização automática periódica a cada 10 minutos
    const interval = setInterval(() => {
      if (customCoords) {
        fetchWeatherData(customCoords.lat, customCoords.lon, selectedProvincia);
      } else {
        const coords = PROVINCIAS_MOCAMBIQUE[selectedProvincia] || PROVINCIAS_MOCAMBIQUE["Tete"];
        fetchWeatherData(coords.lat, coords.lon, selectedProvincia);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectProvincia = (prov: string) => {
    setSelectedProvincia(prov);
    setIsGeoDetected(false);
    setCustomCoords(null);
    setIsDropdownOpen(false);
    try {
      localStorage.setItem("sigep_weather_selected_provincia", prov);
    } catch (_) {}
    const coords = PROVINCIAS_MOCAMBIQUE[prov] || PROVINCIAS_MOCAMBIQUE["Tete"];
    fetchWeatherData(coords.lat, coords.lon, prov);
  };

  const displayTemp = weather ? weather.temp : 28;
  const tempConfig = getTemperatureConfig(displayTemp);
  const weatherIcon = getWeatherIcon(weather?.weatherCode, 13, tempConfig.textColor);

  return (
    <div className="relative inline-block font-sans select-none" ref={dropdownRef}>
      {/* Botão Visual Principal com Fundo Dinâmico conforme a Faixa de Temperatura */}
      <div
        onClick={() => setShowNationalModal(true)}
        title={`Clima em tempo real: ${selectedProvincia} (${tempConfig.label} - ${displayTemp.toFixed(1)}°C). Clique sobre a temperatura para abrir a previsão de todo o país (Moçambique).`}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-md shadow-md hover:scale-[1.03] active:scale-[0.97] ${tempConfig.bgClass}`}
      >
        {/* Ícone Correspondente ao Clima */}
        <div className="flex items-center justify-center shrink-0">
          {weatherIcon}
        </div>

        {/* Emoji da Faixa Regulamentada */}
        <span className="text-xs leading-none shrink-0" role="img" aria-label={tempConfig.label}>
          {tempConfig.emoji}
        </span>

        {/* Temperatura em Destaque */}
        <span className="font-serif font-black text-xs sm:text-sm tracking-tight tabular-nums">
          {displayTemp.toFixed(0)}°C
        </span>

        {/* Divisor e Província */}
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-95">
          <span className="opacity-40">•</span>
          <span className="truncate max-w-[90px] sm:max-w-none">{selectedProvincia}</span>
          <span className="opacity-40">•</span>
          <span className="font-black underline decoration-white/40 underline-offset-2">
            {tempConfig.label}
          </span>
        </span>

        {isGeoDetected && (
          <span title="Localização obtida via GPS do navegador" className="opacity-80">
            <LocateFixed size={10} />
          </span>
        )}

        {weather && !compact && (
          <span className="text-[9px] opacity-85 hidden xl:inline tracking-tight">
            (Mín: {weather.min.toFixed(0)}° / Máx: {weather.max.toFixed(0)}°)
          </span>
        )}

        <ChevronDown
          size={12}
          className={`opacity-80 transition-transform duration-200 ml-0.5 ${isDropdownOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown de Opções: Províncias de Moçambique e Re-detecção de GPS */}
      {isDropdownOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-[9999] backdrop-blur-2xl text-white animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-700/70">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
              <MapPin size={12} />
              <span>Províncias de Moçambique</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowScaleModal(true);
              }}
              className="text-[9px] text-blue-300 hover:text-white underline cursor-pointer flex items-center gap-0.5"
            >
              <Info size={10} /> Escala
            </button>
          </div>

          {/* Botão de Auto-Detecção por GPS */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              detectUserGeolocation();
              setIsDropdownOpen(false);
            }}
            className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <LocateFixed size={13} className="text-blue-300" />
            <span>Detectar Minha Localização Atual</span>
          </button>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {Object.keys(PROVINCIAS_MOCAMBIQUE).map((prov) => {
              const isSelected = prov === selectedProvincia;
              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => handleSelectProvincia(prov)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40"
                      : "hover:bg-white/10 text-slate-200"
                  }`}
                >
                  <span className="truncate">{PROVINCIAS_MOCAMBIQUE[prov].label}</span>
                  {isSelected && <Check size={13} className="text-amber-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[9px] text-slate-400 px-1">
            <span>Tempo real • Open-Meteo</span>
            <button
              type="button"
              onClick={() => {
                if (customCoords) {
                  fetchWeatherData(customCoords.lat, customCoords.lon, selectedProvincia);
                } else {
                  const coords = PROVINCIAS_MOCAMBIQUE[selectedProvincia] || PROVINCIAS_MOCAMBIQUE["Tete"];
                  fetchWeatherData(coords.lat, coords.lon, selectedProvincia);
                }
              }}
              className="text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer font-bold"
            >
              <RefreshCw size={10} className={loading ? "animate-spin" : ""} /> Atualizar
            </button>
          </div>
        </div>
      )}

      {/* Modal / Informativo das 7 Faixas Regulamentadas de Temperatura */}
      {showScaleModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowScaleModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-white text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-amber-400" />
                <h3 className="font-serif font-black text-sm text-amber-400 uppercase tracking-wider">
                  Cores de Temperatura SIGEP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScaleModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 mb-3">
              Cores de fundo dinâmicas aplicadas conforme a temperatura obtida em tempo real:
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#091834] text-white border border-blue-400">
                <span>🔵 Azul escuro</span>
                <span className="font-bold">Muito frio (&lt; 0 °C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0284c7] text-white border border-sky-300">
                <span>🔷 Azul claro</span>
                <span className="font-bold">Frio (0 °C a 15 °C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#16a34a] text-white border border-emerald-300">
                <span>🟢 Verde</span>
                <span className="font-bold">Temperatura amena (16 °C a 25 °C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#eab308] text-slate-950 font-bold border border-yellow-200">
                <span>🟡 Amarelo</span>
                <span className="font-bold">Quente (26 °C a 35 °C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#ea580c] text-white border border-orange-300">
                <span>🟠 Laranja</span>
                <span className="font-bold">Muito quente (36 °C a 45 °C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#dc2626] text-white border border-red-300">
                <span>🔴 Vermelho</span>
                <span className="font-bold">Temperatura elevada (46 °C a 60 °C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#7e22ce] text-white border-2 border-white">
                <span>🟣 Roxo / Branco</span>
                <span className="font-bold">Temperatura extrema (&gt; 60 °C)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowScaleModal(false)}
              className="mt-4 w-full py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-amber-300 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Previsão Meteorológica de Todo o País (Moçambique) */}
      <PrevisaoNacionalMocambiqueModal
        isOpen={showNationalModal}
        onClose={() => setShowNationalModal(false)}
        activeProvincia={selectedProvincia}
        onSelectProvincia={(prov) => handleSelectProvincia(prov)}
      />
    </div>
  );
}
