type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    itemId?: string;
}

export default function ConfirmDeleteModal({ open, onClose, onConfirm, itemName, itemId }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-[#2a2d33] text-white p-6 rounded shadow-lg w-full max-w-sm border border-gray-700">
                <h2 className="text-lg font-bold mb-4">本当に削除する？</h2>
                <p className="mb-4">
                    「<span className="font-semibold">{itemName}</span> {`(${itemId})`}」を削除してもよろしいですか？
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                        onClick={onClose}>
                        キャンセル
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}>
                        削除
                    </button>
                </div>
            </div>
        </div>
    )
}