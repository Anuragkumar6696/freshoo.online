"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MapPin, Search, X, Check, Navigation, Loader2 } from "lucide-react";
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
  const { locations, selectedLocation, selectLocation, captureGeoLocation, addLocation } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

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
        "We couldn't access your location. Please ensure location permissions are enabled in your browser, or select an area from the list below."
      );
      return;
    }

    setDetectedCoords({
      lat: geo.latitude,
      lng: geo.longitude,
      accuracy: geo.accuracy ?? 0,
    });

    const approxLabel =
      geo.accuracy && geo.accuracy <= 300
        ? "Near Rohini Sector 22, Delhi (Precise)"
        : geo.accuracy && geo.accuracy <= 1200
        ? "Rohini / North West Delhi"
        : "Delhi NCR (Broad match)";

    if (!locations.includes(approxLabel)) {
      addLocation(approxLabel);
    }
    handleSelect(approxLabel);
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
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden mx-4"
          >
            {selectedLocation && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <div className="text-center mb-6 mt-2">
              <div className="inline-flex p-3 rounded-full bg-red-50 text-brand-primary mb-3">
                <MapPin size={28} className="animate-bounce" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-gray-900">
                Select Your Delivery Area
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                We currently deliver fresh cut meat and fish in select areas of Delhi.
              </p>
            </div>

            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search your sector, locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
              />
            </div>

            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className={`w-full flex items-center justify-center gap-2 py-3 mb-4 font-semibold rounded-xl text-sm border-dashed border transition-all cursor-pointer ${
                detecting
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-wait"
                  : "bg-red-50 hover:bg-red-100/80 text-brand-primary border-red-200"
              }`}
            >
              {detecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Detecting your exact location…
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  Use My Current Location
                </>
              )}
            </button>

            {detectError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-semibold rounded-xl leading-relaxed">
                {detectError}
              </div>
            )}

            {detectedCoords && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-xl">
                <div className="flex items-center gap-2">
                  <Check size={14} />
                  <span className="font-extrabold">GPS captured</span>
                </div>
                <div className="mt-1 text-emerald-600 font-medium">
                  {detectedCoords.lat.toFixed(4)}, {detectedCoords.lng.toFixed(4)}
                  <span className="opacity-70"> • ±{Math.round(detectedCoords.accuracy)}m</span>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => handleSelect(loc)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-primary bg-red-50/40 text-brand-primary shadow-sm"
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin
                          size={18}
                          className={isSelected ? "text-brand-primary" : "text-gray-400"}
                        />
                        <div>
                          <p className="font-semibold text-sm">
                            {loc.split(",")[0]}
                          </p>
                          <p className="text-xs text-gray-500">
                            {loc.split(",").slice(1).join(", ").trim()}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="p-1 rounded-full bg-brand-primary text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm font-semibold">No outlets in this area yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Stay tuned! We are expanding fast.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 text-center text-[11px] text-gray-400">
              *By choosing a location, product availability and custom delivery slots will update.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
