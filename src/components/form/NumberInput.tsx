import { useRef } from "react";

type NumberInputWithSpinProps = {
    label: string;
    value: number;
    onChange: (value: number) => void;
    step?: number;
    error?: boolean;
};

export default function NumberInputWithSpin({
    label,
    value,
    onChange,
    step = 1,
    error = false,
}: NumberInputWithSpinProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative">
            <label className="block text-sm mb-1">{label}</label>
            <input
                ref={inputRef}
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`
                    w-full pr-8 rounded bg-[#2a2d33] text-gray-100 placeholder-gray-400
                    shadow-inner px-3 py-2 text-sm focus:outline-none
                    focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                    border ${error ? "border-red-500" : "border-gray-700"}
                `}
            />
            <div className="absolute inset-y-0 top-6 right-0 flex flex-col rounded overflow-hidden border-l border-gray-700 divide-y divide-gray-700 select-none">
                <button
                    type="button"
                    className="flex h-5 w-6 items-center justify-center bg-gray-700/40 text-gray-300 hover:bg-indigo-500/60 hover:text-white transition-colors"
                    onClick={() => {
                        if (inputRef.current) {
                            inputRef.current.stepUp();
                            onChange(Number(inputRef.current.value));
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-2.5">
                        <path d="M12 10L8 6l-4 4" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
                <button
                    type="button"
                    className="flex h-5 w-6 items-center justify-center bg-gray-700/40 text-gray-300 hover:bg-indigo-500/60 hover:text-white transition-colors"
                    onClick={() => {
                        if (inputRef.current) {
                            inputRef.current.stepDown();
                            onChange(Number(inputRef.current.value));
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-2.5">
                        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
