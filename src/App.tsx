import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from './lib/utils';
import { CHARACTERS } from './data';
import { useAudioCache } from './hooks/useAudioCache';
import { useDeviceMotion } from './hooks/useDeviceMotion';
import { ControlPanel } from './components/ControlPanel';
import { ObjectionDisplay } from './components/ObjectionDisplay';

function App() {
  // --- State ---
  const [selectedCharId, setSelectedCharId] = useState(() => localStorage.getItem('igiari_char') || 'cbt');
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => localStorage.getItem('igiari_vol') || 'igiari');
  const [threshold, setThreshold] = useState(() => parseFloat(localStorage.getItem('igiari_lmd') || '5'));
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isMouseMode, setIsMouseMode] = useState(false);
  const cooldownRef = useRef(false); // Ref for synchronous access in event listeners

  const [triggerCount, setTriggerCount] = useState(0);
  const [maxAcceleration, setMaxAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [autoMusic, setAutoMusic] = useState(() => localStorage.getItem('igiari_autom') === 'true');

  // --- Hooks ---
  const { playSound, clearCache } = useAudioCache();
  const { isShaking, acceleration, requestPermission, permissionGranted } = useDeviceMotion(threshold);

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

  // Sync ref with state for React updates (optional, but good for hybrid use)
  useEffect(() => {
    // We handle cooldown logic centrally
  }, []);

  const executeObjection = useCallback(() => {
    if (cooldownRef.current) return;

    // 1. Lock
    cooldownRef.current = true;

    // 2. Play Sound
    const path = `sound/${selectedCharId}/${selectedVoiceId}.mp3`;
    playSound(path);

    // 3. Trigger Visual
    setTriggerCount(c => c + 1);

    // 4. Vibrate
    if (navigator.vibrate) navigator.vibrate(200);

    // 5. Auto Music
    if (autoMusic) {
      setTimeout(() => {
        const meting = document.querySelector("meting-js") as any;
        if (meting && meting.aplayer) {
          meting.aplayer.play();
        }
      }, 800); // 800ms delay to let the Shout finish
    }

    // 6. Unlock after delay
    setTimeout(() => {
      cooldownRef.current = false;
    }, 1300);

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
      <div className="absolute top-8 left-0 w-full text-center pointer-events-none z-0 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-3">
          <img src="img/badge.png" className="h-8 w-auto object-contain drop-shadow-md" alt="Badge" />
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent opacity-90 drop-shadow-sm">
            随身异议
          </h1>
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
