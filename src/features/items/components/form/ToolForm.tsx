import RulesEditor from "@/features/items/components/form/RulesEditor";
import { ToolData } from "@/features/items/types";

type Props = {
    data: ToolData;
    onChange: (data: ToolData) => void;
};

export default function ToolForm({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#6f767a]">ツール種 (Tool Type)</label>
                <div className="relative">
                    <select
                        value={data.tool_type}
                        onChange={(e) => onChange({ ...data, tool_type: e.target.value })}
                        className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors appearance-none"
                    >
                        {["pickaxe", "axe", "shovel", "hoe", "sword"].map((type) => (
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

            <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#6f767a]">耐久値 (Max Damage)</label>
                <input
                    type="number"
                    value={data.max_damage}
                    onChange={(e) => onChange({ ...data, max_damage: Number(e.target.value) })}
                    className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                    onWheel={(e) => e.currentTarget.blur()}
                />
            </div>

            <RulesEditor rawJson={data.rules} />
        </div>
    );
}
