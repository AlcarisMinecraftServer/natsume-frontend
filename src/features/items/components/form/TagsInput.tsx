import { FaTimes } from "react-icons/fa";
import { Tag } from "@/features/items/types";

type Props = {
    tags: Tag[];
    newTag: Tag;
    tagError: { label?: boolean; color?: boolean };
    onNewTagChange: (tag: Tag) => void;
    onAddTag: () => void;
    onRemoveTag: (index: number) => void;
};

export default function TagsInput({
    tags = [],
    newTag,
    tagError,
    onNewTagChange,
    onAddTag,
    onRemoveTag,
}: Props) {
    return (
        <div>
            <label className="block text-sm mb-1">Tags (タグ)</label>

            <div className="flex gap-2 mb-2 items-center">
                <input
                    type="text"
                    placeholder="Label"
                    value={newTag.label}
                    onChange={(e) => onNewTagChange({ ...newTag, label: e.target.value })}
                    className={`flex-1 bg-[#2a2d33] text-white px-3 py-2 rounded border ${
                        tagError.label ? "border-red-500" : "border-gray-600"
                    }`}
                />
                <input
                    type="text"
                    placeholder="Color"
                    value={newTag.color}
                    onChange={(e) => onNewTagChange({ ...newTag, color: e.target.value })}
                    className={`w-[120px] bg-[#2a2d33] text-white px-3 py-2 rounded border ${
                        tagError.color ? "border-red-500" : "border-gray-600"
                    }`}
                />
                <input
                    type="color"
                    value={newTag.color.startsWith("#") ? newTag.color : "#ffffff"}
                    onChange={(e) => onNewTagChange({ ...newTag, color: e.target.value })}
                    className="w-10 h-10 p-0 border border-gray-600 bg-transparent rounded"
                    title="Pick color"
                />
                <button
                    onClick={onAddTag}
                    className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                    追加
                </button>
            </div>

            <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => {
                    const isLightColor = /^#(?:[fF]{2}|[eE]{2}|[dD]{2})/.test(tag.color);
                    const textClass = isLightColor ? "text-black" : "text-white";

                    return (
                        <div
                            key={index}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${textClass}`}
                            style={{ backgroundColor: tag.color }}
                        >
                            <span>{tag.label}</span>
                            <button
                                onClick={() => onRemoveTag(index)}
                                className={`ml-1 rounded hover:opacity-75 ${textClass}`}
                                title="削除"
                            >
                                <FaTimes className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
