type Props = {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: boolean;
};

export default function TextField({ label, value, placeholder, onChange, onBlur, error }: Props) {
    return (
        <div>
            <label className="block text-sm mb-1">{label}</label>
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className={`w-full bg-[#2a2d33] text-white px-3 py-2 rounded border ${error ? "border-red-500" : "border-gray-600"}`}
            />
        </div>
    );
}
