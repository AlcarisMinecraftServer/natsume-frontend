import { TbTrash, TbPlus } from "react-icons/tb";
import NumberInput from "@/components/form/NumberInput";
import TextField from "@/components/form/TextField";
import { Effect } from "@/features/items/types";

type Props = {
    initial: Effect[];
    onChange: (v: Effect[]) => void;
};

export default function EffectListEditor({ initial, onChange }: Props) {
    const update = (index: number, key: keyof Effect, val: any) => {
        const updated = [...initial];
        updated[index] = { ...updated[index], [key]: val };
        onChange(updated);
    };

    const addEffect = () => {
        onChange([...initial, { effect: "", duration: 0, amplifier: 0, chance: 1.0 }]);
    };

    const removeEffect = (index: number) => {
        onChange(initial.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#1f2227] p-4 rounded space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Effects (エフェクト)</h3>
                <button
                    onClick={addEffect}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                >
                    <TbPlus size={16} />
                    追加
                </button>
            </div>

            {initial.map((eff, index) => (
                <div
                    key={index}
                    className="bg-[#2a2d33] p-4 rounded space-y-3 border border-gray-700"
                >
                    <div className="text-md font-semibold text-gray-300 mb-1">
                        Effect #{index + 1}
                    </div>
                    <TextField
                        label="Effect"
                        value={eff.effect}
                        onChange={(v) => update(index, "effect", v)}
                    />
                    <NumberInput
                        label="Duration"
                        value={eff.duration}
                        onChange={(v) => update(index, "duration", v)}
                    />
                    <NumberInput
                        label="Amplifier"
                        value={eff.amplifier}
                        onChange={(v) => update(index, "amplifier", v)}
                    />
                    <NumberInput
                        label="Chance"
                        value={eff.chance}
                        step={0.1}
                        onChange={(v) => update(index, "chance", v)}
                    />
                    <button
                        onClick={() => removeEffect(index)}
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
