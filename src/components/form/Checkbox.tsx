type Props = {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
};

export default function Checkbox({ label, checked, onChange }: Props) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${checked ? "bg-blue-600" : "bg-gray-400"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${checked ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
}
