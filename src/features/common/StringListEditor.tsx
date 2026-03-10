import { TbTrash, TbPlus } from "react-icons/tb";

type Props = {
    title: string;
    description?: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
};

export default function StringListEditor({
    title,
    description,
    items,
    onChange,
    placeholder = "アイテムを入力"
}: Props) {
    const updateItem = (index: number, value: string) => {
        const updated = [...items];
        updated[index] = value;
        onChange(updated);
    };

    const addItem = () => {
        onChange([...items, ""]);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#ffffff] rounded-xl border border-[#e2eaee] p-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-[#080d12]">{title}</h3>
                    {description && (
                        <p className="text-sm text-[#6f767a] mt-1">{description}</p>
                    )}
                </div>
                <button
                    onClick={addItem}
                    className="flex items-center gap-1 bg-[#24afff] hover:bg-[#099bff] text-white text-sm px-3 py-1.5 rounded transition-colors"
                >
                    <TbPlus size={16} />
                    追加
                </button>
            </div>

            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-[#f6f9fb] p-4 rounded-xl space-y-3 border border-[#e2eaee]"
                >
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="block text-[11px] font-semibold text-[#6f767a]">
                                アイテム #{index + 1}
                            </label>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateItem(index, e.target.value)}
                                placeholder={placeholder}
                                className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                            />
                        </div>
                        <button
                            onClick={() => removeItem(index)}
                            className="text-[#ff6161] hover:text-[#ff4d4d] mt-6 flex items-center gap-1 transition-colors"
                        >
                            <TbTrash size={16} />
                        </button>
                    </div>
                </div>
            ))}

            {items.length === 0 && (
                <div className="text-center py-4 text-[#6f767a] text-sm bg-[#f6f9fb] rounded border border-dashed border-[#cad3d8]">
                    アイテムが追加されていません
                </div>
            )}
        </div>
    );
}