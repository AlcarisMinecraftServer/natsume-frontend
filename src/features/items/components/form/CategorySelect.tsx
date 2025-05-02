import { FormData } from "@/features/items/types";

type Props = {
    value: FormData["category"];
    onChange: (value: FormData["category"]) => void;
};

export default function CategorySelect({ value, onChange }: Props) {
    return (
        <div>
            <label className="block text-sm mb-1">Category</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as FormData["category"])}
                className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
            >
                <option value="food">食料</option>
                <option value="tools">ツール</option>
                <option value="material">素材</option>
                <option value="weapon">武器</option>
            </select>
        </div>
    );
}
