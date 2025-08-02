import { useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import ConfirmDeleteModal from "./modal/ItemDeleteModal";
import { useNavigate } from "react-router-dom";
import { Tag } from "../types";

type SortKey = "id" | "category" | "name" | "version"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ItemList({ items }: { items: any[] }) {
    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const handleDelete = async (id: string) => {
        await fetch(`${import.meta.env.VITE_API_URL}/items/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            }
        });

        location.reload();
    }

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key);
            setSortOrder("asc")
        }
    }

    const sortedItems = [...items].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;

        const comp = aValue > bValue ? 1 : -1;
        return sortOrder === "asc" ? comp : -comp
    })

    const sortIcon = (key: SortKey) => {
        if (sortKey !== key) return "↕";
        return sortOrder === "asc" ? "▲" : "▼";
    }

    return (
        <div className="bg-[#151517] border border-gray-700 rounded overflow-hidden text-sm">
            <div className="hidden md:grid grid-cols-5 bg-[#151517] px-4 py-2 font-semibold border-b border-gray-700 text-gray-300">
                <div className="flex gap-1 cursor-pointer select-none" onClick={() => toggleSort("id")}>
                    ID <span>{sortIcon("id")}</span>
                </div>
                <div className="flex gap-1 cursor-pointer select-none" onClick={() => toggleSort("category")}>
                    カテゴリー <span>{sortIcon("category")}</span>
                </div>
                <div className="flex gap-1 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    アイテム名 <span>{sortIcon("name")}</span>
                </div>
                <div className="flex gap-1 cursor-pointer select-none" onClick={() => toggleSort("version")}>
                    更新日 <span>{sortIcon("version")}</span>
                </div>
                <div>Tags</div>
            </div>

            {sortedItems.map((item, index) => (
                <div
                    key={item.id}
                    className={`px-4 py-3 ${index !== items.length - 1 ? "border-b border-gray-700" : ""} hover:bg-[#2a2d33]`}
                >
                    <div className="hidden md:grid grid-cols-6">
                        <div>{item.id}</div>
                        <div>{item.category}</div>
                        <div>{item.name}</div>
                        <div>{new Date(item.version * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
                        <div className="flex flex-wrap gap-1">
                            {item.tags?.map((tag: Tag, i: number) => {
                                const isLightColor = /^#(?:[fF]{2}|[eE]{2}|[dD]{2})/.test(tag.color);
                                const textClass = isLightColor ? "text-black" : "text-white";

                                return (
                                    <span key={i} className={`text-xs px-2 py-0.5 rounded ${textClass}`} style={{ backgroundColor: tag.color }}>
                                        {tag.label}
                                    </span>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => navigate(`/items/edit/${item.id}`)} className="bg-[#28282B] border border-gray-700 rounded p-1 text-white hover:opacity-70">
                                <FaPencilAlt size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsModalOpen(true);
                                }}
                                className="bg-[#28282B] border border-gray-700 rounded p-1 text-red-400 hover:opacity-70"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="md:hidden space-y-1">
                        <div><span className="text-gray-400">ID:</span> {item.id}</div>
                        <div><span className="text-gray-400">カテゴリー:</span> {item.category}</div>
                        <div><span className="text-gray-400">アイテム名:</span> {item.name}</div>
                        <div><span className="text-gray-400">更新日:</span> {new Date(item.version * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
                        <div className="flex flex-wrap gap-1">
                            {item.tags?.map((tag: Tag, i: number) => {
                                const isLightColor = /^#(?:[fF]{2}|[eE]{2}|[dD]{2})/.test(tag.color);
                                const textClass = isLightColor ? "text-black" : "text-white";

                                return (
                                    <span key={i} className={`text-xs text-white px-2 py-0.5 rounded ${textClass}`} style={{ backgroundColor: tag.color }}>
                                        {tag.label}
                                    </span>
                                )
                            })}
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={() => { console.log('') }}
                                className="bg-[#28282B] border border-gray-700 rounded p-2 text-white hover:opacity-70">
                                <FaPencilAlt size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsModalOpen(true);
                                }}
                                className="bg-[#28282B] border border-gray-700 rounded p-2 text-red-400 hover:opacity-70"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <ConfirmDeleteModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    if (selectedItem) handleDelete(selectedItem.id);
                    setIsModalOpen(false);
                }}
                itemName={selectedItem?.name}
                itemId={selectedItem?.id}
            />

            {items.length === 0 && (
                <div className="px-4 py-2 text-gray-500 italic">該当なし</div>
            )}
        </div>
    );
}
