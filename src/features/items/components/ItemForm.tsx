import { useEffect, useState, Suspense } from "react";

import Checkbox from "@/components/form/Checkbox";
import TextField from "@/components/form/TextField";
import NumberInput from "@/components/form/NumberInput";

import WeaponForm from "@/features/items/components/form/WeaponForm";
import FoodForm from "@/features/items/components/form/FoodForm";
import ToolForm from "@/features/items/components/form/ToolForm";
import TagsInput from "@/features/items/components/form/TagsInput";

import { defaultSchemas } from "../schemas";
import { FormData, Price, Tag } from "../types";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/worker-json";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

function CategoryInput({ value, onChange }: { value: FormData["category"]; onChange: (v: FormData["category"]) => void }) {
    return (
        <div>
            <label className="block text-sm mb-1">Category</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as FormData["category"])}
                className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
            >
                <option value="food">食料</option>
                <option value="tool">ツール</option>
                <option value="material">素材</option>
                <option value="weapon">武器</option>
            </select>
        </div>
    );
}

function LoreInput({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: boolean }) {
    return (
        <div>
            <label className="block text-sm mb-1">Lore</label>
            <textarea
                value={value.join("\n")}
                onChange={(e) => onChange(e.target.value.split("\n"))}
                rows={4}
                className={`w-full bg-[#2a2d33] text-white px-3 py-2 rounded border ${error ? "border-red-500" : "border-gray-600"
                    }`}
            ></textarea>
        </div>
    );
}

function PriceInput({
    price,
    onChange,
}: {
    price: Price;
    onChange: (p: Price) => void;
}) {
    return (
        <>
            <NumberInput
                label="Buy Price"
                value={price.buy}
                onChange={(v) => onChange({ ...price, buy: v })}
            />
            <NumberInput
                label="Sell Price"
                value={price.sell}
                onChange={(v) => onChange({ ...price, sell: v })}
            />
            <Checkbox
                label="Can Sell"
                checked={price.can_sell}
                onChange={(v) => onChange({ ...price, can_sell: v })}
            />
        </>
    );
}

type Props = {
    formData: FormData;
    setFormData: (v: FormData) => void;
    formErrors: Partial<Record<keyof FormData, boolean>>;
    newTag: Tag;
    setNewTag: (v: Tag) => void;
    tagError: { label?: boolean; color?: boolean };
    setTagError: (e: { label?: boolean; color?: boolean }) => void;
    triggerGlobalShake: () => void;
    handleSubmit: () => void;
};

export default function ItemForm({
    formData,
    setFormData,
    formErrors,
    newTag,
    setNewTag,
    tagError,
    setTagError,
    triggerGlobalShake,
    handleSubmit,
}: Props) {
    const [editorMode, setEditorMode] = useState<"visual" | "raw">("visual");
    const [rawJson, setRawJson] = useState(() => JSON.stringify(formData, null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (key: keyof FormData, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    useEffect(() => {
        try {
            const parsed = JSON.parse(rawJson);
            console.log(parsed);
            if (typeof parsed === "object" && parsed !== null && "data" in parsed) {
                setFormData(parsed);
                setJsonError(null);
            } else {
                throw new Error("無効な形式");
            }
        } catch (e: unknown) {
            if (e instanceof Error) setJsonError(e.message);
        }
    }, [rawJson, setFormData]);

    const toSnakeCase = (str: string): string =>
        str
            .trim()
            .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/gi, "")
            .replace(/_{2,}/g, "_")
            .replace(/^_+|_+$/g, "");

    return (
        <Suspense fallback={null}>
            <div className="p-6 text-white bg-[#1c1e22] h-full w-full">
                <div className="flex items-center justify-between pb-4 mb-4 border-b">
                    <h1 className="text-4xl font-bold">アイテム設定 - 新規作成</h1>
                </div>

                {editorMode === "visual" ? (
                    <div className="space-y-4 px-4 pb-18">
                        <CategoryInput
                            value={formData.category}
                            onChange={(v) =>
                                setFormData({
                                    ...formData,
                                    category: v,
                                    data: defaultSchemas[v],
                                })
                            }
                        />

                        <TextField
                            label="ID"
                            value={formData.id}
                            onChange={(v) => handleChange("id", v)}
                            onBlur={() => handleChange("id", toSnakeCase(formData.id))}
                            error={formErrors.id}
                        />

                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={(v) => handleChange("name", v)}
                            error={formErrors.name}
                        />

                        <LoreInput
                            value={formData.lore}
                            onChange={(v) => handleChange("lore", v)}
                            error={formErrors.lore}
                        />

                        <NumberInput
                            label="Rarity"
                            value={formData.rarity}
                            onChange={(v) => handleChange("rarity", v)}
                            error={formErrors.rarity}
                        />

                        <NumberInput
                            label="Max Stack"
                            value={formData.max_stack}
                            onChange={(v) => handleChange("max_stack", v)}
                            error={formErrors.max_stack}
                        />

                        <NumberInput
                            label="Custom Model Data"
                            value={formData.custom_model_data}
                            onChange={(v) => handleChange("custom_model_data", v)}
                            error={formErrors.custom_model_data}
                        />

                        <PriceInput
                            price={formData.price}
                            onChange={(p) => handleChange("price", p)}
                        />

                        <TagsInput
                            tags={formData.tags}
                            newTag={newTag}
                            tagError={tagError}
                            onNewTagChange={setNewTag}
                            onAddTag={() => {
                                const errors = {
                                    label: newTag.label.trim() === "",
                                    color: !/^#([0-9A-Fa-f]{6})$/.test(newTag.color),
                                };

                                setTagError(errors);

                                if (errors.label || errors.color) {
                                    triggerGlobalShake();
                                    return;
                                }

                                setFormData({
                                    ...formData,
                                    tags: [...formData.tags, newTag],
                                });
                                setNewTag({ label: "", color: "" });
                                setTagError({});
                            }}
                            onRemoveTag={(index) =>
                                setFormData({
                                    ...formData,
                                    tags: formData.tags.filter((_, i) => i !== index),
                                })
                            }
                        />

                        <hr className="my-6 border-gray-600" />

                        {formData.category === "weapon" && (
                            <WeaponForm
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                data={formData.data as any}
                                onChange={(d) => setFormData({ ...formData, data: d })}
                            />
                        )}

                        {formData.category === "food" && (
                            <FoodForm
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                data={formData.data as any}
                                onChange={(d) => setFormData({ ...formData, data: d })}
                            />
                        )}

                        {formData.category === "tool" && (
                            <ToolForm
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                data={formData.data as any}
                                onChange={(d) => setFormData({ ...formData, data: d })}
                            />
                        )}

                    </div>
                ) : (
                    <div className="px-8 pb-28">
                        <AceEditor
                            mode="json"
                            theme="monokai"
                            name="json-editor"
                            width="100%"
                            height="700px"
                            fontSize={12}
                            value={rawJson}
                            onChange={(v) => setRawJson(v)}
                            editorProps={{ $blockScrolling: Infinity }}
                            setOptions={{
                                fontFamily: "monospace",
                                useWorker: true,
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: true,
                                showPrintMargin: false,
                            }}
                        />
                        {jsonError && (
                            <div className="text-red-500 bg-red-100 px-3 py-2 rounded border border-red-300 mt-2">
                                JSONエラー: {jsonError}
                            </div>
                        )}
                    </div>
                )}

                <div className="fixed bottom-2 right-6 flex gap-2 z-50">
                    <button
                        onClick={() =>
                            setEditorMode((prev) => (prev === "visual" ? "raw" : "visual"))
                        }
                        className="px-4 py-2 rounded text-white transition-colors bg-gray-600 hover:bg-gray-700"
                    >
                        {editorMode === "visual" ? "Raw Editor" : "Visual Editor"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded text-white transition-colors bg-blue-600 hover:bg-blue-700"
                    >
                        作成
                    </button>
                </div>
            </div>
        </Suspense>
    );
}
