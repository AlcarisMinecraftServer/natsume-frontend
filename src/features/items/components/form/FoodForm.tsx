import EffectListEditor from "../../../common/EffectListEditor";
import AttributeListEditor from "../../../common/AttributeListEditor";
import BuffListEditor from "../../../common/BuffListEditor";

import { Effect, Attribute, Buff } from "../../types";

type FoodData = {
    nutrition: number;
    saturation: number;
    can_always_eat: boolean;
    eat_seconds: number;
    effects: Effect[];
    attributes: Attribute[];
    buffs: Buff[];
};

type Props = {
    data: FoodData;
    onChange: (newData: FoodData) => void;
};

export default function FoodForm({ data, onChange }: Props) {
    const update = <K extends keyof FoodData>(key: K, value: FoodData[K]) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">満腹度 (Nutrition)</label>
                    <input
                        type="number"
                        value={data.nutrition}
                        onChange={(e) => update("nutrition", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">隠し満腹度 (Saturation)</label>
                    <input
                        type="number"
                        value={data.saturation}
                        onChange={(e) => update("saturation", Number(e.target.value))}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                        onWheel={(e) => e.currentTarget.blur()}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={data.can_always_eat}
                    onChange={(e) => update("can_always_eat", e.target.checked)}
                    className="w-4 h-4 rounded border-[#cad3d8] text-[#24afff] focus:ring-[#24afff] focus:ring-offset-0"
                />
                <label
                    className="text-sm font-semibold text-[#080d12] cursor-pointer select-none"
                    onClick={() => update("can_always_eat", !data.can_always_eat)}
                >
                    いつでも食べれる (Can Always Eat)
                </label>
            </div>

            <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#6f767a]">食べる時間/秒 (Eat Time)</label>
                <input
                    type="number"
                    value={data.eat_seconds}
                    onChange={(e) => update("eat_seconds", Number(e.target.value))}
                    className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                    onWheel={(e) => e.currentTarget.blur()}
                />
            </div>

            <EffectListEditor
                initial={data.effects ?? []}
                onChange={(v) => update("effects", v)}
            />
            <AttributeListEditor
                initial={data.attributes ?? []}
                onChange={(v) => update("attributes", v)}
            />
            <BuffListEditor
                initial={data.buffs ?? []}
                onChange={(v) => update("buffs", v)}
            />
        </div>
    );
}
