import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GALLERY_DATA, type Frame } from './galleryData';
import { EntranceScene, CorridorScene, AtriumScene, TerraceScene } from './Scenes';
import { ParticleField, FilmGrain, GoldDivider, CandleIcon } from './ui';
import { soundscape } from './audio';

// ─── Mobile detection ────────────────────────────────────────────────────────
function useIsMobile() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Mobi|Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (window.innerWidth <= 768);
  }, []);
}

// ─── Swipe gesture hook ──────────────────────────────────────────────────────
function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 48
) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
      startX.current = null;
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);
}

// ─── Types ──────────────────────────────────────────────────────────────────
type Chapter = 1 | 2 | 3 | 4 | 5;

// ─── Soundscape & Audio Toggle ──────────────────────────────────────────────
function SoundToggle() {
  const [playing, setPlaying] = useState(soundscape.getActive());

  useEffect(() => {
    return soundscape.onStateChange((active) => setPlaying(active));
  }, []);

  const toggle = () => {
    soundscape.toggle();
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-5 right-6 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2A76F33] bg-[#12100Ecc] backdrop-blur-md text-[#E2A76F] hover:border-[#E2A76F88] transition-all cursor-pointer text-xs shadow-lg"
      title={playing ? "Mute Royal Soundscape" : "Play Royal Soundscape Ambience"}
    >
      <span className={playing ? "animate-pulse" : ""}>{playing ? '🔊' : '🔈'}</span>
      <span className="font-sans text-[10px] uppercase tracking-widest hidden sm:inline font-semibold">
        {playing ? 'Royal Music' : 'Play Music'}
      </span>
    </button>
  );
}

// ─── Chapter Progress & Quick Navigation ────────────────────────────────────
const CHAPTER_NAMES = [
  "The Arrival",
  "The Grand Entrance",
  "The Royal Gallery",
  "The Grand Ballroom",
  "The Starlit Terrace",
];

function ChapterNavigation({
  current,
  onSelect,
}: {
  current: Chapter;
  onSelect: (ch: Chapter) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      <div
        className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#E2A76F22] bg-[#12100Edd] backdrop-blur-md cursor-pointer hover:border-[#E2A76F55] transition-all"
        onClick={() => setExpanded(!expanded)}
        title="Click to jump to any chapter"
      >
        <span className="font-sans text-[9px] text-[#E2A76F88] tracking-widest uppercase mr-1">
          CH 0{current}
        </span>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i + 1 === current ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i + 1 === current ? '#E2A76F' : '#E2A76F33',
              transition: 'all 0.4s ease',
            }}
          />
        ))}
        <span className="text-[10px] text-[#E2A76F88] ml-1">▾</span>
      </div>

      {expanded && (
        <div
          className="mt-2 py-2 px-3 bg-[#181310f0] border border-[#E2A76F44] rounded-xl shadow-2xl backdrop-blur-xl flex flex-col gap-1 min-w-[220px] animate-fade-in"
          onMouseLeave={() => setExpanded(false)}
        >
          {CHAPTER_NAMES.map((name, i) => {
            const ch = (i + 1) as Chapter;
            const isCur = ch === current;
            return (
              <button
                key={ch}
                onClick={() => {
                  onSelect(ch);
                  setExpanded(false);
                }}
                className={`text-left px-3 py-1.5 rounded text-xs font-sans transition-all flex items-center justify-between ${
                  isCur ? 'bg-[#E2A76F22] text-[#E2A76F] font-semibold' : 'text-[#D4C5A9] hover:bg-[#E2A76F11]'
                }`}
              >
                <span>
                  <strong className="text-[#E2A76F88] mr-2">0{ch}</strong>
                  {name}
                </span>
                {isCur && <span className="text-[10px]">●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Scene Fade Overlay ─────────────────────────────────────────────────────
function SceneFade({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#12100E',
        zIndex: 200,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
        transition: 'opacity 0.85s ease',
      }}
    />
  );
}

// ============================================================
// CHAPTER 01: The Arrival & Apology
// ============================================================
function Chapter1({ onNext }: { onNext: () => void }) {
  const d = GALLERY_DATA.apology;
  const r = GALLERY_DATA.recipient;

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-end pb-12 sm:pb-16 px-4 pointer-events-none">
      <div
        className="animate-fade-in-up pointer-events-auto w-full max-w-[560px] rounded-2xl bg-gradient-to-b from-[#1E1418ee] via-[#160E12ee] to-[#100A0Dee] border border-[#E2A76F33] shadow-2xl backdrop-blur-xl p-8 sm:p-10 relative"
      >
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
          <CandleIcon flameSize={18} />
        </div>

        <p className="font-sans text-[10px] text-[#E2A76F99] tracking-[0.3em] uppercase text-center mb-1">
          {d.subheading}
        </p>

        <h3 className="font-serif text-center text-lg sm:text-xl text-[#F5EEDB88] italic mb-1">
          {r.honorific}
        </h3>
        <h1 className="font-serif text-center text-2xl sm:text-4xl font-semibold text-[#F5EEDB] tracking-wide mb-3 flex items-baseline justify-center gap-2">
          <span>{r.name}</span>
          {r.nickname && (
            <span className="text-xs sm:text-sm font-sans font-normal text-[#E2A76Fcc] tracking-normal italic">
              ({r.nickname})
            </span>
          )}
        </h1>

        <GoldDivider className="mb-4" />

        <p className="font-serif text-center text-sm sm:text-[15px] leading-relaxed text-[#D4C5A9] whitespace-pre-line max-h-[38vh] overflow-y-auto px-2">
          {d.body}
        </p>

        <div className="flex justify-center mt-7">
          <button
            className="btn-gallery"
            onClick={() => {
              soundscape.start();
              onNext();
            }}
          >
            <span>✦</span>
            {d.ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHAPTER 02: The Grand Threshold
// ============================================================
function Chapter2({
  onNext,
  doorsOpen,
  setDoorsOpen,
}: {
  onNext: () => void;
  doorsOpen: boolean;
  setDoorsOpen: (v: boolean) => void;
}) {
  const handleOpen = () => {
    if (doorsOpen) return;
    soundscape.start();
    soundscape.playFootstep();
    setDoorsOpen(true);
    setTimeout(onNext, 1800);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4">
      {/* 2D Double Gates Interaction */}
      <div
        className="pointer-events-auto relative w-56 h-72 cursor-pointer mb-6"
        onClick={handleOpen}
        title="Click to push open the palace gates"
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(160deg, #2E1B22, #180F13)',
            border: '1px solid #E2A76F44',
            borderRight: 'none',
            transformOrigin: 'left center',
            animation: doorsOpen ? 'door-swing-left 1.6s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 10,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#FFE082] shadow-[0_0_8px_#C9A84C]" />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(160deg, #180F13, #2E1B22)',
            border: '1px solid #E2A76F44',
            borderLeft: 'none',
            transformOrigin: 'right center',
            animation: doorsOpen ? 'door-swing-right 1.6s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 10,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#FFE082] shadow-[0_0_8px_#C9A84C]" />
        </div>
      </div>

      <div className="animate-fade-in-up text-center">
        <p className="chapter-badge mb-2">Chapter 02 / 05 — The Grand Entrance</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EEDB] mb-2">
          {GALLERY_DATA.threshold.heading}
        </h2>
        <p className="font-serif text-[#D4C5A9] text-base mb-6">
          {GALLERY_DATA.threshold.subheading}
        </p>

        {!doorsOpen ? (
          <button className="btn-gallery pointer-events-auto animate-pulse-glow" onClick={handleOpen}>
            ✦ {GALLERY_DATA.threshold.ctaLabel}
          </button>
        ) : (
          <p className="font-serif animate-fade-in text-[#E2A76F] text-sm tracking-widest uppercase">
            The palace doors swing inward… Welcome, Your Highness…
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CHAPTER 03: The Royal Gallery
// ============================================================
interface FrameModalProps {
  frame: Frame;
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

function FrameModal({ frame, idx, total, onPrev, onNext, onClose }: FrameModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset states whenever the frame changes
  useEffect(() => {
    setActiveImageIdx(0);
    setVideoError(false);
    setIsMuted(true);
  }, [frame.id]);

  // Duck background music when viewing a video memory
  useEffect(() => {
    if (frame.videoUrl) {
      soundscape.duck();
    }
    return () => {
      soundscape.unduck();
    };
  }, [frame.videoUrl]);

  const allImages = frame.images && frame.images.length > 0 ? frame.images : [frame.photoUrl];
  const currentPhoto = allImages[activeImageIdx] || frame.photoUrl;

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  return (
    <div className="card-overlay" onClick={onClose}>
      <div className="card-inner rounded-2xl max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#E2A76F88] hover:text-[#E2A76F] text-2xl leading-none transition-colors"
          aria-label="Close story"
        >
          ✕
        </button>

        <p className="chapter-badge mb-2">
          Chapter 03 / 05 — Royal Exhibit 0{idx + 1} of 0{total}
        </p>

        {/* Media Container: Supports live video memories, portrait photo, or multi-photo carousel */}
        <div className="w-full mb-3 overflow-hidden rounded-xl border border-[#E2A76F44] relative bg-[#0E0B09] flex items-center justify-center shadow-inner min-h-[220px]">
          {frame.videoUrl ? (
            <div className="relative w-full flex items-center justify-center">
              {!videoError ? (
                <>
                  <video
                    ref={videoRef}
                    key={frame.videoUrl}
                    src={frame.videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    preload="auto"
                    poster={frame.photoUrl}
                    className="max-h-[380px] max-w-full object-contain mx-auto rounded"
                    onError={() => setVideoError(true)}
                  />
                  {/* Floating Sound Toggle Pill */}
                  <button
                    onClick={toggleSound}
                    className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-[#12100Eee] hover:bg-[#E2A76F] hover:text-[#12100E] border border-[#E2A76F88] text-xs font-sans text-[#FAF4E6] flex items-center gap-1.5 shadow-xl transition-all pointer-events-auto cursor-pointer z-10"
                    title={isMuted ? 'Click to enable audio' : 'Click to mute audio'}
                  >
                    <span>{isMuted ? '🔇' : '🔊'}</span>
                    <span className="font-medium tracking-wide">
                      {isMuted ? 'Unmute Audio' : 'Audio On'}
                    </span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <img
                    src={frame.photoUrl}
                    alt={frame.title}
                    className="max-h-[320px] object-contain rounded mb-3"
                  />
                  <a
                    href={frame.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gallery !px-4 !py-2 text-xs"
                  >
                    ▶ Open Video in Player
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full flex items-center justify-center">
              <img
                src={currentPhoto}
                alt={frame.photoAlt || frame.title}
                className="max-h-[360px] max-w-full object-contain mx-auto rounded"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#12100Ecc] hover:bg-[#E2A76F] hover:text-[#12100E] border border-[#E2A76F55] text-[#F5EEDB] flex items-center justify-center text-sm transition-all shadow-lg pointer-events-auto cursor-pointer"
                    title="Previous Photo"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#12100Ecc] hover:bg-[#E2A76F] hover:text-[#12100E] border border-[#E2A76F55] text-[#F5EEDB] flex items-center justify-center text-sm transition-all shadow-lg pointer-events-auto cursor-pointer"
                    title="Next Photo"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#12100Eee] via-[#12100E88] to-transparent p-3.5 flex justify-between items-end pointer-events-none">
            <span className="font-sans text-xs text-[#E2A76F] font-semibold tracking-wider drop-shadow-md">
              {frame.date}
            </span>
            <span className="text-xs text-[#F5EEDBcc] font-serif italic drop-shadow-md">
              {frame.videoUrl
                ? '🎬 Live Video Memory'
                : allImages.length > 1
                ? `✦ Photo 0${activeImageIdx + 1} of 0${allImages.length}`
                : 'Framed in Gold'}
            </span>
          </div>
        </div>

        {/* Thumbnail Selector Strip for multi-image collections */}
        {allImages.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-3.5 overflow-x-auto py-1">
            {allImages.map((imgUrl, imgIdx) => (
              <button
                key={imgIdx}
                onClick={() => setActiveImageIdx(imgIdx)}
                className={`w-11 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImageIdx === imgIdx
                    ? 'border-[#E2A76F] scale-105 shadow-[0_0_12px_#E2A76Faa]'
                    : 'border-[#E2A76F33] opacity-60 hover:opacity-100'
                }`}
                title={`View photo ${imgIdx + 1}`}
              >
                <img src={imgUrl} alt={`Thumbnail ${imgIdx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <h3 className="font-serif text-2xl font-semibold text-[#F5EEDB] mb-0.5">
          {frame.title}
        </h3>
        {frame.subtitle && (
          <p className="text-xs text-[#E2A76Faa] font-serif italic mb-1">
            {frame.subtitle}
          </p>
        )}
        <p className="text-xs text-[#E2A76F] font-sans tracking-widest uppercase mb-3 font-semibold">
          {frame.year}
        </p>

        <GoldDivider className="mb-4" />

        <p className="font-serif text-sm sm:text-base leading-relaxed text-[#D4C5A9] whitespace-pre-line pr-1">
          {frame.story}
        </p>

        {/* Original Heartfelt Raw Words from May 26, 2024 */}
        {frame.rawNote && (
          <div className="mt-4 p-4 rounded-xl bg-[#E2A76F0f] border border-[#E2A76F3a] text-xs sm:text-sm font-serif italic text-[#FFE082ee] leading-relaxed shadow-md">
            <div className="flex items-center justify-between text-[10px] uppercase font-sans tracking-widest text-[#E2A76Faa] not-italic mb-1.5 font-semibold">
              <span>✦ Direct Words for Mehak</span>
              <span>{frame.date}</span>
            </div>
            "{frame.rawNote}"
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E2A76F1a] gap-2">
          <button
            className="btn-gallery !px-4 !py-2 text-xs"
            onClick={onPrev}
            disabled={idx === 0}
            style={{ opacity: idx === 0 ? 0.3 : 1 }}
          >
            ← PREVIOUS
          </button>

          <button
            onClick={onClose}
            className="font-sans text-xs text-[#E2A76Faa] hover:text-[#E2A76F] tracking-wider uppercase underline underline-offset-4"
          >
            Keep Walking
          </button>

          <button
            className="btn-gallery !px-4 !py-2 text-xs"
            onClick={onNext}
            disabled={idx === total - 1}
            style={{ opacity: idx === total - 1 ? 0.3 : 1 }}
          >
            NEXT →
          </button>
        </div>
      </div>
    </div>
  );
}

function Chapter3Controls({
  walkZ,
  setWalkZ,
  activeFrameIndex,
  setActiveFrameIndex,
  onComplete,
}: {
  walkZ: number;
  setWalkZ: React.Dispatch<React.SetStateAction<number>>;
  activeFrameIndex: number | null;
  setActiveFrameIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onComplete: () => void;
}) {
  const frames = GALLERY_DATA.frames;
  const isMobile = useIsMobile();

  const stepForward = useCallback(() => {
    setActiveFrameIndex(null);
    setWalkZ((z) => Math.max(z - 3.2, -46.0));
    soundscape.playFootstep(true);
  }, [setActiveFrameIndex, setWalkZ]);

  const stepBackward = useCallback(() => {
    setActiveFrameIndex(null);
    setWalkZ((z) => Math.min(z + 3.2, 3.5));
    soundscape.playFootstep(true);
  }, [setActiveFrameIndex, setWalkZ]);

  // Swipe left = walk forward (deeper into gallery), swipe right = walk back
  useSwipe(
    useCallback(() => { if (activeFrameIndex === null) stepForward(); }, [activeFrameIndex, stepForward]),
    useCallback(() => { if (activeFrameIndex === null) stepBackward(); }, [activeFrameIndex, stepBackward])
  );

  const focusFrame = (index: number) => {
    setActiveFrameIndex(index);
    const frameZ = -index * 4.5 - 2;
    setWalkZ(frameZ);
    soundscape.playFootstep(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeFrameIndex !== null) {
        if (e.key === 'Escape') setActiveFrameIndex(null);
        if (e.key === 'ArrowRight' && activeFrameIndex < frames.length - 1) focusFrame(activeFrameIndex + 1);
        if (e.key === 'ArrowLeft' && activeFrameIndex > 0) focusFrame(activeFrameIndex - 1);
        return;
      }
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        stepForward();
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        stepBackward();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (activeFrameIndex !== null) return;
      if (e.deltaY > 20) {
        setWalkZ((z) => Math.max(z - 1.5, -46.0));
        soundscape.playFootstep(false);
      } else if (e.deltaY < -20) {
        setWalkZ((z) => Math.min(z + 1.5, 3.5));
        soundscape.playFootstep(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeFrameIndex, stepForward, stepBackward, setWalkZ]);

  const progressPct = Math.round(
    Math.min(100, Math.max(0, ((3.5 - walkZ) / (3.5 - (-46.0))) * 100))
  );

  return (
    <>
      <div className="fixed top-14 left-6 z-30 pointer-events-none hidden sm:block">
        <p className="chapter-badge">Chapter 03 / 05 — The Royal Gallery</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-28 h-1 bg-[#E2A76F22] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E2A76F] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#E2A76F88] font-mono">{progressPct}%</span>
        </div>
      </div>

      <div className="fixed bottom-6 inset-x-0 z-30 flex flex-col items-center pointer-events-none px-4">
        {walkZ <= -40.5 && (
          <div className="animate-fade-in-up pointer-events-auto mb-4">
            <button
              onClick={onComplete}
              className="btn-gallery !px-8 !py-3.5 bg-[#E2A76F1a] border-[#E2A76F] shadow-[0_0_30px_#E2A76F44] text-[#FAF4E6] animate-pulse-glow"
            >
              ✦ STEP INTO THE GRAND BALLROOM ›
            </button>
          </div>
        )}

        {/* Floating Tap-to-Inspect Exhibit Pill */}
        {activeFrameIndex === null && (
          <div className="animate-fade-in-up pointer-events-auto mb-2.5">
            <button
              onClick={() => {
                const nearIdx = Math.min(
                  frames.length - 1,
                  Math.max(0, Math.round((-walkZ - 2) / 4.5))
                );
                focusFrame(nearIdx);
              }}
              className="px-4 py-2 rounded-full bg-[#181316ee] hover:bg-[#E2A76F2a] active:bg-[#E2A76F44] border border-[#E2A76F88] text-[#F5EEDB] text-xs font-sans flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all font-medium cursor-pointer"
            >
              <span className="text-[#C9A84C]">✦</span>
              <span>
                Open Exhibit 0{Math.min(frames.length, Math.max(1, Math.round((-walkZ - 2) / 4.5) + 1))}:{' '}
                {frames[Math.min(frames.length - 1, Math.max(0, Math.round((-walkZ - 2) / 4.5)))]?.title}
              </span>
              <span className="text-[#E2A76F] font-bold">›</span>
            </button>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 rounded-full bg-[#161014f0] border border-[#E2A76F3a] shadow-2xl backdrop-blur-md">
          <button
            onClick={stepBackward}
            className="px-2.5 sm:px-3 py-2 rounded-full text-xs font-sans text-[#D4C5A9] hover:text-[#E2A76F] hover:bg-[#E2A76F1a] active:bg-[#E2A76F2a] transition-all flex items-center gap-1 min-w-[40px] justify-center"
            title="Walk Backward (S or Down Arrow)"
          >
            <span>▼</span>
            <span className="inline text-[11px] sm:text-xs">Back</span>
          </button>

          <div className="w-[1px] h-4 bg-[#E2A76F22]" />

          <button
            onClick={() => {
              const currentNear = Math.min(
                frames.length - 1,
                Math.max(0, Math.round((-walkZ - 2) / 4.5))
              );
              const prev = activeFrameIndex !== null ? activeFrameIndex - 1 : currentNear - 1;
              if (prev >= 0) focusFrame(prev);
              else focusFrame(0);
            }}
            className="px-2 sm:px-2.5 py-2 rounded-full text-xs text-[#E2A76F] hover:bg-[#E2A76F1a] active:bg-[#E2A76F2a] transition-all min-w-[36px] justify-center flex items-center"
            title="Inspect Previous Exhibit"
          >
            ⏮<span className="hidden sm:inline ml-1">Prev</span>
          </button>

          <button
            onClick={() => {
              const currentNear = Math.min(
                frames.length - 1,
                Math.max(0, Math.round((-walkZ - 2) / 4.5))
              );
              const next = activeFrameIndex !== null ? activeFrameIndex + 1 : currentNear;
              if (next < frames.length) focusFrame(next);
              else onComplete();
            }}
            className="px-2 sm:px-2.5 py-2 rounded-full text-xs text-[#E2A76F] hover:bg-[#E2A76F1a] active:bg-[#E2A76F2a] transition-all min-w-[36px] justify-center flex items-center font-semibold"
            title="Inspect Next Exhibit"
          >
            <span className="hidden sm:inline mr-1">Next</span>⏭
          </button>

          <div className="w-[1px] h-4 bg-[#E2A76F22]" />

          <button
            onClick={stepForward}
            className="px-3 sm:px-3.5 py-2 rounded-full text-xs font-sans bg-[#E2A76F22] text-[#F5EEDB] hover:bg-[#E2A76F3a] active:bg-[#E2A76F44] border border-[#E2A76F44] transition-all flex items-center gap-1 font-semibold min-w-[40px] justify-center"
            title="Walk Forward (W or Up Arrow or Scroll)"
          >
            <span>▲</span>
            <span className="text-[11px] sm:text-xs">Forward</span>
          </button>
        </div>

        {isMobile ? (
          <p className="font-serif text-xs text-[#E2A76F66] mt-2 tracking-wider">
            Swipe left/right to walk • Tap a frame to view
          </p>
        ) : (
          <p className="font-serif text-xs text-[#E2A76F88] mt-2.5 tracking-wider hidden sm:block">
            Use <kbd className="px-1 py-0.5 border border-[#E2A76F33] rounded text-[10px]">W</kbd> / <kbd className="px-1 py-0.5 border border-[#E2A76F33] rounded text-[10px]">S</kbd> or Scroll to walk • Click any painting in 3D to inspect
          </p>
        )}
      </div>

      <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2.5 pointer-events-auto">
        <span className="text-[9px] uppercase tracking-widest text-[#E2A76F66] text-center font-sans mb-1 hidden sm:block">
          Gallery
        </span>
        {frames.map((f, i) => {
          const isSelected = activeFrameIndex === i;
          return (
            <button
              key={f.id}
              onClick={() => focusFrame(i)}
              className="group relative transition-transform hover:scale-105"
              title={`${f.year}: ${f.title}`}
            >
              <div
                style={{
                  width: 52,
                  height: 38,
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: isSelected ? '2px solid #E2A76F' : '1px solid #E2A76F33',
                  boxShadow: isSelected ? '0 0 12px #E2A76F66' : 'none',
                }}
              >
                <img src={f.photoUrl} alt={f.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute right-16 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-[#181310f0] border border-[#E2A76F44] text-[11px] text-[#F5EEDB] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                <span className="text-[#E2A76F] font-bold mr-1.5">{f.year}</span>
                {f.title}
              </div>
            </button>
          );
        })}
      </div>

      {activeFrameIndex !== null && (
        <FrameModal
          frame={frames[activeFrameIndex]}
          idx={activeFrameIndex}
          total={frames.length}
          onPrev={() => focusFrame(Math.max(0, activeFrameIndex - 1))}
          onNext={() => {
            if (activeFrameIndex === frames.length - 1) {
              setActiveFrameIndex(null);
              onComplete();
            } else {
              focusFrame(activeFrameIndex + 1);
            }
          }}
          onClose={() => setActiveFrameIndex(null)}
        />
      )}
    </>
  );
}

// ============================================================
// CHAPTER 04: The Grand Ballroom / Atrium
// ============================================================
function PlaqueModal({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const d = GALLERY_DATA.plaque;

  return (
    <>
      {!open ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center pb-16 pointer-events-none px-4">
          <div className="animate-fade-in-up pointer-events-auto text-center">
            <p className="chapter-badge mb-1">Chapter 04 / 05 — The Grand Ballroom</p>
            <p className="font-serif italic text-[#FFE082] text-sm sm:text-base mb-2">
              "{d.banner}"
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EEDB] mb-4">
              {d.heading}
            </h2>
            <button className="btn-gallery animate-pulse-glow" onClick={() => setOpen(true)}>
              ✦ READ THE GOLDEN PLAQUE
            </button>
          </div>
        </div>
      ) : (
        <div className="card-overlay" onClick={() => setOpen(false)}>
          <div className="card-inner rounded-2xl max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 text-[#E2A76F88] hover:text-[#E2A76F] text-2xl leading-none"
            >
              ✕
            </button>

            <p className="chapter-badge mb-1">Chapter 04 / 05 — The Grand Ballroom</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EEDB] mb-1">
              {d.heading}
            </h2>
            <p className="font-serif text-sm text-[#E2A76Faa] mb-2">{d.subheading}</p>
            <p className="font-serif text-xs italic text-[#FFE082bb] mb-4">
              "{d.banner}"
            </p>

            <GoldDivider className="mb-6" />

            <div className="space-y-4 max-h-[46vh] overflow-y-auto pr-2">
              {d.points.map((pt, i) => (
                <div
                  key={i}
                  className="animate-fade-in-up flex items-start gap-3.5"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-[#C9A84C] text-lg mt-0.5 flex-shrink-0">{pt.icon}</span>
                  <div>
                    <h4 className="font-sans text-xs sm:text-sm font-semibold text-[#F5EEDB] tracking-wider uppercase mb-1">
                      {pt.label}
                    </h4>
                    <p className="font-serif text-sm leading-relaxed text-[#D4C5A9]">
                      {pt.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <GoldDivider className="mt-6 mb-6" />

            <div className="flex justify-center">
              <button className="btn-gallery" onClick={onComplete}>
                {d.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// CHAPTER 05: The Royal Keepsake Studio & Download
// ============================================================

// High-resolution Canvas generator for Royal Keepsake Polaroid
function generateAndDownloadKeepsake(
  honorific: string,
  name: string,
  nickname: string,
  subtitle: string,
  date: string,
  quote: string,
  imgSrc: string
) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Parchment
  ctx.fillStyle = '#FAF5E8';
  ctx.fillRect(0, 0, 900, 1200);

  // Elegant double gold borders
  ctx.strokeStyle = '#C9A84C';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, 828, 1128);

  ctx.strokeStyle = '#E8D28A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(46, 46, 808, 1108);

  // Corner floral accents
  ctx.fillStyle = '#C9A84C';
  ctx.font = '24px serif';
  ctx.fillText('✦', 64, 76);
  ctx.fillText('✦', 836, 76);
  ctx.fillText('✦', 64, 1130);
  ctx.fillText('✦', 836, 1130);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    // Draw portrait
    const imgX = 85;
    const imgY = 90;
    const imgW = 730;
    const imgH = 730;
    ctx.drawImage(img, imgX, imgY, imgW, imgH);

    // Inner gold frame around photo
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // ── Draw Royal Sparkling Diamond Tiara Crown on portrait ──
    const cx = 450;
    const cy = 200;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 230, 140, 0.9)';
    ctx.shadowBlur = 18;

    // Crown Base Band
    ctx.beginPath();
    ctx.ellipse(cx, cy + 45, 130, 22, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFDF73';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Crown Peaks & Arches
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 40);
    ctx.quadraticCurveTo(cx - 90, cy - 20, cx - 60, cy + 10);
    ctx.quadraticCurveTo(cx - 30, cy - 65, cx, cy - 80); // Center tall spire
    ctx.quadraticCurveTo(cx + 30, cy - 65, cx + 60, cy + 10);
    ctx.quadraticCurveTo(cx + 90, cy - 20, cx + 120, cy + 40);
    ctx.strokeStyle = '#FFE68A';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Sparkling Diamonds / Jewels on Spire Tips
    const jewels = [
      [cx, cy - 80, 10],
      [cx - 60, cy - 30, 8],
      [cx + 60, cy - 30, 8],
      [cx - 100, cy + 5, 7],
      [cx + 100, cy + 5, 7],
    ];

    jewels.forEach(([jx, jy, r]) => {
      ctx.beginPath();
      ctx.arc(jx, jy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#FFDF73';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();

    // ── Typography ──────────────────────────────────────────
    ctx.textAlign = 'center';

    // Honorific, Name & Nickname
    ctx.fillStyle = '#26151B';
    ctx.font = 'italic 35px "Cormorant Garamond", serif';
    const titleText = nickname ? `${honorific}, ${name} (${nickname})` : `${honorific}, ${name}`;
    ctx.fillText(titleText, 450, 900);

    // Subtitle
    ctx.fillStyle = '#8B6A2D';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle.toUpperCase(), 450, 940);

    // Decorative Divider
    ctx.fillStyle = '#C9A84C';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✦   ✦   ✦', 450, 980);

    // Keepsake Quote
    ctx.fillStyle = '#423226';
    ctx.font = 'italic 20px "Cormorant Garamond", serif';
    ctx.fillText(quote, 450, 1030);

    // Date
    ctx.fillStyle = '#8B7340';
    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(date, 450, 1085);

    // Trigger instant browser download
    const link = document.createElement('a');
    link.download = `princess-mehak-royal-keepsake.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  img.src = imgSrc;
}

function KeepsakeModal({ onBack }: { onBack: () => void }) {
  const d = GALLERY_DATA.letter;
  const r = GALLERY_DATA.recipient;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    generateAndDownloadKeepsake(
      r.honorific,
      r.name,
      r.nickname || '',
      r.subtitle,
      d.keepsakeDate,
      d.keepsakeNote,
      r.keepsakePhoto
    );
    setTimeout(() => setDownloading(false), 800);
  };

  return (
    <div className="card-overlay" onClick={onBack}>
      <div className="card-inner rounded-2xl max-w-lg text-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onBack}
          className="absolute top-5 right-5 text-[#E2A76F88] hover:text-[#E2A76F] text-2xl"
        >
          ✕
        </button>

        <p className="chapter-badge mb-2">Royal Keepsake Souvenir</p>

        {/* Vintage Royal Polaroid Card with Sparkling Tiara */}
        <div className="inline-block bg-[#FAF5E8] p-4 sm:p-5 pb-7 sm:pb-8 shadow-2xl rounded-sm mb-5 relative border border-[#E8D28A] mx-auto">
          {/* Inner Photo Frame */}
          <div className="w-64 sm:w-72 aspect-square relative overflow-hidden rounded-sm border border-[#C9A84C] bg-[#1A1215]">
            <img
              src={r.keepsakePhoto}
              alt={r.name}
              className="w-full h-full object-cover"
            />

            {/* 👑 SVG Royal Sparkling Diamond & Gold Crown Tiara */}
            <div className="absolute top-2 inset-x-0 flex justify-center pointer-events-none drop-shadow-[0_4px_12px_rgba(255,223,115,0.85)] animate-pulse">
              <svg width="170" height="90" viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Crown Arches */}
                <path d="M15 85 Q50 30 75 60 Q100 10 125 60 Q150 30 185 85" stroke="#FFE68A" strokeWidth="5" strokeLinecap="round" />
                {/* Base Band */}
                <path d="M10 88 Q100 105 190 88" stroke="#FFDF73" strokeWidth="6" strokeLinecap="round" />
                {/* Center Spire Peak */}
                <circle cx="100" cy="18" r="9" fill="#FFFFFF" stroke="#FFDF73" strokeWidth="3" />
                <circle cx="65" cy="42" r="7" fill="#FFFFFF" stroke="#FFDF73" strokeWidth="2.5" />
                <circle cx="135" cy="42" r="7" fill="#FFFFFF" stroke="#FFDF73" strokeWidth="2.5" />
                <circle cx="32" cy="65" r="5.5" fill="#FFFFFF" stroke="#FFDF73" strokeWidth="2" />
                <circle cx="168" cy="65" r="5.5" fill="#FFFFFF" stroke="#FFDF73" strokeWidth="2" />
                {/* Sparkling Cross Spark */}
                <path d="M100 9 L100 27 M91 18 L109 18" stroke="#FFF7CC" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#26151B] mt-4 flex items-baseline justify-center gap-1.5">
            <span>{r.honorific}, {r.name}</span>
            {r.nickname && (
              <span className="text-xs font-sans font-normal text-[#8B6A2D] italic">
                ({r.nickname})
              </span>
            )}
          </h3>
          <p className="font-sans text-[10px] text-[#8B6A2D] font-bold tracking-widest uppercase mt-0.5">
            {r.subtitle}
          </p>
          <p className="font-serif text-xs text-[#523E30] mt-1 italic">
            {d.keepsakeDate}
          </p>
        </div>

        <p className="font-serif text-sm italic leading-relaxed text-[#D4C5A9] px-4 mb-6">
          {d.keepsakeNote}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            className="btn-gallery !px-6 !py-2.5 text-xs bg-[#E2A76F22] border-[#E2A76F] font-bold"
            onClick={handleDownload}
            disabled={downloading}
          >
            👑 {downloading ? 'GENERATING SOUVENIR…' : 'DOWNLOAD SOUVENIR (.PNG)'}
          </button>
          <button className="btn-gallery !px-5 !py-2.5 text-xs" onClick={onBack}>
            ← BACK TO TERRACE
          </button>
        </div>
      </div>
    </div>
  );
}

function LetterModal({
  onClose,
  onWalkAgain,
  onOpenKeepsake,
}: {
  onClose: () => void;
  onWalkAgain: () => void;
  onOpenKeepsake: () => void;
}) {
  const d = GALLERY_DATA.letter;
  const r = GALLERY_DATA.recipient;
  const [sealBroken, setSealBroken] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const breakSeal = () => {
    setSealBroken(true);
    setTimeout(() => setRevealed(true), 650);
  };

  return (
    <div className="card-overlay" onClick={onClose}>
      <div className="card-inner rounded-2xl max-w-xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#E2A76F88] hover:text-[#E2A76F] text-2xl leading-none"
        >
          ✕
        </button>

        {!revealed ? (
          <div className="text-center py-6">
            <p className="chapter-badge mb-5">Chapter 05 / 05 — The Sealed Letter</p>

            {/* Authentic Crimson Monogram Wax Seal */}
            <div
              onClick={breakSeal}
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full cursor-pointer select-none mb-6 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_28px_#A31C1Caa] bg-gradient-to-br from-[#D32F2F] via-[#941515] to-[#4A0606] border-2 border-[#FFA3A333] ${
                sealBroken ? 'animate-[wax-crack_0.6s_ease_forwards]' : 'animate-pulse-glow'
              }`}
              title="Click to break the royal wax seal"
            >
              <span className="font-serif text-3xl font-bold text-[#FFE68A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                {r.waxSealMonogram}
              </span>
            </div>

            <p className="font-serif text-[#D4C5A9] text-base mb-6">
              A crimson wax seal stamped with <strong className="text-[#FFE082]">"{r.waxSealMonogram}"</strong> holds this letter.
            </p>

            <button className="btn-gallery" onClick={breakSeal}>
              OPEN THE ENVELOPE
            </button>
          </div>
        ) : (
          <div className="animate-[letter-open_0.8s_ease_both]">
            <p className="chapter-badge mb-2">Chapter 05 / 05 — The Closing Letter</p>
            <p className="font-sans text-xs text-[#E2A76Faa] tracking-widest uppercase mb-4">
              {d.senderDate}
            </p>

            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#F5EEDB] italic mb-3">
              {d.salutation}
            </h3>

            <GoldDivider className="mb-5" />

            <div className="space-y-4 max-h-[46vh] overflow-y-auto pr-2">
              {d.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-serif text-sm sm:text-[15px] leading-relaxed text-[#D4C5A9] whitespace-pre-line"
                >
                  {p}
                </p>
              ))}
            </div>

            <GoldDivider className="my-5" />

            <p className="font-serif text-sm italic text-[#D4C5A9] mb-1">{d.closing}</p>
            <p className="font-serif text-base font-semibold text-[#E2A76F]">{d.signature}</p>

            <div className="flex flex-wrap gap-3 mt-7 pt-2">
              <button className="btn-gallery !px-4 !py-2.5 text-xs" onClick={onOpenKeepsake}>
                👑 TRY ON YOUR CROWN
              </button>
              <button className="btn-gallery !px-4 !py-2.5 text-xs" onClick={onClose}>
                CLOSE LETTER
              </button>
              <button className="btn-gallery !px-4 !py-2.5 text-xs" onClick={onWalkAgain}>
                ↺ WALK PALACE AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chapter5({ onWalkAgain }: { onWalkAgain: () => void }) {
  const [showLetter, setShowLetter] = useState(false);
  const [showKeepsake, setShowKeepsake] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-end pb-14 px-4 pointer-events-none">
        <div className="animate-fade-in-up pointer-events-auto text-center max-w-lg">
          <p className="chapter-badge mb-2">Chapter 05 / 05 — The Starlit Terrace</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F5EEDB] mb-4">
            Under the full moon, a wax-sealed letter waits on the marble bistro table.
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="btn-gallery animate-pulse-glow" onClick={() => setShowLetter(true)}>
              ✉ OPEN THE ENVELOPE
            </button>
            {openedOnce && (
              <>
                <button className="btn-gallery" onClick={() => setShowKeepsake(true)}>
                  👑 TRY ON YOUR CROWN
                </button>
                <button className="btn-gallery" onClick={onWalkAgain}>
                  ↺ WALK AGAIN
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLetter && (
        <LetterModal
          onClose={() => {
            setShowLetter(false);
            setOpenedOnce(true);
          }}
          onWalkAgain={() => {
            setShowLetter(false);
            onWalkAgain();
          }}
          onOpenKeepsake={() => {
            setShowLetter(false);
            setOpenedOnce(true);
            setShowKeepsake(true);
          }}
        />
      )}

      {showKeepsake && <KeepsakeModal onBack={() => setShowKeepsake(false)} />}
    </>
  );
}

// ============================================================
// 3D CANVAS MANAGER
// ============================================================
function SceneCanvas({
  chapter,
  doorsOpen,
  walkZ,
  activeFrameIndex,
  onSelectFrame,
}: {
  chapter: Chapter;
  doorsOpen: boolean;
  walkZ: number;
  activeFrameIndex: number | null;
  onSelectFrame: (idx: number) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0, touchAction: 'none' }}
      dpr={isMobile ? 1 : [1, 1.5]}
      camera={{ fov: 64, near: 0.1, far: 120, position: [0, 0.6, 2.8] }}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
        precision: isMobile ? 'mediump' : 'highp',
      }}
    >
      <Suspense fallback={null}>
        {(chapter === 1 || chapter === 2) && <EntranceScene doorsOpen={doorsOpen} />}
        {chapter === 3 && (
          <CorridorScene
            walkZ={walkZ}
            activeFrameIndex={activeFrameIndex}
            onSelectFrame={onSelectFrame}
          />
        )}
        {chapter === 4 && <AtriumScene />}
        {chapter === 5 && <TerraceScene />}

        {(chapter === 1 || chapter === 4 || chapter === 5) && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            target={chapter === 5 ? [0, 0.8, -3.5] : [0, 0.4, 0]}
            autoRotate={chapter === 5}
            autoRotateSpeed={0.08}
            minAzimuthAngle={chapter === 5 ? -Math.PI / 2.2 : undefined}
            maxAzimuthAngle={chapter === 5 ? Math.PI / 2.2 : undefined}
            maxPolarAngle={Math.PI / 2.02}
            minPolarAngle={Math.PI / 3.4}
          />
        )}
      </Suspense>
    </Canvas>
  );
}

// ============================================================
// ROOT APP COMPONENT
// ============================================================
export default function App() {
  const [chapter, setChapter] = useState<Chapter>(1);
  const [fading, setFading] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);

  const [walkZ, setWalkZ] = useState(3.0);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number | null>(null);

  const transitionTo = useCallback((to: Chapter) => {
    setFading(true);
    setTimeout(() => {
      setChapter(to);
      if (to === 3) {
        setWalkZ(3.0);
        setActiveFrameIndex(null);
      }
      if (to === 1) {
        setDoorsOpen(false);
      }
      setFading(false);
    }, 850);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#12100E] overflow-hidden select-none">
      <SceneCanvas
        chapter={chapter}
        doorsOpen={doorsOpen}
        walkZ={walkZ}
        activeFrameIndex={activeFrameIndex}
        onSelectFrame={(idx) => setActiveFrameIndex(idx)}
      />

      <ParticleField count={20} />
      <FilmGrain />

      <SoundToggle />
      <ChapterNavigation current={chapter} onSelect={transitionTo} />

      <div className="fixed top-5 left-6 z-20 pointer-events-none hidden sm:block">
        <p className="font-serif text-[11px] text-[#E2A76F55] tracking-[0.25em] uppercase">
          {GALLERY_DATA.title}
        </p>
      </div>

      <SceneFade visible={fading} />

      {chapter === 1 && (
        <Chapter1 onNext={() => transitionTo(2)} />
      )}

      {chapter === 2 && (
        <Chapter2
          onNext={() => transitionTo(3)}
          doorsOpen={doorsOpen}
          setDoorsOpen={setDoorsOpen}
        />
      )}

      {chapter === 3 && (
        <Chapter3Controls
          walkZ={walkZ}
          setWalkZ={setWalkZ}
          activeFrameIndex={activeFrameIndex}
          setActiveFrameIndex={setActiveFrameIndex}
          onComplete={() => transitionTo(4)}
        />
      )}

      {chapter === 4 && (
        <PlaqueModal onComplete={() => transitionTo(5)} />
      )}

      {chapter === 5 && (
        <Chapter5 onWalkAgain={() => transitionTo(1)} />
      )}
    </div>
  );
}
