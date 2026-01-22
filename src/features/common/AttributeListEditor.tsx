import { TbTrash, TbPlus } from "react-icons/tb";
import { Attribute } from "@/features/items/types";

type Props = {
    initial: Attribute[];
    onChange: (v: Attribute[]) => void;
};

export default function AttributeListEditor({ initial, onChange }: Props) {
    const update = (index: number, key: keyof Attribute, val: any) => {
        const updated = [...initial];
        updated[index] = { ...updated[index], [key]: val };
        onChange(updated);
    };

    const addAttribute = () => {
        onChange([...initial, { attribute: "", operation: "", value: 0, duration: 0 }]);
    };

    const removeAttribute = (index: number) => {
        onChange(initial.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#ffffff] rounded-xl border border-[#e2eaee] p-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[#080d12]">Attributes (属性)</h3>
                <button
                    onClick={addAttribute}
                    className="flex items-center gap-1 bg-[#24afff] hover:bg-[#099bff] text-white text-sm px-3 py-1.5 rounded transition-colors"
                >
                    <TbPlus size={16} />
                    追加
                </button>
            </div>

            {initial.map((attr, index) => (
                <div
                    key={index}
                    className="bg-[#f6f9fb] p-4 rounded-xl space-y-3 border border-[#e2eaee]"
                >
                    <div className="text-md font-semibold text-[#080d12] mb-1">
                        属性 #{index + 1}
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">属性 (Attribute)</label>
                        <input
                            type="text"
                            value={attr.attribute}
                            onChange={(e) => update(index, "attribute", e.target.value)}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">操作 (Operation)</label>
                        <input
                            type="text"
                            value={attr.operation}
                            onChange={(e) => update(index, "operation", e.target.value)}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">値 (Value)</label>
                        <input
                            type="number"
                            value={attr.value}
                            onChange={(e) => update(index, "value", Number(e.target.value))}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">持続時間 (Duration)</label>
                        <input
                            type="number"
                            value={attr.duration}
                            onChange={(e) => update(index, "duration", Number(e.target.value))}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                    </div>

                    <button
                        onClick={() => removeAttribute(index)}
                        className="text-[#ff6161] hover:text-[#ff4d4d] text-sm mt-1 flex items-center gap-1 transition-colors"
                    >
                        <TbTrash size={16} />
                        削除
                    </button>
                </div>
            ))}
        </div>
    );
}
