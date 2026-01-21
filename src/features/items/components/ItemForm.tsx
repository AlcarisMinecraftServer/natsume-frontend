import { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import WeaponForm from "@/features/items/components/form/WeaponForm";
import ArmorForm from "@/features/items/components/form/ArmorForm";
import FoodForm from "@/features/items/components/form/FoodForm";
import ToolForm from "@/features/items/components/form/ToolForm";
import TagsInput from "@/features/common/TagsInput";

import { defaultSchemas } from "../schemas";
import { FormData, Tag } from "../types";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/worker-json";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

type Props = {
    title: string;
    formData: FormData;
    setFormData: (data: FormData) => void;
    formErrors: Partial<Record<keyof FormData, boolean>>;
    newTag: Tag;
    setNewTag: (tag: Tag) => void;
    tagError: { label?: boolean; color?: boolean };
    setTagError: (error: { label?: boolean; color?: boolean }) => void;
    handleSubmit: () => void;
};

function SectionToggle({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="font-bold text-[.95rem] leading-[1.6] p-3.5 flex w-full text-left items-center h-9 text-[#5f6a6f]"
        >
            <span className="flex-1">{label}</span>
            <span aria-hidden="true" className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                <svg strokeWidth="2.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="w-4 text-main-500">
                    <g stroke="none" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                        <g transform="translate(12.000000, 12.000000) rotate(-180.000000) translate(-12.000000, -12.000000) translate(5.000000, 8.500000)" stroke="currentColor">
                            <polyline points="14 0 7 7 0 0"></polyline>
                        </g>
                    </g>
                </svg>
            </span>
        </button>
    );
}

function renderCategoryItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-t border-[#f1f6f9] first:border-none first:rounded-t-xl last:rounded-b-xl">
            <div className="font-bold text-[#262e35] hover:text-[#080d12] px-4 pt-3 pb-1 text-[.95rem] leading-[1.4] transition-colors duration-200 antialiased flex w-full select-none cursor-pointer items-center text-left gap-3">
                <span className="flex-1">{label}</span>
            </div>
            <div className="p-4 pt-0 leading-[1.7] text-[#4b5256] text-[.95rem] ">
                {children}
            </div>
        </div>
    )
}

export default function ItemForm({
    title,
    formData,
    setFormData,
    formErrors,
    newTag,
    setNewTag,
    tagError,
    setTagError,
    handleSubmit,
}: Props) {
    const navigate = useNavigate();
    const [editorMode, setEditorMode] = useState<"visual" | "raw">("visual");
    const [rawJson, setRawJson] = useState("");
    const [jsonError, setJsonError] = useState(false);

    const [openBasic, setOpenBasic] = useState(true);
    const [openDetail, setOpenDetail] = useState(true);
    const [openEconomy, setOpenEconomy] = useState(true);
    const [openCategory, setOpenCategory] = useState(true);

    return (
        <Suspense fallback={<div className="text-[#080d12] p-8">Loading...</div>}>
            <div className="h-screen bg-[#eef5ff] flex flex-col overflow-hidden">

                <div className="flex-1 overflow-y-auto p-6 w-full">
                    <div className="max-w-6xl mx-auto min-h-full">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-2xl font-bold text-[#080d12]">{title}</h1>
                            <button
                                onClick={() => navigate("/items")}
                                className="text-[#6f767a] hover:text-[#080d12] font-medium transition-colors px-4 py-2"
                            >
                                キャンセル
                            </button>
                        </div>

                        {editorMode === "visual" ? (
                            <div className="w-full pb-8">
                                <section className="bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="基本情報"
                                        isOpen={openBasic}
                                        onToggle={() => setOpenBasic((v) => !v)}
                                    />

                                    <div
                                        className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openBasic ? "max-h-500" : "max-h-0"}`}
                                    >
                                        {renderCategoryItem({
                                            label: "アイテム名", children: (
                                                <input
                                                    type="text"
                                                    value={formData.id}
                                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                                    placeholder="example_sword"
                                                    className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7] ${formErrors.id ? "border-[#ff6161] bg-[#fef2f3]" : ""}`}
                                                />
                                            )
                                        })}

                                        {renderCategoryItem({
                                            label: "アイテムID", children: (
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Excalibur"
                                                    className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7] ${formErrors.name ? "border-[#ff6161] bg-[#fef2f3]" : ""}`}
                                                />
                                            )
                                        })}

                                        {renderCategoryItem({
                                            label: "カテゴリー", children: (
                                                <div className="relative">
                                                    <select
                                                        value={formData.category}
                                                        onChange={(e) => {
                                                            const category = e.target.value as FormData["category"];
                                                            setFormData({
                                                                ...formData,
                                                                category,
                                                                data: defaultSchemas[category],
                                                            });
                                                        }}
                                                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors appearance-none"
                                                    >
                                                        {Object.keys(defaultSchemas).map((cat) => (
                                                            <option key={cat} value={cat}>
                                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6f767a]">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {renderCategoryItem({
                                            label: "説明文", children: (
                                                <textarea
                                                    value={(formData.lore || []).join("\n")}
                                                    onChange={(e) => setFormData({ ...formData, lore: e.target.value.split("\n") })}
                                                    className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors min-h-22 ${formErrors.lore ? "border-[#ff6161] bg-[#fef2f3]" : ""
                                                        }`}
                                                />
                                            )
                                        })}
                                    </div>
                                </section>

                                <section className="mt-8 bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="詳細設定"
                                        isOpen={openDetail}
                                        onToggle={() => setOpenDetail((v) => !v)}
                                    />

                                    <div
                                        className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openDetail ? "max-h-500" : "max-h-0"}`}
                                    >
                                        {renderCategoryItem({
                                            label: "レアリティ / 最大スタック", children: (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">Rarity</div>
                                                        <input
                                                            type="number"
                                                            value={formData.rarity}
                                                            onChange={(e) => setFormData({ ...formData, rarity: parseFloat(e.target.value) })}
                                                            className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors ${formErrors.rarity ? "border-[#ff6161] bg-[#fef2f3]" : ""
                                                                }`}
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">Max Stack</div>
                                                        <input
                                                            type="number"
                                                            value={formData.max_stack}
                                                            onChange={(e) => setFormData({ ...formData, max_stack: parseFloat(e.target.value) })}
                                                            className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors ${formErrors.max_stack ? "border-[#ff6161] bg-[#fef2f3]" : ""
                                                                }`}
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {renderCategoryItem({
                                            label: "Item Model / Custom Model Data", children: (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">Item Model</div>
                                                        <input
                                                            type="text"
                                                            value={formData.item_model ?? ""}
                                                            onChange={(e) => setFormData({ ...formData, item_model: e.target.value || null })}
                                                            placeholder="common:items/crystal"
                                                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">Custom Model Data</div>
                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr]">
                                                            <select
                                                                value={formData.custom_model_data?.type ?? "none"}
                                                                onChange={(e) => {
                                                                    const newType = e.target.value;
                                                                    if (newType === "none") {
                                                                        setFormData({ ...formData, custom_model_data: null });
                                                                        return;
                                                                    }
                                                                    if (newType === "floats") setFormData({ ...formData, custom_model_data: { type: "floats", value: [] } as any });
                                                                    if (newType === "flags") setFormData({ ...formData, custom_model_data: { type: "flags", value: [] } as any });
                                                                    if (newType === "strings") setFormData({ ...formData, custom_model_data: { type: "strings", value: [] } as any });
                                                                    if (newType === "colors") setFormData({ ...formData, custom_model_data: { type: "colors", value: [] } as any });
                                                                }}
                                                                className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors text-sm"
                                                            >
                                                                <option value="none">None (無効)</option>
                                                                <option value="floats">Floats (数値配列)</option>
                                                                <option value="flags">Flags (真偽値配列)</option>
                                                                <option value="strings">Strings (文字列配列)</option>
                                                                <option value="colors">Colors (色コード配列)</option>
                                                            </select>

                                                            {formData.custom_model_data && formData.custom_model_data.type !== "flags" ? (
                                                                <input
                                                                    type="text"
                                                                    value={formData.custom_model_data ? (formData.custom_model_data.value as any[]).join(", ") : ""}
                                                                    onChange={(e) => {
                                                                        const v = formData.custom_model_data;
                                                                        if (!v) return;
                                                                        const raw = e.target.value;

                                                                        if (v.type === "strings") {
                                                                            setFormData({
                                                                                ...formData,
                                                                                custom_model_data: { ...v, value: raw.split(",").map((s) => s.trim()).filter(Boolean) } as any,
                                                                            });
                                                                        } else if (v.type === "floats") {
                                                                            const nums = raw
                                                                                .split(",")
                                                                                .map((s) => parseFloat(s.trim()))
                                                                                .filter((n) => !isNaN(n));
                                                                            setFormData({ ...formData, custom_model_data: { ...v, value: nums } as any });
                                                                        } else if (v.type === "colors") {
                                                                            const nums = raw
                                                                                .split(",")
                                                                                .map((s) => parseInt(s.trim(), 10))
                                                                                .filter((n) => !isNaN(n));
                                                                            setFormData({ ...formData, custom_model_data: { ...v, value: nums } as any });
                                                                        }
                                                                    }}
                                                                    placeholder={formData.custom_model_data.type === "colors" ? "16711680, 255" : "value1, value2"}
                                                                    className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7] text-sm"
                                                                />
                                                            ) : (
                                                                <div className="text-sm text-[#6f767a] flex items-center px-3 py-1.5 border border-[#e2eaee] rounded bg-[#ffffff]">
                                                                    {formData.custom_model_data?.type === "flags" ? "下でフラグを追加・切替" : "タイプを選択してください"}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {formData.custom_model_data?.type === "flags" && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {formData.custom_model_data.value.map((flag: boolean, idx: number) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const v = formData.custom_model_data;
                                                                            if (!v || v.type !== "flags") return;
                                                                            const next = [...v.value];
                                                                            next[idx] = !next[idx];
                                                                            setFormData({ ...formData, custom_model_data: { ...v, value: next } as any });
                                                                        }}
                                                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${flag
                                                                            ? "bg-[#e5f3ff] text-[#0089f2] border-[#0089f2]"
                                                                            : "bg-[#fef2f3] text-[#ff4d4d] border-[#ff4d4d]"
                                                                            }`}
                                                                    >
                                                                        {idx}: {flag.toString()}
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const v = formData.custom_model_data;
                                                                        if (!v || v.type !== "flags") return;
                                                                        setFormData({ ...formData, custom_model_data: { ...v, value: [...v.value, true] } as any });
                                                                    }}
                                                                    className="px-2.5 py-1 rounded text-xs font-semibold bg-[#ffffff] border border-[#cad3d8] text-[#4b5256] hover:bg-[#f3f8fb]"
                                                                >
                                                                    + Add
                                                                </button>
                                                                {formData.custom_model_data.value.length > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const v = formData.custom_model_data;
                                                                            if (!v || v.type !== "flags") return;
                                                                            setFormData({ ...formData, custom_model_data: { ...v, value: v.value.slice(0, -1) } as any });
                                                                        }}
                                                                        className="px-2.5 py-1 rounded text-xs font-semibold bg-[#ffffff] border border-[#cad3d8] text-[#4b5256] hover:text-[#ff6161]"
                                                                    >
                                                                        Remove Last
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {renderCategoryItem({
                                            label: "ツールチップスタイル", children: (
                                                <input
                                                    type="text"
                                                    value={formData.tooltip_style ?? ""}
                                                    onChange={(e) => setFormData({ ...formData, tooltip_style: e.target.value || null })}
                                                    className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                                                />
                                            )
                                        })}
                                    </div>
                                </section>

                                <section className="mt-8 bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="経済・タグ"
                                        isOpen={openEconomy}
                                        onToggle={() => setOpenEconomy((v) => !v)}
                                    />

                                    <div
                                        className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openEconomy ? "max-h-500" : "max-h-0"}`}
                                    >
                                        {renderCategoryItem({
                                            label: "価格設定", children: (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">Buy Price</div>
                                                        <input
                                                            type="number"
                                                            value={formData.price?.buy ?? 0}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    price: {
                                                                        buy: parseFloat(e.target.value),
                                                                        sell: formData.price?.sell ?? 0,
                                                                        can_sell: formData.price?.can_sell ?? false
                                                                    }
                                                                })
                                                            }
                                                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">Sell Price</div>
                                                        <input
                                                            type="number"
                                                            value={formData.price?.sell ?? 0}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    price: {
                                                                        buy: formData.price?.buy ?? 0,
                                                                        sell: parseFloat(e.target.value),
                                                                        can_sell: formData.price?.can_sell ?? false
                                                                    }
                                                                })
                                                            }
                                                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.price?.can_sell ?? false}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    price: {
                                                                        buy: formData.price?.buy ?? 0,
                                                                        sell: formData.price?.sell ?? 0,
                                                                        can_sell: e.target.checked
                                                                    }
                                                                })
                                                            }
                                                            className="w-4 h-4 rounded border-[#cad3d8] text-[#24afff] focus:ring-[#24afff] focus:ring-offset-0"
                                                        />
                                                        <label
                                                            className="text-sm font-semibold text-[#080d12] cursor-pointer select-none"
                                                            onClick={() =>
                                                                setFormData({
                                                                    ...formData,
                                                                    price: {
                                                                        buy: formData.price?.buy ?? 0,
                                                                        sell: formData.price?.sell ?? 0,
                                                                        can_sell: !(formData.price?.can_sell ?? false)
                                                                    }
                                                                })
                                                            }
                                                        >
                                                            Can Sell (売却可能)
                                                        </label>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {renderCategoryItem({
                                            label: "タグ", children: (
                                                <TagsInput
                                                    tags={formData.tags || []}
                                                    onChange={(tags) => setFormData({ ...formData, tags })}
                                                    newTag={newTag}
                                                    setNewTag={setNewTag}
                                                    tagError={tagError}
                                                    setTagError={setTagError}
                                                />
                                            )
                                        })}
                                    </div>
                                </section>

                                <section className="mt-8 bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label={`${(formData.category || "unknown").charAt(0).toUpperCase() + (formData.category || "").slice(1)} Data`}
                                        isOpen={openCategory}
                                        onToggle={() => setOpenCategory((v) => !v)}
                                    />

                                    <div
                                        className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${openCategory ? "max-h-1000 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"}`}
                                    >
                                        <div className="border-t border-[#f1f6f9] first:rounded-t-xl last:rounded-b-xl first:border-none">
                                            <div className="px-3 py-2.5 leading-normal text-[#4b5256] text-sm">
                                                {formData.category === "weapon" && (
                                                    <WeaponForm data={formData.data as any} onChange={(d) => setFormData({ ...formData, data: d })} />
                                                )}
                                                {formData.category === "armor" && (
                                                    <ArmorForm data={formData.data as any} onChange={(d) => setFormData({ ...formData, data: d })} />
                                                )}
                                                {formData.category === "food" && (
                                                    <FoodForm data={formData.data as any} onChange={(d) => setFormData({ ...formData, data: d })} />
                                                )}
                                                {formData.category === "tool" && (
                                                    <ToolForm data={formData.data as any} onChange={(d) => setFormData({ ...formData, data: d })} />
                                                )}
                                                {formData.category === "material" && (
                                                    <div className="text-[#6f767a] py-5 text-center bg-[#f6f9fb] rounded border border-dashed border-[#cad3d8]">
                                                        マテリアルには追加設定はありません。
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="h-200 border border-[#e2eaee] rounded overflow-hidden bg-white">
                                <AceEditor
                                    mode="json"
                                    theme="github"
                                    onChange={(v) => {
                                        setRawJson(v);
                                        try {
                                            JSON.parse(v);
                                            setJsonError(false);
                                        } catch {
                                            setJsonError(true);
                                        }
                                    }}
                                    value={rawJson}
                                    name="json-editor"
                                    editorProps={{ $blockScrolling: true }}
                                    width="100%"
                                    height="100%"
                                    setOptions={{ useWorker: false, showPrintMargin: false }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 p-4 bg-[#ffffffcc] backdrop-blur-md border-t border-[#e2eaee] w-full z-40">
                    <div className="max-w-6xl w-full mx-auto flex justify-end gap-3">
                        <button
                            onClick={() => {
                                if (editorMode === "visual") {
                                    setRawJson(JSON.stringify(formData, null, 2));
                                    setEditorMode("raw");
                                } else {
                                    if (!jsonError) {
                                        try {
                                            setFormData(JSON.parse(rawJson));
                                            setEditorMode("visual");
                                        } catch {
                                            toast.error("JSONパースエラー");
                                        }
                                    } else {
                                        toast.error("エラーを修正してください!");
                                    }
                                }
                            }}
                            className="px-5 py-2.5 rounded text-[#080d12] font-medium transition-colors bg-[#e9eef1] hover:bg-[#dfe7eb]"
                        >
                            {editorMode === "visual" ? "JSONエディタへ" : "ビジュアルモードへ"}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!!jsonError && editorMode === "raw"}
                            className={`px-8 py-2.5 rounded text-white font-bold transition-all transform hover:-translate-y-0.5 ${jsonError && editorMode === "raw" ? "bg-[#cad3d8] cursor-not-allowed" : "bg-[#24afff] hover:bg-[#099bff]"
                                }`}
                        >
                            保存する
                        </button>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}