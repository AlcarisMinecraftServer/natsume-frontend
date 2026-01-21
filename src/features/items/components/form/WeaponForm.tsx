import EffectListEditor from "../../../common/EffectListEditor";
import BuffListEditor from "../../../common/BuffListEditor";

import { Effect, Buff } from "../../types";

const WEAPON_TYPES = [
    "dagger", "sword", "spear", "staff", "bow"
] as const;

type WeaponType = typeof WEAPON_TYPES[number];

type WeaponData = {
    weapon_type: WeaponType;
    required_level: number;
    max_modification: number;
    durability: number;
    base: WeaponBase;
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

export default function WeaponForm({ data, onChange }: Props) {
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
            <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#6f767a]">武器種 (Weapon Type)</label>
                <div className="relative">
                    <select
                        value={data.weapon_type}
                        onChange={(e) =>
                            onChange({
                                ...data,
                                weapon_type: e.target.value as WeaponType,
                            })
                        }
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors appearance-none"
                    >
                        {WEAPON_TYPES.map((type) => (
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

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">攻撃力 (Attack Damage)</label>
                    <input
                        type="number"
                        value={data.base.attributes.attack_damage}
                        onChange={(e) => updateAttr("attack_damage", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">移動速度 (Movement Speed)</label>
                    <input
                        type="number"
                        value={data.base.attributes.movement_speed}
                        onChange={(e) => updateAttr("movement_speed", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">攻撃距離 (Attack Range)</label>
                    <input
                        type="number"
                        value={data.base.attributes.attack_range}
                        onChange={(e) => updateAttr("attack_range", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">攻撃速度 (Attack Speed)</label>
                    <input
                        type="number"
                        value={data.base.attributes.attack_speed}
                        onChange={(e) => updateAttr("attack_speed", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">EXPボーナス (EXP Bonus)</label>
                    <input
                        type="number"
                        value={data.base.attributes.experience_bonus}
                        onChange={(e) => updateAttr("experience_bonus", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">ドロップ率ボーナス (Drop Rate Bonus)</label>
                    <input
                        type="number"
                        value={data.base.attributes.drop_rate_bonus}
                        onChange={(e) => updateAttr("drop_rate_bonus", Number(e.target.value))}
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
