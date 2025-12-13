import { motion } from "framer-motion";
import React from "react";

import { CHARACTERS, VOICES } from "../data";
import { cn } from "../lib/utils";

interface ControlPanelProps {
    selectedChar: string;
    selectedVoice: string;
    onCharChange: (id: string) => void;
    onVoiceChange: (id: string) => void;
    threshold: number;
    onThresholdChange: (val: number) => void;
    onTestClick: () => void;
    onClearCache: () => void;
    isHidden: boolean;
    permissionGranted: boolean;
    onRequestPermission: () => void;
    onToggleMouseMode?: () => void;
    isMouseMode?: boolean;
    motionData: { x: number, y: number, z: number };
    maxMotionData?: { x: number, y: number, z: number };
    onResetMax?: () => void;
    autoMusic?: boolean;
    onAutoMusicChange?: () => void;
}

export function ControlPanel({
    selectedChar,
    selectedVoice,
    onCharChange,
    onVoiceChange,
    threshold,
    onThresholdChange,
    onTestClick,
    onClearCache,
    isHidden,
    permissionGranted,
    onRequestPermission,
    motionData,
    onToggleMouseMode,
    isMouseMode = false,
    maxMotionData,
    onResetMax,
    autoMusic,
    onAutoMusicChange
}: ControlPanelProps) {

    const activeChar = CHARACTERS.find(c => c.id === selectedChar) || CHARACTERS[0];
    const validVoices = activeChar.validVoices;

    return (
        <div className={cn(
            "fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px]",
            "bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-2xl p-6 pb-2 shadow-xl border border-white/20 z-[100]",
            "transition-all duration-500 transform",
            isHidden ? "translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"
        )}
            onDoubleClick={(e) => e.stopPropagation()}
        >

            {/* 1. Grid for Selectors (Primary Config) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <CustomSelect
                    label="角色选择"
                    value={activeChar.id}
                    onChange={onCharChange}
                    options={CHARACTERS.map(c => ({ value: c.id, label: c.name }))}
                />

                <CustomSelect
                    label="语音台词"
                    value={selectedVoice}
                    onChange={onVoiceChange}
                    options={[
                        { group: "日语 (Japanese)", items: validVoices.map(id => VOICES[id]).filter(v => v?.lang === 'jp').map(v => ({ value: v!.id, label: v!.label })) },
                        { group: "中文 (Chinese)", items: validVoices.map(id => VOICES[id]).filter(v => v?.lang === 'cn').map(v => ({ value: v!.id, label: v!.label })) },
                        { group: "英语 (English)", items: validVoices.map(id => VOICES[id]).filter(v => v?.lang === 'en').map(v => ({ value: v!.id, label: v!.label })) },
                    ].filter(g => g.items.length > 0)}
                />
            </div>

            {/* 2. Sensitivity Slider (Tuning) */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                    <label>灵敏度阈值 (越小越灵敏)</label>
                    <span>{threshold.toFixed(1)}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.5"
                    value={threshold}
                    onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 relative z-10"
                />
                {/* Custom Ticks */}
                <div className="flex justify-between w-full px-[2px] -mt-1 mb-1">
                    {[1, 10, 20, 30, 40].map((tick) => (
                        <div key={tick} className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 select-none">{tick}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Action Buttons Row (Controls) */}
            <div className="flex items-center gap-3 mb-4">
                {/* PC Mouse Toggle (Small, left) */}
                {onToggleMouseMode && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleMouseMode}
                        className={cn(
                            "h-14 px-3 rounded-xl font-bold text-xs shadow-sm shadow-blue-500/10 transition-colors flex flex-col items-center justify-center min-w-[60px]",
                            isMouseMode
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        )}
                    >
                        <span>🖱️</span>
                        <span className="mt-0.5">{isMouseMode ? "开启" : "关闭"}</span>
                    </motion.button>
                )}

                {/* Test Button (Main, Grow) */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={onTestClick}
                    className="h-14 flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 text-lg tracking-widest flex items-center justify-center gap-2"
                >
                    <span>👉</span> 点击测试
                </motion.button>

                {/* Clear Cache (Small, right) */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        if (window.confirm("确定要清空音频缓存吗？清空后需要重新加载音频")) {
                            onClearCache();
                            alert("清空完成！");
                        }
                    }}
                    className="h-14 w-14 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors border border-slate-200 flex items-center justify-center"
                    title="清空缓存"
                >
                    🗑️
                </motion.button>
            </div>

            {/* 4. Bottom Info Panel (Status) */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                {/* Sensor Data */}
                <div className="flex justify-between items-start text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <div className="space-y-1">
                        <div>G-Force: {motionData.x.toFixed(2)}, {motionData.y.toFixed(2)}, {motionData.z.toFixed(2)}</div>
                        {maxMotionData && (
                            <div className="text-slate-400">
                                Max-G: {maxMotionData.x.toFixed(2)}, {maxMotionData.y.toFixed(2)}, {maxMotionData.z.toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Reset & Perms */}
                    <div className="flex flex-col items-end gap-1">
                        {onResetMax && maxMotionData && (
                            <button
                                onClick={onResetMax}
                                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-[10px] transition-colors"
                            >
                                重置Max
                            </button>
                        )}
                        {!permissionGranted && (
                            <button onClick={onRequestPermission} className="text-blue-500 underline decoration-dashed">
                                iOS授权
                            </button>
                        )}
                    </div>
                </div>

                {/* Auto Music Toggle */}
                {onAutoMusicChange && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <label htmlFor="autoMusic" className="text-[10px] text-slate-500 font-bold cursor-pointer select-none">
                            自动播放BGM
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={autoMusic}
                                onChange={onAutoMusicChange}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )}

                {/* Embedded Music Player */}
                <div className="mt-2">
                    {/* @ts-ignore */}
                    <meting-js
                        server="netease"
                        type="playlist"
                        id="9487616885"
                        fixed="false"
                        loop="one"
                        order="list"
                        preload="false"
                        list-folded="true"
                        list-max-height="200px"
                    />
                </div>
            </div>

            <div className="mt-2 text-[10px] text-center text-slate-400">
                双击空白区域可隐藏/显示控制面板。<br />
                Refactored by <a href="https://t.me/Yukiryo" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors font-bold">雪凌Yukiryo</a>
                <br />
                <a
                    href={`https://github.com/yukiryo/Portable-objection/commit/${__COMMIT_FULL_HASH__}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-600 transition-colors font-mono"
                >
                    {__COMMIT_HASH__}
                </a>
                {' · '}
                {new Date(__COMMIT_DATE__).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
            </div>

        </div>
    );
}

interface SelectOption {
    value: string;
    label: string;
}

interface SelectGroup {
    group: string;
    items: SelectOption[];
}

interface CustomSelectProps {
    label: string;
    value: string;
    options: (SelectOption | SelectGroup)[];
    onChange: (val: string) => void;
}

function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Flatten options to find selected label
    const allOptions = options.flatMap(o => 'group' in o ? o.items : [o]);
    const selectedOption = allOptions.find(o => o.value === value) || allOptions[0];

    return (
        <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</label>

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)}></div>
            )}

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-sm font-medium flex justify-between items-center transition-all",
                    "border border-transparent hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none",
                    isOpen ? "rounded-b-none ring-2 ring-blue-500" : ""
                )}
            >
                <span className="truncate">{selectedOption?.label}</span>
                <span className="text-xs text-slate-400 pointer-events-none">▼</span>
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full max-h-60 overflow-y-auto z-50 bg-slate-100 dark:bg-slate-800 border border-t-0 border-blue-500/30 rounded-b-lg shadow-xl scrollbar-hide">
                    {options.map((opt) => {
                        if ('group' in opt) {
                            return (
                                <div key={opt.group}>
                                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                                        {opt.group}
                                    </div>
                                    {opt.items.map(item => (
                                        <div
                                            key={item.value}
                                            onClick={() => {
                                                onChange(item.value);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "p-2 pl-4 text-sm cursor-pointer transition-colors border-l-2 border-transparent",
                                                item.value === value
                                                    ? "bg-blue-500 text-white font-bold border-none"
                                                    : "hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-400"
                                            )}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            );
                        } else {
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "p-2 text-sm cursor-pointer transition-colors",
                                        opt.value === value
                                            ? "bg-blue-500 text-white font-bold"
                                            : "hover:bg-blue-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                                    )}
                                >
                                    {opt.label}
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
}


