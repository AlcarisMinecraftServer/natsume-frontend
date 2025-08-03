import NumberInput from "@/components/form/NumberInput";
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

// type ArmorAttribute = {
//     attack_damage: number;
//     movement_speed: number;
//     attack_range: number;
//     attack_speed: number;
//     experience_bonus: number;
//     drop_rate_bonus: number;
// }

type Props = {
    data: ArmorData;
    onChange: (newData: ArmorData) => void;
};

export default function ArmorForm({ data, onChange }: Props) {
    const update = <K extends keyof ArmorData>(key: K, value: ArmorData[K]) => {
        onChange({ ...data, [key]: value });
    };

    // const updateAttr = <K extends keyof ArmorAttribute>(
    //     key: K,
    //     value: ArmorAttribute[K],
    // ) =>
    //     onChange({
    //         ...data,
    //         base: {
    //             ...data.base,
    //             attributes: { ...data.base.attributes, [key]: value },
    //         },
    //     });

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm mb-1 text-white">Armor Type (アーマー種)</label>
                <select
                    value={data.armor_type}
                    onChange={(e) =>
                        onChange({
                            ...data,
                            armor_type: e.target.value as ArmorType,
                        })
                    }
                    className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
                >
                    {Slots.map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <NumberInput
                label="Required Level (必要レベル)"
                value={data.required_level}
                onChange={(v) => update("required_level", v)}
            />
            <NumberInput
                label="Max Modification (研磨回数上限)"
                value={data.max_modification}
                onChange={(v) => update("max_modification", v)}
            />
            <NumberInput
                label="Durability (耐久値)"
                value={data.durability}
                onChange={(v) => update("durability", v)}
            />


            <div className="grid grid-cols-2 gap-4">
                {/* <NumberInput
                    label="Attack Damage (攻撃力)"
                    value={data.base.attributes.attack_damage}
                    onChange={(v) => updateAttr("attack_damage", v)}
                />
                <NumberInput
                    label="Movement Speed (移動速度)"
                    value={data.base.attributes.movement_speed}
                    onChange={(v) => updateAttr("movement_speed", v)}
                />
                <NumberInput
                    label="Attack Range (攻撃距離)"
                    value={data.base.attributes.attack_range}
                    onChange={(v) => updateAttr("attack_range", v)}
                />
                <NumberInput
                    label="Attack Speed (攻撃速度)"
                    value={data.base.attributes.attack_speed}
                    onChange={(v) => updateAttr("attack_speed", v)}
                />
                <NumberInput
                    label="EXP Bonus (EXP ボーナス)"
                    value={data.base.attributes.experience_bonus}
                    onChange={(v) => updateAttr("experience_bonus", v)}
                />
                <NumberInput
                    label="Drop Rate Bonus (ドロップ率ボーナス)"
                    value={data.base.attributes.drop_rate_bonus}
                    onChange={(v) => updateAttr("drop_rate_bonus", v)}
                /> */}
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
