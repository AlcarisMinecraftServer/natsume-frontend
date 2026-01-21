import EffectListEditor from "../../../common/EffectListEditor";
import BuffListEditor from "../../../common/BuffListEditor";

import { Effect, Buff } from "../../types";

const Slots = [
    "chest", "feet", "head", "legs"
] as const;

type ArmorType = typeof Slots[number];

type ArmorData = {
    armor_type: ArmorType;
    required_level: number;
    max_modification: number;
    durability: number;
    base: ArmorBase;
};

type ArmorBase = {
    attributes: any;
    effects: Effect[];
    buffs: Buff[];
}

type Props = {
    data: ArmorData;
    onChange: (newData: ArmorData) => void;
};

export default function ArmorForm({ data, onChange }: Props) {
    const update = <K extends keyof ArmorData>(key: K, value: ArmorData[K]) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#6f767a]">アーマー種 (Armor Type)</label>
                <div className="relative">
                    <select
                        value={data.armor_type}
                        onChange={(e) =>
                            onChange({
                                ...data,
                                armor_type: e.target.value as ArmorType,
                            })
                        }
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors appearance-none"
                    >
                        {Slots.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#6f767a]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">必要レベル (Required Level)</label>
                    <input
                        type="number"
                        value={data.required_level}
                        onChange={(e) => update("required_level", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">研磨回数上限 (Max Modification)</label>
                    <input
                        type="number"
                        value={data.max_modification}
                        onChange={(e) => update("max_modification", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">耐久値 (Durability)</label>
                    <input
                        type="number"
                        value={data.durability}
                        onChange={(e) => update("durability", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
            </div>

            <EffectListEditor
                initial={data.base.effects}
                onChange={v =>
                    onChange({
                        ...data,
                        base: { ...data.base, effects: v },
                    })
                }
            />
            <BuffListEditor
                initial={data.base.buffs}
                onChange={v =>
                    onChange({
                        ...data,
                        base: { ...data.base, buffs: v },
                    })
                }
            />
        </div>
    );
}
