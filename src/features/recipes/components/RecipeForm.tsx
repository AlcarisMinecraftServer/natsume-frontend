import { useState, Suspense } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/worker-json";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import type { RecipeFormData, RecipeFormErrors } from "../types";
import ItemSearchInput from "./ItemSearchInput";

const CATEGORIES = ["crafting", "cooking"] as const;

type Props = {
    title: string;
    formData: RecipeFormData;
    setFormData: (data: RecipeFormData) => void;
    formErrors: RecipeFormErrors;
    isEditMode?: boolean;
    handleSubmit: () => void;
    onCancel?: () => void;
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
            <div className="p-4 pt-0 leading-[1.7] text-[#4b5256] text-[.95rem]">
                {children}
            </div>
        </div>
    );
}

const inputClass = (error?: boolean) =>
    `w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border transition-colors placeholder-[#93a0a7] focus:outline-none ${error
        ? "border-[#ff6161] bg-[#fef2f3] focus:border-[#ff6161]"
        : "border-[#cad3d8] focus:border-[#24afff]"
    }`;

export default function RecipeForm({
    title,
    formData,
    setFormData,
    formErrors,
    isEditMode = false,
    handleSubmit,
    onCancel,
}: Props) {
    const [editorMode, setEditorMode] = useState<"visual" | "raw">("visual");
    const [rawJson, setRawJson] = useState("");
    const [jsonError, setJsonError] = useState(false);

    const [openBasic, setOpenBasic] = useState(true);
    const [openMaterials, setOpenMaterials] = useState(true);
    const [openProduct, setOpenProduct] = useState(true);
    const [openAdvanced, setOpenAdvanced] = useState(false);

    const update = (patch: Partial<RecipeFormData>) => setFormData({ ...formData, ...patch });

    const addMaterial = () =>
        update({ materials: [...formData.materials, { id: "", amount: 1 }] });

    const removeMaterial = (index: number) =>
        update({ materials: formData.materials.filter((_, i) => i !== index) });

    const updateMaterial = (index: number, field: "id" | "amount", value: string | number) =>
        update({
            materials: formData.materials.map((m, i) =>
                i === index ? { ...m, [field]: value } : m
            ),
        });

    const switchToRaw = () => {
        setRawJson(JSON.stringify(formData, null, 2));
        setEditorMode("raw");
    };

    const switchToVisual = () => {
        if (jsonError) {
            toast.error("エラーを修正してください!");
            return;
        }
        try {
            setFormData(JSON.parse(rawJson) as RecipeFormData);
            setEditorMode("visual");
        } catch {
            toast.error("JSONパースエラー");
        }
    };

    return (
        <Suspense fallback={<div className="text-[#080d12] p-8">Loading...</div>}>
            <div className="h-screen bg-[#eef5ff] flex flex-col overflow-hidden">

                <div className="flex-1 overflow-y-auto p-6 w-full">
                    <div className="max-w-6xl mx-auto min-h-full">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-2xl font-bold text-[#080d12]">{title}</h1>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="text-[#6f767a] hover:text-[#080d12] font-medium transition-colors px-4 py-2"
                            >
                                キャンセル
                            </button>
                        </div>

                        {editorMode === "visual" ? (
                            <div className="w-full pb-8">

                                {/* Basic Info */}
                                <section className="bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="基本情報"
                                        isOpen={openBasic}
                                        onToggle={() => setOpenBasic((v) => !v)}
                                    />
                                    <div className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openBasic ? "max-h-500" : "max-h-0"}`}>
                                        {renderCategoryItem({
                                            label: "レシピID (Recipe ID)",
                                            children: (
                                                <input
                                                    type="text"
                                                    value={formData.id}
                                                    onChange={(e) => update({ id: e.target.value })}
                                                    disabled={isEditMode}
                                                    placeholder="recipe_stone_sword"
                                                    className={`${inputClass(formErrors.id)} ${isEditMode ? "opacity-60 cursor-not-allowed" : ""}`}
                                                />
                                            ),
                                        })}
                                        {renderCategoryItem({
                                            label: "カテゴリー (Category)",
                                            children: (
                                                <div className="relative">
                                                    <select
                                                        value={formData.category}
                                                        onChange={(e) => update({ category: e.target.value })}
                                                        className={`w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border transition-colors focus:outline-none appearance-none ${formErrors.category ? "border-[#ff6161] bg-[#fef2f3] focus:border-[#ff6161]" : "border-[#cad3d8] focus:border-[#24afff]"}`}
                                                    >
                                                        <option value="">選択してください</option>
                                                        {CATEGORIES.map((cat) => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6f767a]">
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ),
                                        })}
                                        {renderCategoryItem({
                                            label: "非表示 (Hidden)",
                                            children: (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is_hidden"
                                                        checked={formData.is_hidden}
                                                        onChange={(e) => update({ is_hidden: e.target.checked })}
                                                        className="w-4 h-4 rounded border-[#cad3d8] text-[#24afff] focus:ring-[#24afff] focus:ring-offset-0"
                                                    />
                                                    <label
                                                        htmlFor="is_hidden"
                                                        className="text-sm font-semibold text-[#080d12] cursor-pointer select-none"
                                                    >
                                                        プレイヤーにレシピを非表示にする
                                                    </label>
                                                </div>
                                            ),
                                        })}
                                    </div>
                                </section>

                                {/* Materials */}
                                <section className="mt-8 bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="素材 (Materials)"
                                        isOpen={openMaterials}
                                        onToggle={() => setOpenMaterials((v) => !v)}
                                    />
                                    <div className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openMaterials ? "max-h-1000" : "max-h-0"}`}>
                                        {renderCategoryItem({
                                            label: "素材リスト",
                                            children: (
                                                <div>
                                                    {formErrors.materials && (
                                                        <p className="text-[#ff6161] text-xs mb-3">
                                                            素材を1つ以上入力してください。IDと数量を確認してください。
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 mb-1.5 px-0.5 text-[11px] font-semibold text-[#6f767a]">
                                                        <span className="flex-1">アイテムID</span>
                                                        <span className="w-24 text-center">数量</span>
                                                        <span className="w-8" />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {formData.materials.map((material, index) => (
                                                            <div key={index} className="flex gap-2 items-center">
                                                                <div className="flex-1">
                                                                    <ItemSearchInput
                                                                        value={material.id}
                                                                        onChange={(id) => updateMaterial(index, "id", id)}
                                                                        error={!!(formErrors.materials && material.id.trim() === "")}
                                                                        placeholder="stone"
                                                                    />
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    value={material.amount}
                                                                    onChange={(e) =>
                                                                        updateMaterial(index, "amount", Math.max(1, parseInt(e.target.value) || 1))
                                                                    }
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                    min={1}
                                                                    className={`w-24 bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border transition-colors text-center focus:outline-none ${formErrors.materials && material.amount < 1
                                                                        ? "border-[#ff6161] bg-[#fef2f3] focus:border-[#ff6161]"
                                                                        : "border-[#cad3d8] focus:border-[#24afff]"
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMaterial(index)}
                                                                    disabled={formData.materials.length === 1}
                                                                    className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-[#ffffff] border border-[#cad3d8] text-[#6f767a] hover:text-[#ff6161] hover:border-[#ff6161] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    <FaTrash size={11} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={addMaterial}
                                                        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#4a5b77] hover:text-[#080d12] transition-colors"
                                                    >
                                                        <FaPlus size={11} />
                                                        素材を追加
                                                    </button>
                                                </div>
                                            ),
                                        })}
                                    </div>
                                </section>

                                {/* Product */}
                                <section className="mt-8 bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="生成物 (Product)"
                                        isOpen={openProduct}
                                        onToggle={() => setOpenProduct((v) => !v)}
                                    />
                                    <div className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openProduct ? "max-h-500" : "max-h-0"}`}>
                                        {renderCategoryItem({
                                            label: "アイテムID / 数量",
                                            children: (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">アイテムID (Item ID)</div>
                                                        <ItemSearchInput
                                                            value={formData.product.id}
                                                            onChange={(id) =>
                                                                update({ product: { ...formData.product, id } })
                                                            }
                                                            error={!!(formErrors.product && formData.product.id.trim() === "")}
                                                            placeholder="stone_sword"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">数量 (Amount)</div>
                                                        <input
                                                            type="number"
                                                            value={formData.product.amount}
                                                            onChange={(e) =>
                                                                update({
                                                                    product: {
                                                                        ...formData.product,
                                                                        amount: Math.max(1, parseInt(e.target.value) || 1),
                                                                    },
                                                                })
                                                            }
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            min={1}
                                                            className={inputClass(formErrors.product && formData.product.amount < 1)}
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        })}
                                    </div>
                                </section>

                                {/* Advanced */}
                                <section className="mt-8 bg-[#296c930f] p-1.5 rounded-[calc(var(--radius-2xl)+var(--spacing)*1.5)]">
                                    <SectionToggle
                                        label="詳細設定"
                                        isOpen={openAdvanced}
                                        onToggle={() => setOpenAdvanced((v) => !v)}
                                    />
                                    <div className={`mt-1 rounded-2xl shadow-sm bg-white overflow-hidden transition-[max-height] duration-500 ${openAdvanced ? "max-h-500" : "max-h-0"}`}>
                                        {renderCategoryItem({
                                            label: "クールダウン / 解放レベル",
                                            children: (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">クールダウン（秒）</div>
                                                        <input
                                                            type="number"
                                                            value={formData.cooldown ?? ""}
                                                            onChange={(e) =>
                                                                update({
                                                                    cooldown:
                                                                        e.target.value === ""
                                                                            ? null
                                                                            : Math.max(0, parseInt(e.target.value) || 0),
                                                                })
                                                            }
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            min={0}
                                                            placeholder="なし"
                                                            className={inputClass()}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-semibold text-[#6f767a]">解放レベル (Unlock Level)</div>
                                                        <input
                                                            type="number"
                                                            value={formData.unlock_level ?? ""}
                                                            onChange={(e) =>
                                                                update({
                                                                    unlock_level:
                                                                        e.target.value === ""
                                                                            ? null
                                                                            : Math.max(0, parseInt(e.target.value) || 0),
                                                                })
                                                            }
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            min={0}
                                                            placeholder="なし"
                                                            className={inputClass()}
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        })}
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
                                    name="recipe-json-editor"
                                    editorProps={{ $blockScrolling: true }}
                                    width="100%"
                                    height="100%"
                                    setOptions={{ useWorker: false, showPrintMargin: false }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-4 bg-[#ffffffcc] backdrop-blur-md border-t border-[#e2eaee] w-full z-40">
                    <div className="max-w-6xl w-full mx-auto flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={editorMode === "visual" ? switchToRaw : switchToVisual}
                            className="px-5 py-2.5 rounded text-[#080d12] font-medium transition-colors bg-[#e9eef1] hover:bg-[#dfe7eb]"
                        >
                            {editorMode === "visual" ? "JSONエディタへ" : "ビジュアルモードへ"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!!jsonError && editorMode === "raw"}
                            className={`px-8 py-2.5 rounded text-white font-bold transition-all transform hover:-translate-y-0.5 ${jsonError && editorMode === "raw"
                                ? "bg-[#cad3d8] cursor-not-allowed"
                                : "bg-[#24afff] hover:bg-[#099bff]"
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
