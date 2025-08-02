import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ConfirmDeleteModal from "./modal/ItemDeleteModal";
import { Tag } from "../types";

type SortKey = "id" | "category" | "name" | "version";
const ITEMS_PER_PAGE = 10;

export default function ItemList({ items }: { items: any[] }) {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const sortIcon = (key: SortKey) => {
        if (sortKey !== key) return "↕";
        return sortOrder === "asc" ? "▲" : "▼";
    };

    const sortedItems = [...items].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        const comp = aValue > bValue ? 1 : -1;
        return sortOrder === "asc" ? comp : -comp;
    });

    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    const paginatedItems = sortedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-4 pb-24">
            <div className="flex flex-wrap gap-3 text-sm text-white">
                <button onClick={() => toggleSort("id")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#333] border border-gray-700">
                    IDで並び替え {sortKey === "id" && sortIcon("id")}
                </button>
                <button onClick={() => toggleSort("category")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#333] border border-gray-700">
                    カテゴリー {sortKey === "category" && sortIcon("category")}
                </button>
                <button onClick={() => toggleSort("name")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#333] border border-gray-700">
                    アイテム名 {sortKey === "name" && sortIcon("name")}
                </button>
                <button onClick={() => toggleSort("version")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#333] border border-gray-700">
                    更新日 {sortKey === "version" && sortIcon("version")}
                </button>
            </div>

            {paginatedItems.map((item) => (
                <div
                    key={item.id}
                    className="relative bg-[#1c1e22] border border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-lg transition"
                >
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={() => navigate(`/items/edit/${item.id}`)}
                            className="p-1.5 rounded bg-[#2d2d31] text-white border border-gray-600 hover:bg-[#3a3a40]"
                            title="編集"
                        >
                            <FaPencilAlt size={12} />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedItem(item);
                                setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-[#2d2d31] text-red-400 border border-gray-600 hover:bg-[#3a3a40]"
                            title="削除"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>

                    <div className="pr-16">
                        <div className="text-base font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.name} <span className="text-sm text-gray-400">({item.id})</span>
                        </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-400 space-y-1 leading-relaxed">
                        <div><span className="font-medium text-gray-300">カテゴリー:</span> {item.category}</div>
                        <div><span className="font-medium text-gray-300">更新日:</span> {new Date(item.version * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {item.tags?.map((tag: Tag, i: number) => {
                                const isLightColor = /^#(?:[fF]{2}|[eE]{2}|[dD]{2})/.test(tag.color);
                                const textClass = isLightColor ? "text-black" : "text-white";
                                return (
                                    <span
                                        key={i}
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${textClass}`}
                                        style={{ backgroundColor: tag.color }}
                                    >
                                        {tag.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}

            <ConfirmDeleteModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    if (selectedItem) {
                        fetch(`${import.meta.env.VITE_API_URL}/items/${selectedItem.id}`, {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
                            }
                        }).then(() => location.reload());
                    }
                    setIsModalOpen(false);
                }}
                itemName={selectedItem?.name}
                itemId={selectedItem?.id}
            />

            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-gray-700 text-white text-sm px-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded border border-gray-600 hover:bg-[#333] disabled:opacity-40"
                    >
                        <FaChevronLeft /> 前へ
                    </button>
                    <span className="text-sm">
                        {currentPage} / {totalPages} ページ
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 rounded border border-gray-600 hover:bg-[#333] disabled:opacity-40"
                    >
                        次へ <FaChevronRight />
                    </button>
                </div>
            )}

            {items.length === 0 && (
                <div className="text-center text-gray-500 py-4">該当するアイテムはありません</div>
            )}
        </div>
    );
}
