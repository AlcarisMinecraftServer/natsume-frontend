import { FaTimes } from "react-icons/fa";

export default function ItemFilterModal({
    visible,
    setVisible,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    tagInput,
    setTagInput
}: {
    visible: boolean;
    setVisible: (v: boolean) => void;
    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    tagInput: string;
    setTagInput: (v: string) => void;
}) {
    const allCategories = ["weapon", "tool", "material", "food"];

    const handleAddTag = () => {
        if (tagInput && !selectedTags.includes(tagInput)) {
            setSelectedTags([...selectedTags, tagInput]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2a2d33] p-6 rounded-lg w-full max-w-md border border-gray-600">
                <h2 className="text-lg font-bold mb-4">検索オプション</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-gray-300">カテゴリ</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-[#1c1e22] border border-gray-700 text-white px-3 py-2 rounded"
                        >
                            <option value="">すべてのカテゴリ</option>
                            {allCategories.map((cat) => (
                                <option key={cat} value={cat} className="capitalize">{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-gray-300">タグ</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTags.map((tag) => (
                                <span key={tag} className="bg-cyan-500 text-white px-2 py-1 text-xs rounded flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)}>
                                        <FaTimes className="text-white text-xs" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="タグを入力"
                                className="flex-1 bg-[#1c1e22] border border-gray-700 text-white px-3 py-2 rounded"
                            />
                            <button
                                onClick={handleAddTag}
                                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={() => setVisible(false)}
                        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
