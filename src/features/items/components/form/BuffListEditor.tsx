import { TbTrash, TbPlus } from "react-icons/tb";
import NumberInput from "@/components/form/NumberInput";
import TextField from "@/components/form/TextField";
import { Buff } from "@/features/items/types";

type Props = {
    initial: Buff[];
    onChange: (v: Buff[]) => void;
};

export default function BuffListEditor({ initial, onChange }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <div className="bg-[#1f2227] p-4 rounded space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Buffs</h3>
                <button
                    onClick={addBuff}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                >
                    <TbPlus size={16} />
                    追加
                </button>
            </div>

            {initial.map((buff, index) => (
                <div
                    key={index}
                    className="bg-[#2a2d33] p-4 rounded space-y-3 border border-gray-700"
                >
                    <div className="text-md font-semibold text-gray-300 mb-1">
                        Buff #{index + 1}
                    </div>
                    <TextField
                        label="Kind"
                        value={buff.kind}
                        onChange={(v) => update(index, "kind", v)}
                    />
                    <NumberInput
                        label="Duration"
                        value={buff.duration}
                        onChange={(v) => update(index, "duration", v)}
                    />
                    <NumberInput
                        label="Amount"
                        value={buff.amount}
                        onChange={(v) => update(index, "amount", v)}
                    />
                    <button
                        onClick={() => removeBuff(index)}
                        className="text-red-400 text-sm mt-1 flex items-center gap-1 hover:underline"
                    >
                        <TbTrash size={16} />
                        削除
                    </button>
                </div>
            ))}
        </div>
    );
}
