type SubmitButtonProps = {
    label?: string;
    onClick: () => void;
    disabled?: boolean;
};

export default function SubmitButton({
    label = "作成",
    onClick,
    disabled = false,
}: SubmitButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`fixed bottom-2 right-6 mt-6 px-4 py-2 rounded text-white transition-colors ${disabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
        >
            {label}
        </button>
    );
}