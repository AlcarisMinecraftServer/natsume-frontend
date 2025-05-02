type Props = {
    value: string[];
    onChange: (value: string[]) => void;
    error?: boolean;
};

export default function LoreInput({ value = [], onChange, error }: Props) {
    return (
        <div>
            <label className="block text-sm mb-1">Lore</label>
            <textarea
                value={value.join("\n")}
                onChange={(e) => onChange(e.target.value.split("\n"))}
                rows={4}
                className={`w-full bg-[#2a2d33] text-white px-3 py-2 rounded border ${
                    error ? "border-red-500" : "border-gray-600"
                }`}
            ></textarea>
        </div>
    );
}
