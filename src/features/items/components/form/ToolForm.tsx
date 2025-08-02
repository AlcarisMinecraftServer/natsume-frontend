import NumberInput from "@/components/form/NumberInput";
import RulesEditor from "@/features/items/components/form/RulesEditor";
import { ToolData } from "@/features/items/types";

type Props = {
    data: ToolData;
    onChange: (data: ToolData) => void;
};

export default function ToolForm({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm mb-1 text-white">Tool Type (ツール種)</label>
                <select
                    value={data.tool_type}
                    onChange={(e) => onChange({ ...data, tool_type: e.target.value })}
                    className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
                >
                    {["pickaxe", "axe", "shovel", "hoe", "sword"].map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <NumberInput
                label="Max Damage (耐久値)"
                value={data.max_damage}
                onChange={(v) => onChange({ ...data, max_damage: v })}
            />

            <RulesEditor rawJson={data.rules} />
        </div>
    );
}
