import { useState } from "react";
import { cn } from "../lib/utils";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectGroup {
    group: string;
    items: SelectOption[];
}

export interface CustomSelectProps {
    label: string;
    value: string;
    options: (SelectOption | SelectGroup)[];
    onChange: (val: string) => void;
}

export function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

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
                    "border border-transparent hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:outline-none",
                    isOpen ? "rounded-b-none ring-2 ring-red-500" : ""
                )}
            >
                <span className="truncate">{selectedOption?.label}</span>
                <span className="text-xs text-slate-400 pointer-events-none">▼</span>
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full max-h-60 overflow-y-auto z-50 bg-slate-100 dark:bg-slate-800 border border-t-0 border-red-500/30 rounded-b-lg shadow-xl scrollbar-hide">
                    {options.map((opt, idx) => {
                        if ('group' in opt) {
                            return (
                                <div key={opt.group || idx}>
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
                                                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold border-none"
                                                    : "hover:bg-red-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 hover:border-red-400"
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
                                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold"
                                            : "hover:bg-red-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
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
