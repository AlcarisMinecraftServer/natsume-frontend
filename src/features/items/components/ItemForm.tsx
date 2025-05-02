import AceEditor from "react-ace";
import { useEffect, useState } from "react";
import { FormData, Tag } from "../types";

import NumberInputWithSpin from "../../../components/form/NumberInput";
import RulesEditor from "../../../components/form/RulesEditor";

import CategorySelect from "@/features/items/components/form/CategorySelect";
import LoreInput from "@/features/items/components/form/LoreInput";
import PriceInputs from "@/features/items/components/form/PriceInputs";
import TagsInput from "@/features/items/components/form/TagsInput";

import TextField from "@/components/form/TextField";
import EffectListEditor from "./form/EffectListEditor";
import AttributeListEditor from "./form/AttributeListEditor";
import BuffListEditor from "./form/BuffListEditor";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/worker-json";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

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
    handleSubmit
}: Props) {
    const [editorMode, setEditorMode] = useState<"visual" | "raw">("visual");
    const [rawJson, setRawJson] = useState(() => JSON.stringify(formData, null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (key: keyof FormData, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDataChange = (key: string, value: any) => {
        setFormData({ ...formData, data: { ...formData.data, [key]: value } });
    };

    useEffect(() => {
        if (editorMode === "raw") {
            setRawJson(JSON.stringify(formData, null, 2));
        }
    }, [formData, editorMode]);

    useEffect(() => {
        try {
            const parsed = JSON.parse(rawJson);

            if (typeof parsed === "object" && parsed !== null && "data" in parsed) {
                setFormData(parsed);
                setJsonError(null);
            } else {
                throw new Error("無効な形式")
            }
        } catch (e: unknown) {
            if (e instanceof Error) setJsonError(e.message);
        }
    }, [rawJson, setFormData]);

    const formatLabel = (key: string) =>
        key.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());

    function toSnakeCase(str: string): string {
        return str
            .trim()
            .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
            .replace(/[\s-]+/g, '_')
            .replace(/[^a-z0-9_]/gi, '')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    const renderDynamicFields = () =>
        Object.entries(formData.data).map(([key, value]) => {
            if (formData.category === "tools" && key === "rules") {
                return (
                    <RulesEditor
                        key={key}
                        initialRules={JSON.stringify(value, null, 2)}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setRulesJson={(json: any) => handleDataChange(key, JSON.parse(json))}
                    />
                );
            }

            if (key === "tool_type") {
                const TOOL_TYPE_OPTIONS = ["pickaxe", "axe", "shovel", "hoe", "sword"];

                return (
                    <div key={key} className="mb-4">
                        <label className="block text-sm mb-1 text-white">
                            {formatLabel(key)}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleDataChange(key, e.target.value)}
                            className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
                        >
                            {TOOL_TYPE_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }

            if (Array.isArray(value)) {
                if (key === "effects") {
                    return (
                        <div key={key} className="mb-4">
                            <EffectListEditor
                                initial={value}
                                onChange={(v) => handleDataChange(key, v)}
                            />
                        </div>
                    );
                }

                if (key === "attributes") {
                    return (
                        <div key={key} className="mb-4">
                            <AttributeListEditor
                                initial={value}
                                onChange={(v) => handleDataChange(key, v)}
                            />
                        </div>
                    );
                }

                if (key === "buffs") {
                    return (
                        <div key={key} className="mb-4">
                            <BuffListEditor
                                initial={value}
                                onChange={(v) => handleDataChange(key, v)}
                            />
                        </div>
                    );
                }
            }

            const valueType = typeof value;

            if (valueType === "number") {
                return (
                    <NumberInputWithSpin
                        key={key}
                        label={formatLabel(key)}
                        value={value}
                        onChange={(v) => handleDataChange(key, v)}
                    />
                );
            }

            if (valueType === "boolean") {
                return (
                    <label key={key} className="inline-flex items-center gap-2 text-white">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleDataChange(key, e.target.checked)}
                            className="form-checkbox"
                        />
                        {formatLabel(key)}
                    </label>
                );
            }

            if (valueType === "string") {
                return (
                    <TextField
                        key={key}
                        label={formatLabel(key)}
                        value={value}
                        onChange={(v) => handleDataChange(key, v)}
                    />
                );
            }

            return null;
        });

    return (
        <div className="p-6 text-white bg-[#1c1e22] h-full w-full">
            <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <h1 className="text-4xl font-bold">アイテム設定 - 新規作成</h1>
            </div>

            {editorMode === 'visual' ? (

                <div className="space-y-4 px-4 pb-18">
                    <CategorySelect
                        value={formData.category}
                        onChange={(v) => handleChange("category", v)}
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

                    <NumberInputWithSpin
                        label="Rarity"
                        value={formData.rarity}
                        onChange={(v) => handleChange("rarity", v)}
                        error={formErrors.rarity}
                    />

                    <NumberInputWithSpin
                        label="Max Stack"
                        value={formData.max_stack}
                        onChange={(v) => handleChange("max_stack", v)}
                        error={formErrors.max_stack}
                    />

                    <NumberInputWithSpin
                        label="Custom Model Data"
                        value={formData.custom_model_data}
                        onChange={(v) => handleChange("custom_model_data", v)}
                        error={formErrors.custom_model_data}
                    />

                    <PriceInputs
                        price={formData.price}
                        onChange={(p) => handleChange("price", p)}
                    />

                    <TagsInput
                        tags={formData.tags}
                        newTag={newTag}
                        tagError={tagError}
                        onNewTagChange={(tag) => setNewTag(tag)}
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

                            setFormData({ ...formData, tags: [...formData.tags, newTag] });
                            setNewTag({ label: "", color: "" });
                            setTagError({});
                        }}
                        onRemoveTag={(index) => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index)})}
                    />

                    <hr className="my-4 border-gray-600" />
                    {renderDynamicFields()}
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
                    disabled={false}
                    className={`px-4 py-2 rounded text-white transition-colors bg-blue-600 hover:bg-blue-700`}
                >
                    作成
                </button>
            </div>
        </div>
    );
}
