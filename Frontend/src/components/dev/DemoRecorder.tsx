import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Download, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type TourStep = { path: string; label: string; hold: number };

// Build steps from env with sane defaults
const buildStepsFromEnv = (): TourStep[] => {
  const defaultPaths = ["/", "/matches", "/dashboard", "/session-room"];
  const defaultHolds = [3500, 4000, 4500, 3500];
  const tourRaw = (import.meta as any).env?.VITE_DEMO_TOUR as string | undefined;
  const holdsRaw = (import.meta as any).env?.VITE_DEMO_HOLDS as string | undefined;
  const labelsRaw = (import.meta as any).env?.VITE_DEMO_TOUR_LABELS as string | undefined;

  const paths = tourRaw
    ? tourRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : defaultPaths;

  const holds = holdsRaw
    ? holdsRaw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n > 0)
    : defaultHolds;

  const labels = labelsRaw
    ? labelsRaw
        .split(",")
        .map((s) => s.trim())
    : [];

  // If lengths mismatch, fall back to defaults to avoid runtime surprises
  if (paths.length === 0) return defaultPaths.map((p, i) => ({ path: p, label: autoLabel(p), hold: defaultHolds[i] || 3500 }));
  if (holds.length && holds.length !== paths.length) return defaultPaths.map((p, i) => ({ path: p, label: autoLabel(p), hold: defaultHolds[i] || 3500 }));
  if (labels.length && labels.length !== paths.length) return paths.map((p, i) => ({ path: p, label: autoLabel(p), hold: holds[i] || defaultHolds[i] || 3500 }));

  return paths.map((p, i) => ({
    path: p,
    label: labels[i] || autoLabel(p),
    hold: holds[i] || defaultHolds[i] || 3500,
  }));
};

const autoLabel = (path: string): string => {
  if (!path || path === "/") return "Home";
  const seg = path.replace(/^\//, "").split("/")[0];
  return seg
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};

const DemoRecorder: React.FC = () => {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const stepsRef = useRef<TourStep[]>(buildStepsFromEnv());

  const startRecording = useCallback(async () => {
    try {
      // Rebuild steps in case env values changed between reloads
      stepsRef.current = buildStepsFromEnv();
      setDownloadUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
      // Countdown 3..2..1
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        // eslint-disable-next-line no-await-in-loop
        await sleep(800);
      }
      setCountdown(null);

      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: { frameRate: 60 },
        audio: false,
      } as any;
      const stream = await (navigator.mediaDevices as any).getDisplayMedia(
        displayMediaOptions
      );
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType:
          (MediaRecorder as any).isTypeSupported?.("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm;codecs=vp8",
        videoBitsPerSecond: 8000000,
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setRecording(false);
        // Stop tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // timeslice
      setRecording(true);

      // Run scripted tour
      for (let i = 0; i < stepsRef.current.length; i++) {
        setCurrentStep(i);
        navigate(stepsRef.current[i].path);
        // eslint-disable-next-line no-await-in-loop
        await sleep(stepsRef.current[i].hold);
      }

      // Final hold on last screen and then stop
      await sleep(1200);
      mediaRecorder.stop();
    } catch (err) {
      console.error("Recording error", err);
      setRecording(false);
      setCountdown(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [navigate]);

  const stopRecording = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [downloadUrl]);

  return (
    <div className="fixed z-[70] bottom-4 right-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#25282c] bg-[#0b0c0d]/90 backdrop-blur p-3 shadow-lg w-72"
      >
        <div className="flex items-center gap-2 text-white mb-2">
          <Film className="w-4 h-4 text-[#00ef68]" />
          <span className="font-semibold text-sm">Demo Recorder (dev)</span>
        </div>

        <div className="text-xs text-white/70 mb-3">
          Shares this tab via browser prompt and auto-tours key pages to create a demo.
        </div>

        <div className="flex items-center gap-2">
          {!recording ? (
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#00ef68] text-[#0b0c0d] text-sm font-semibold hover:opacity-90"
            >
              <Play className="w-4 h-4" /> Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-500 text-white text-sm font-semibold hover:opacity-90"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}

          {downloadUrl && !recording && (
            <a
              href={downloadUrl}
              download="devswap-demo.webm"
              className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/20 text-white/90 text-sm hover:bg-white/10"
            >
              <Download className="w-4 h-4" /> Save
            </a>
          )}
        </div>

        <AnimatePresence>
          {countdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-center text-white/80"
            >
              Recording starts in {countdown}…
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {recording && currentStep !== null && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3 text-xs text-white/70"
            >
              Navigating: {steps[currentStep].label}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 text-[10px] text-white/50">
          Tip: Convert to MP4: ffmpeg -i devswap-demo.webm -c:v libx264 -crf 18 -preset veryslow -c:a aac demo.mp4
        </div>
      </motion.div>
    </div>
  );
};

export default DemoRecorder;
