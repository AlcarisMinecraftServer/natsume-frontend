import NumberInput from "@/components/form/NumberInput";
import Checkbox from "@/components/form/Checkbox";
import EffectListEditor from "./EffectListEditor";
import AttributeListEditor from "./AttributeListEditor";
import BuffListEditor from "./BuffListEditor";

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
            <NumberInput
                label="Nutrition (満腹度)"
                value={data.nutrition}
                onChange={(v) => update("nutrition", v)}
            />
            <NumberInput
                label="Saturation (隠し満腹度)"
                value={data.saturation}
                onChange={(v) => update("saturation", v)}
            />
            <Checkbox
                label="Can Always Eat (いつでも食べれるかどうか)"
                checked={data.can_always_eat}
                onChange={(v) => update("can_always_eat", v)}
            />
            <NumberInput
                label="Eat Time (食べる時間/秒)"
                value={data.eat_seconds}
                onChange={(v) => update("eat_seconds", v)}
            />

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
