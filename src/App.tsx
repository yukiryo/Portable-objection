import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from './lib/utils';
import { CHARACTERS } from './data';
import { useAudioCache } from './hooks/useAudioCache';
import { useDeviceMotion } from './hooks/useDeviceMotion';
import { ControlPanel } from './components/ControlPanel';
import { ObjectionDisplay } from './components/ObjectionDisplay';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  // --- State ---
  const [selectedCharId, setSelectedCharId] = useState(() => localStorage.getItem('igiari_char') || 'cbt');
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => localStorage.getItem('igiari_vol') || 'igiari');
  const [threshold, setThreshold] = useState(() => parseFloat(localStorage.getItem('igiari_lmd') || '5'));
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isMouseMode, setIsMouseMode] = useState(false);
  const cooldownRef = useRef(false); // Ref for synchronous access in event listeners
  const [isLoading, setIsLoading] = useState(true);

  const [triggerCount, setTriggerCount] = useState(0);
  const [maxAcceleration, setMaxAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [autoMusic, setAutoMusic] = useState(() => localStorage.getItem('igiari_autom') === 'true');

  // --- Hooks ---
  const { playSound, clearCache, preloadAll, preloadProgress } = useAudioCache();
  const { isShaking, acceleration, requestPermission, permissionGranted } = useDeviceMotion(threshold);

  // Preload all audio files on app start
  useEffect(() => {
    const doPreload = async () => {
      await preloadAll();
      // Small delay for smooth transition
      setTimeout(() => setIsLoading(false), 300);
    };
    doPreload();
  }, [preloadAll]);

  // Show loading screen while preloading
  if (isLoading) {
    return <LoadingScreen progress={preloadProgress} />;
  }


  // --- Logic ---
  const handleCharChange = (id: string) => {
    setSelectedCharId(id);
    localStorage.setItem('igiari_char', id);
    const char = CHARACTERS.find(c => c.id === id);
    if (char && !char.validVoices.includes(selectedVoiceId)) {
      const defaultVoice = char.validVoices[0];
      setSelectedVoiceId(defaultVoice);
      localStorage.setItem('igiari_vol', defaultVoice);
    }
  };

  const handleVoiceChange = (id: string) => {
    setSelectedVoiceId(id);
    localStorage.setItem('igiari_vol', id);
  };

  const handleThresholdChange = (val: number) => {
    setThreshold(val);
    localStorage.setItem('igiari_lmd', val.toString());
  };

  const handleResetMax = () => {
    setMaxAcceleration({ x: 0, y: 0, z: 0 });
  };

  const handleAutoMusicChange = () => {
    setAutoMusic(prev => {
      const newVal = !prev;
      localStorage.setItem('igiari_autom', String(newVal));
      return newVal;
    });
  };

  // Update Max Acceleration
  useEffect(() => {
    setMaxAcceleration(prev => ({
      x: Math.abs(acceleration.x) > Math.abs(prev.x) ? acceleration.x : prev.x,
      y: Math.abs(acceleration.y) > Math.abs(prev.y) ? acceleration.y : prev.y,
      z: Math.abs(acceleration.z) > Math.abs(prev.z) ? acceleration.z : prev.z,
    }));
  }, [acceleration]);



  const executeObjection = useCallback(() => {
    // 1. Play Sound (reuses same audio element, auto-stops previous)
    const path = `sound/${selectedCharId}/${selectedVoiceId}.mp3`;
    playSound(path);

    // 2. Trigger Visual
    setTriggerCount(c => c + 1);

    // 3. Vibrate
    if (navigator.vibrate) navigator.vibrate(200);

    // 4. Auto Music (only trigger on first shake, not repeated)
    if (autoMusic && !cooldownRef.current) {
      cooldownRef.current = true;
      setTimeout(() => {
        const meting = document.querySelector("meting-js") as any;
        if (meting && meting.aplayer) {
          meting.aplayer.play();
        }
        // Reset after music started
        setTimeout(() => { cooldownRef.current = false; }, 5000);
      }, 800);
    }
  }, [selectedCharId, selectedVoiceId, playSound, autoMusic]);

  // Motion Trigger
  useEffect(() => {
    // The executeObjection now handles the check, so we just call it
    if (isShaking) {
      executeObjection();
    }
  }, [isShaking, executeObjection]);

  // Mouse Trigger
  useEffect(() => {
    if (!isMouseMode) return;

    const handleMouseMove = () => {
      executeObjection();
    };

    document.body.addEventListener('mousemove', handleMouseMove);
    return () => document.body.removeEventListener('mousemove', handleMouseMove);
  }, [isMouseMode, executeObjection]);

  // Double click to toggle UI
  const handleDoubleClick = () => {
    setIsUIHidden(prev => !prev);
  }

  // Auto Dark Mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial check
    handleChange();

    // Listener
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const imageSrc = `img/${selectedVoiceId}.png`;

  return (
    <div
      className={cn(
        "h-screen w-screen overflow-hidden relative select-none",
        "bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black"
      )}
      onDoubleClick={handleDoubleClick}
    >
      {/* Background decoration or info */}
      <div className={cn(
        "absolute top-8 left-0 w-full text-center pointer-events-none z-0 flex flex-col items-center justify-center",
        "transition-all duration-500",
        isUIHidden ? "opacity-0 -translate-y-10" : "opacity-100 translate-y-0"
      )}>
        <div className="flex items-center justify-center gap-3 pb-2">
          <img src="img/badge.png" className="h-8 w-auto object-contain drop-shadow-md" alt="Badge" />
          <img src="img/suishenyiyi_title.png" className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" alt="随身异议" />
        </div>
        <p className="text-[10px] tracking-widest text-slate-400 mt-1 uppercase opacity-60">Portable Objection</p>
      </div>

      <ObjectionDisplay
        imageSrc={imageSrc}
        triggerShake={triggerCount}
      />

      <ControlPanel
        selectedChar={selectedCharId}
        selectedVoice={selectedVoiceId}
        onCharChange={handleCharChange}
        onVoiceChange={handleVoiceChange}
        threshold={threshold}
        onThresholdChange={handleThresholdChange}
        onTestClick={executeObjection}
        onClearCache={clearCache}
        isHidden={isUIHidden}
        permissionGranted={permissionGranted}
        onRequestPermission={requestPermission}
        motionData={acceleration}
        isMouseMode={isMouseMode}
        onToggleMouseMode={() => setIsMouseMode(prev => !prev)}
        maxMotionData={maxAcceleration}
        onResetMax={handleResetMax}
        autoMusic={autoMusic}
        onAutoMusicChange={handleAutoMusicChange}
      />
    </div>
  )
}

export default App
