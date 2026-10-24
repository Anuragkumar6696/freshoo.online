"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MapPin, Search, X, Check, Navigation, Loader2, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface LocationSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceShow?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen = false,
  onClose,
  forceShow = false,
}) => {
  const {
    locations,
    selectedLocation,
    selectLocation,
    captureGeoLocation,
    addLocation,
    serviceability,
    selectedFranchise,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    label?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!selectedLocation && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setInternalOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation]);

  const active = forceShow || isOpen || internalOpen;

  const handleClose = () => {
    if (!selectedLocation) {
      return;
    }
    setInternalOpen(false);
    setDetectError(null);
    setDetectedCoords(null);
    if (onClose) onClose();
  };

  const handleSelect = (loc: string) => {
    selectLocation(loc);
    setInternalOpen(false);
    setDetectError(null);
    setDetectedCoords(null);
    if (onClose) onClose();
  };

  const handleDetectLocation = async () => {
    setDetecting(true);
    setDetectError(null);
    setDetectedCoords(null);

    const geo = await captureGeoLocation();
    setDetecting(false);

    if (!geo || geo.latitude === null || geo.longitude === null) {
      setDetectError(
        "We couldn't access your location. Please check location permissions in your browser or select your area below."
      );
      return;
    }

    const realLabel =
      geo.addressLabel ||
      `GPS: ${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`;

    setDetectedCoords({
      lat: geo.latitude,
      lng: geo.longitude,
      accuracy: geo.accuracy ?? 0,
      label: realLabel,
    });

    if (!locations.includes(realLabel)) {
      addLocation(realLabel);
    }
    handleSelect(realLabel);
  };

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh] mx-3 sm:mx-4 border border-stone-100"
          >
            {selectedLocation && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Close location selector"
              >
                <X size={18} />
              </button>
            )}

            <div className="text-center mb-5 mt-1">
              <div className="inline-flex p-3 rounded-full bg-red-50 text-brand-primary mb-2.5">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Choose Delivery Location
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Fresh meat & seafood delivered within our 15 km hub freshness radius in Ghaziabad & Delhi.
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                placeholder="Search sector, colony or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-red-100 outline-none transition-all text-xs font-medium text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className={`w-full flex items-center justify-center gap-2 py-2.5 mb-4 font-semibold rounded-xl text-xs border transition-all cursor-pointer ${
                detecting
                  ? "bg-stone-50 text-stone-400 border-stone-200 cursor-wait"
                  : "bg-red-50 hover:bg-red-100/70 text-brand-primary border-red-200"
              }`}
            >
              {detecting ? (
                <>
                  <Loader2 size={15} className="animate-spin text-brand-primary" />
                  Detecting precise coordinates…
                </>
              ) : (
                <>
                  <Navigation size={15} />
                  Detect My Location Automatically (GPS)
                </>
              )}
            </button>

            {detectError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <span>{detectError}</span>
              </div>
            )}

            {detectedCoords && (
              <div className="mb-4 p-3 bg-red-50/70 border border-red-200 text-brand-primary text-xs rounded-xl">
                <div className="flex items-center gap-1.5 font-bold text-brand-primary">
                  <Check size={14} />
                  <span>Location Verified</span>
                </div>
                <div className="mt-1 text-stone-700 font-medium">
                  {detectedCoords.label}
                </div>
                {serviceability && (
                  <div className="mt-1.5 text-[11px] font-semibold text-brand-primary">
                    {serviceability.message}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 pb-1">
                Supported Delivery Localities
              </p>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => handleSelect(loc)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-primary bg-red-50/50 text-brand-primary font-semibold"
                          : "border-stone-100 hover:border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin
                          size={16}
                          className={isSelected ? "text-brand-primary" : "text-stone-400"}
                        />
                        <div>
                          <p className="text-xs font-semibold text-stone-800">
                            {loc.split(",")[0]}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {loc.split(",").slice(1).join(", ").trim() || "Delhi NCR"}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-brand-primary text-white">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-5 text-stone-500">
                  <p className="text-xs font-semibold">Location not in quick list</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    You can type your full street address directly during checkout.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-center text-[11px] text-stone-500 font-medium">
              Active Hubs: Ghaziabad (Siddharth Vihar) & Delhi (Rohini Sector 22) within 15 km.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
