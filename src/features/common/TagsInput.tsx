import { FaTimes } from "react-icons/fa";
import { Tag } from "@/features/items/types";

type Props = {
    tags: Tag[];
    onChange: (tags: Tag[]) => void;
    newTag: Tag;
    setNewTag: (tag: Tag) => void;
    tagError: { label?: boolean; color?: boolean };
    setTagError: (error: { label?: boolean; color?: boolean }) => void;
};

const normalizeHex = (color: string) => {
    const hex = color.startsWith("#") ? color : `#${color}`;
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#ffffff";
};

export default function TagsInput({
    tags = [],
    onChange,
    newTag,
    setNewTag,
    tagError,
    setTagError,
}: Props) {

    const handleAddTag = () => {
        const errors = {
            label: newTag.label.trim() === "",
            color: !/^#?[0-9a-fA-F]{6}$/.test(newTag.color),
        };

        if (errors.label || errors.color) {
            setTagError(errors);
            return;
        }

        const tagToAdd = {
            ...newTag,
            color: newTag.color.startsWith("#") ? newTag.color : `#${newTag.color}`,
        };

        onChange([...tags, tagToAdd]);
        setNewTag({ label: "", color: "" });
        setTagError({});
    };

    const handleRemoveTag = (index: number) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        onChange(newTags);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
                <input
                    type="text"
                    placeholder="Label"
                    value={newTag.label}
                    onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
                    className={`min-w-32 flex-1 bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7] ${tagError.label ? "border-[#ff6161] bg-[#fef2f3]" : "border-[#cad3d8]"
                        }`}
                />
                <input
                    type="color"
                    value={normalizeHex(newTag.color)}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded"
                    title="カラーピッカー"
                />
                <input
                    type="text"
                    placeholder="#ffffff"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className={`w-28 bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7] ${tagError.color ? "border-[#ff6161] bg-[#fef2f3]" : "border-[#cad3d8]"
                        }`}
                />

                <button
                    onClick={handleAddTag}
                    className="px-4 py-1.5 bg-[#24afff] text-white rounded font-medium hover:bg-[#099bff] transition-colors whitespace-nowrap"
                >
                    追加
                </button>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-[#f6f9fb] rounded border border-[#e2eaee]">
                    {tags.map((tag, index) => {
                        const isLightColor = /^#(?:[fF]{2}|[eE]{2}|[dD]{2})/.test(tag.color);
                        const textClass = isLightColor ? "text-[#080d12]" : "text-white";

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${textClass} shadow-sm`}
                                style={{ backgroundColor: normalizeHex(tag.color) }}
                            >
                                <span>{tag.label}</span>
                                <button
                                    onClick={() => handleRemoveTag(index)}
                                    className={`ml-0.5 rounded hover:opacity-75 transition-opacity ${textClass}`}
                                    title="削除"
                                >
                                    <FaTimes className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {tags.length === 0 && (
                <div className="text-center py-4 text-[#6f767a] text-sm bg-[#f6f9fb] rounded border border-dashed border-[#cad3d8]">
                    タグが追加されていません
                </div>
            )}
        </div>
    );
}