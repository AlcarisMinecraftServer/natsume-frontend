import NumberInput from "@/components/form/NumberInput";
import EffectListEditor from "./EffectListEditor";
import BuffListEditor from "./BuffListEditor";

import { Effect, Buff } from "../../types";

const WEAPON_TYPES = [
    "sword",
] as const;

type WeaponType = typeof WEAPON_TYPES[number];

type WeaponData = {
    weapon_type: WeaponType;
    required_level: number;
    max_modification: number;
    durability: number;
    base: WeaponBase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upgrades: any[];
};

type WeaponBase = {
    attributes: WeaponAttribute;
    effects: Effect[];
    buffs: Buff[];
}

type WeaponAttribute = {
    attack_damage: number;
    movement_speed: number;
    attack_range: number;
    attack_speed: number;
    experience_bonus: number;
    drop_rate_bonus: number;
}

type Props = {
    data: WeaponData;
    onChange: (newData: WeaponData) => void;
};

export default function FoodForm({ data, onChange }: Props) {
    const update = <K extends keyof WeaponData>(key: K, value: WeaponData[K]) => {
        onChange({ ...data, [key]: value });
    };

    const updateAttr = <K extends keyof WeaponAttribute>(
        key: K,
        value: WeaponAttribute[K],
    ) =>
        onChange({
            ...data,
            base: {
                ...data.base,
                attributes: { ...data.base.attributes, [key]: value },
            },
        });

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm mb-1 text-white">Weapon Type</label>
                <select
                    value={data.weapon_type}
                    onChange={(e) =>
                        onChange({
                            ...data,
                            weapon_type: e.target.value as WeaponType,
                        })
                    }
                    className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
                >
                    {WEAPON_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <NumberInput
                label="Required Level"
                value={data.required_level}
                onChange={(v) => update("required_level", v)}
            />
            <NumberInput
                label="Max Modification"
                value={data.max_modification}
                onChange={(v) => update("max_modification", v)}
            />
            <NumberInput
                label="Durability"
                value={data.durability}
                onChange={(v) => update("durability", v)}
            />


            <div className="grid grid-cols-2 gap-4">
                <NumberInput
                    label="Attack Damage"
                    value={data.base.attributes.attack_damage}
                    onChange={(v) => updateAttr("attack_damage", v)}
                />
                <NumberInput
                    label="Movement Speed"
                    value={data.base.attributes.movement_speed}
                    onChange={(v) => updateAttr("movement_speed", v)}
                />
                <NumberInput
                    label="Attack Range"
                    value={data.base.attributes.attack_range}
                    onChange={(v) => updateAttr("attack_range", v)}
                />
                <NumberInput
                    label="Attack Speed"
                    value={data.base.attributes.attack_speed}
                    onChange={(v) => updateAttr("attack_speed", v)}
                />
                <NumberInput
                    label="EXP Bonus"
                    value={data.base.attributes.experience_bonus}
                    onChange={(v) => updateAttr("experience_bonus", v)}
                />
                <NumberInput
                    label="Drop Rate Bonus"
                    value={data.base.attributes.drop_rate_bonus}
                    onChange={(v) => updateAttr("drop_rate_bonus", v)}
                />
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
