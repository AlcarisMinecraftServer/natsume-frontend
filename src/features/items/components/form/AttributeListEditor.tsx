import { TbTrash, TbPlus } from "react-icons/tb";
import NumberInput from "@/components/form/NumberInput";
import TextField from "@/components/form/TextField";
import { Attribute } from "@/features/items/types";

type Props = {
    initial: Attribute[];
    onChange: (v: Attribute[]) => void;
};

export default function AttributeListEditor({ initial, onChange }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = (index: number, key: keyof Attribute, val: any) => {
        const updated = [...initial];
        updated[index] = { ...updated[index], [key]: val };
        onChange(updated);
    };

    const addAttribute = () => {
        onChange([...initial, { attribute: "", operation: "", value: 0, duration: 0 }]);
    };

    const removeAttribute = (index: number) => {
        onChange(initial.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#1f2227] p-4 rounded space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Attributes (属性)</h3>
                <button
                    onClick={addAttribute}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                >
                    <TbPlus size={16} />
                    追加
                </button>
            </div>

            {initial.map((attr, index) => (
                <div
                    key={index}
                    className="bg-[#2a2d33] p-4 rounded space-y-3 border border-gray-700"
                >
                    <div className="text-md font-semibold text-gray-300 mb-1">
                        Attribute #{index + 1}
                    </div>
                    <TextField
                        label="Attribute"
                        value={attr.attribute}
                        onChange={(v) => update(index, "attribute", v)}
                    />
                    <TextField
                        label="Operation"
                        value={attr.operation}
                        onChange={(v) => update(index, "operation", v)}
                    />
                    <NumberInput
                        label="Value"
                        value={attr.value}
                        onChange={(v) => update(index, "value", v)}
                    />
                    <NumberInput
                        label="Duration"
                        value={attr.duration}
                        onChange={(v) => update(index, "duration", v)}
                    />
                    <button
                        onClick={() => removeAttribute(index)}
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
