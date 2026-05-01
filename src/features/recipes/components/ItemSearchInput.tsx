import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "@/services/apiFetch";
import { loadMinecraftItems, type MinecraftItem } from "../services/minecraftRenderer";

interface CustomItem {
    id: string;
    name: string;
    category: string;
}

let customPromise: Promise<CustomItem[]> | null = null;

function loadCustom(): Promise<CustomItem[]> {
    if (!customPromise) {
        customPromise = apiFetch("/items")
            .then((r) => r.json())
            .then((j) => j.data as CustomItem[])
            .catch((e) => {
                customPromise = null;
                throw e;
            });
    }
    return customPromise;
}

interface Props {
    value: string;
    onChange: (id: string) => void;
    error?: boolean;
    placeholder?: string;
}

export default function ItemSearchInput({ value, onChange, error, placeholder }: Props) {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [vanillaItems, setVanillaItems] = useState<MinecraftItem[]>([]);
    const [customItems, setCustomItems] = useState<CustomItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        loadMinecraftItems()
            .then((items) => setVanillaItems(items))
            .catch(() => {})
            .finally(() => setLoading(false));

        loadCustom()
            .then((items) => setCustomItems(items))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                !containerRef.current?.contains(e.target as Node) &&
                !dropdownRef.current?.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const updatePos = useCallback(() => {
        if (!inputRef.current) return;
        const r = inputRef.current.getBoundingClientRect();
        setDropdownPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePos();
        const onScroll = () => updatePos();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", updatePos);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", updatePos);
        };
    }, [open, updatePos]);

    const q = query.toLowerCase().trim();
    const customIdSet = new Set(customItems.map((c) => c.id));

    const filteredCustom = q
        ? customItems
              .filter(
                  (c) =>
                      c.id.toLowerCase().includes(q) ||
                      c.name.toLowerCase().includes(q)
              )
              .slice(0, 5)
        : [];

    const filteredVanilla = q
        ? vanillaItems
              .filter((v) => !customIdSet.has(v.id))
              .filter(
                  (v) =>
                      v.id.toLowerCase().includes(q) ||
                      v.nameJa.toLowerCase().includes(q) ||
                      v.nameEn.toLowerCase().includes(q)
              )
              .slice(0, 10)
        : [];

    const customCount = filteredCustom.length;
    const hasResults = filteredCustom.length > 0 || filteredVanilla.length > 0;
    const showDropdown = open && q.length > 0 && (hasResults || loading);

    const select = (id: string) => {
        onChange(id);
        setQuery(id);
        setOpen(false);
        setHighlighted(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const total = customCount + filteredVanilla.length;

        if (!open) {
            if ((e.key === "ArrowDown" || e.key === "Enter") && q) {
                updatePos();
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlighted((h) => Math.min(h + 1, total - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlighted((h) => Math.max(h - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlighted >= 0 && highlighted < total) {
                    if (highlighted < customCount) {
                        select(filteredCustom[highlighted].id);
                    } else {
                        select(filteredVanilla[highlighted - customCount].id);
                    }
                } else {
                    onChange(query);
                    setOpen(false);
                }
                break;
            case "Escape":
                setOpen(false);
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder={placeholder ?? "アイテムID / 名前"}
                className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border transition-colors placeholder-[#93a0a7] focus:outline-none ${
                    error
                        ? "border-[#ff6161] bg-[#fef2f3] focus:border-[#ff6161]"
                        : "border-[#cad3d8] focus:border-[#24afff]"
                }`}
                onChange={(e) => {
                    const v = e.target.value;
                    setQuery(v);
                    onChange(v);
                    setHighlighted(-1);
                    if (v) {
                        updatePos();
                        setOpen(true);
                    } else {
                        setOpen(false);
                    }
                }}
                onFocus={() => {
                    if (q) {
                        updatePos();
                        setOpen(true);
                    }
                }}
                onKeyDown={handleKeyDown}
            />

            {showDropdown &&
                dropdownPos &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "fixed",
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                            zIndex: 9999,
                        }}
                        className="bg-white border border-[#e2eaee] rounded-xl shadow-[0_8px_30px_-4px_#00000025] overflow-hidden"
                    >
                        <div className="max-h-72 overflow-y-auto">
                            {/* Custom items */}
                            {filteredCustom.length > 0 && (
                                <>
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#6f767a] bg-[#f8fafc] uppercase tracking-wider sticky top-0">
                                        オリジナルアイテム
                                    </div>
                                    {filteredCustom.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            onMouseDown={() => select(item.id)}
                                            onMouseEnter={() => setHighlighted(idx)}
                                            className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors select-none ${
                                                highlighted === idx
                                                    ? "bg-[#f1f6f9]"
                                                    : "hover:bg-[#f8fafc]"
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-[#080d12] truncate">
                                                    {item.name}
                                                </div>
                                                <div className="text-[11px] text-[#99a2a7] font-mono truncate">
                                                    {item.id}
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f1f6f9] text-[#6f767a]">
                                                {item.category}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Vanilla items */}
                            {filteredVanilla.length > 0 && (
                                <>
                                    <div
                                        className={`px-3 py-1.5 text-[10px] font-bold text-[#6f767a] bg-[#f8fafc] uppercase tracking-wider sticky top-0 ${
                                            filteredCustom.length > 0 ? "border-t border-[#f1f6f9]" : ""
                                        }`}
                                    >
                                        バニラアイテム
                                    </div>
                                    {filteredVanilla.map((item, idx) => {
                                        const globalIdx = customCount + idx;
                                        return (
                                            <div
                                                key={item.id}
                                                onMouseDown={() => select(item.id)}
                                                onMouseEnter={() => setHighlighted(globalIdx)}
                                                className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors select-none ${
                                                    highlighted === globalIdx
                                                        ? "bg-[#f1f6f9]"
                                                        : "hover:bg-[#f8fafc]"
                                                }`}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-semibold text-[#080d12] truncate">
                                                        {item.nameJa}
                                                    </div>
                                                    <div className="text-[11px] text-[#99a2a7] truncate">
                                                        {item.nameJa !== item.nameEn
                                                            ? <>{item.nameEn} <span className="font-mono">({item.id})</span></>
                                                            : <span className="font-mono">{item.id}</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* Loading */}
                            {loading && filteredCustom.length === 0 && filteredVanilla.length === 0 && (
                                <div className="px-3 py-3 text-xs text-[#99a2a7] text-center">
                                    読み込み中...
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
