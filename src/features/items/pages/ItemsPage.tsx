import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

import ItemSearchBar from "@/features/items/components/ItemSearchBar";
import ItemFilterModal from "@/features/items/components/ItemFilterModal";
import ItemList from "@/features/items/components/ItemList";
import { toast } from "react-toastify";

const errorToastId = "connection-error-toast";
const loadingToastId = "connection-loading-toast";
const recoveryToastId = "connection-recovered-toast";

export default function ItemsPage() {
    const isFirstLoad = useRef(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        const load = () => {
            setLoading(true);

            toast.dismiss(errorToastId);
            if (!isFirstLoad.current && !toast.isActive(loadingToastId)) {
                toast.loading("接続中...", {
                    toastId: loadingToastId,
                    closeButton: false,
                    draggable: false,
                    closeOnClick: false,
                });
            }


            fetch(`${import.meta.env.VITE_API_URL}/items`, {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error("API error");
                    return res.json();
                })
                .then((json) => {
                    setItems(json.data);
                    toast.dismiss(errorToastId);
                    toast.dismiss(loadingToastId);

                    if (!isFirstLoad.current) {
                        toast.success("サーバーへの再接続に成功しました。", {
                            toastId: recoveryToastId,
                            autoClose: 3000,
                            closeButton: false,
                            draggable: false,
                        });
                    }
                })
                .catch((err) => {
                    console.error("データ取得失敗", err);
                    toast.dismiss(loadingToastId);

                    if (!toast.isActive(errorToastId)) {
                        toast.error(
                            <>
                                サーバーに接続できません。
                                <br />
                                10秒後に再接続します...
                            </>,
                            {
                                toastId: errorToastId,
                                autoClose: false,
                                closeOnClick: false,
                                draggable: false,
                                closeButton: false,
                            }
                        );
                    }

                    setTimeout(() => {
                        isFirstLoad.current = false;
                        load()
                    }, 10000);
                })
                .finally(() => setLoading(false));
        };

        load();
    }, []);

    const filteredItems = items.filter(item => {
        const kw = keyword.toLowerCase();
        return (
            (item.id.toLowerCase().includes(kw) ||
                item.name.toLowerCase().includes(kw) ||
                item.category.toLowerCase().includes(kw)) &&
            (selectedCategory === "" || item.category === selectedCategory) &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (selectedTags.length === 0 || selectedTags.every(tag => item.tags?.some((t: any) => t.label === tag)))
        );
    });

    if (loading) {
        return (
            <div className="flex p-6 items-center justify-center h-full text-gray-400">
                <div className="w-12 h-12 border-2 border-cyan-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative p-6 text-white bg-[#1c1e22] h-full w-full">
            <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <h1 className="text-4xl font-bold">アイテム設定</h1>
            </div>

            <ItemSearchBar
                keyword={keyword}
                setKeyword={setKeyword}
                setShowFilter={setShowFilter}
            />

            <ItemFilterModal
                visible={showFilter}
                setVisible={setShowFilter}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                tagInput={tagInput}
                setTagInput={setTagInput}
            />

            <ItemList items={filteredItems} />

            <Link
                to="/items/create"
                className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white"
            >
                <FaPlus />
                <span className="hidden sm:inline">アイテム作成</span>
            </Link>
        </div>
    );
}
