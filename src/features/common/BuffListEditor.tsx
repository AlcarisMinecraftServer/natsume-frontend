import { TbTrash, TbPlus } from "react-icons/tb";
import { Buff } from "@/features/items/types";

type Props = {
    initial: Buff[];
    onChange: (v: Buff[]) => void;
};

export default function BuffListEditor({ initial, onChange }: Props) {
    const update = (index: number, key: keyof Buff, val: any) => {
        const updated = [...initial];
        updated[index] = { ...updated[index], [key]: val };
        onChange(updated);
    };

    const addBuff = () => {
        onChange([...initial, { kind: "", duration: 0, amount: 0 }]);
    };

    const removeBuff = (index: number) => {
        onChange(initial.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#ffffff] rounded-xl border border-[#e2eaee] p-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[#080d12]">Buffs (バフ)</h3>
                <button
                    onClick={addBuff}
                    className="flex items-center gap-1 bg-[#24afff] hover:bg-[#099bff] text-white text-sm px-3 py-1.5 rounded transition-colors"
                >
                    <TbPlus size={16} />
                    追加
                </button>
            </div>

            {initial.map((buff, index) => (
                <div
                    key={index}
                    className="bg-[#f6f9fb] p-4 rounded-xl space-y-3 border border-[#e2eaee]"
                >
                    <div className="text-md font-semibold text-[#080d12] mb-1">
                        バフ #{index + 1}
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">種類 (Kind)</label>
                        <input
                            type="text"
                            value={buff.kind}
                            onChange={(e) => update(index, "kind", e.target.value)}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">持続時間 (Duration)</label>
                        <input
                            type="number"
                            value={buff.duration}
                            onChange={(e) => update(index, "duration", Number(e.target.value))}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-[#6f767a]">数値 (Amount)</label>
                        <input
                            type="number"
                            value={buff.amount}
                            onChange={(e) => update(index, "amount", Number(e.target.value))}
                            className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                    </div>

                    <button
                        onClick={() => removeBuff(index)}
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
