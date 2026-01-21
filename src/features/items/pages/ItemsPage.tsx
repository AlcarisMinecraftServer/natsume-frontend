import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaPlus,
    FaSearch,
    FaFilter,
    FaTimes,
    FaPencilAlt,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaSort,
    FaSortUp,
    FaSortDown,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface Tag {
    label: string;
    color: string;
}

interface Item {
    id: string;
    name: string;
    category: string;
    version: number;
    tags?: Tag[];
    [key: string]: any;
}

type SortKey = "id" | "category" | "name" | "version";

const ITEMS_PER_PAGE = 12;

const errorToastId = "connection-error-toast";
const loadingToastId = "connection-loading-toast";
const recoveryToastId = "connection-recovered-toast";

const MODAL_CLOSE_MS = 500;

const CATEGORY_LABELS: Record<string, string> = {
    weapon: "武器",
    tool: "ツール",
    material: "素材",
    food: "食料",
    armor: "防具",
};

const categoryLabel = (key: string) => CATEGORY_LABELS[key] ?? key;

export default function ItemsPage() {
    const navigate = useNavigate();
    const isFirstLoad = useRef(true);

    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState("");

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterClosing, setFilterClosing] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [currentPage, setCurrentPage] = useState(1);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteClosing, setDeleteClosing] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

    const [listAnimKey, setListAnimKey] = useState(0);

    const openFilterModal = () => {
        setFilterClosing(false);
        setShowFilterModal(true);
    };

    const closeFilterModal = () => {
        setFilterClosing(true);
        window.setTimeout(() => {
            setShowFilterModal(false);
            setFilterClosing(false);
        }, MODAL_CLOSE_MS);
    };

    const openDeleteModal = (item: Item) => {
        setItemToDelete(item);
        setDeleteClosing(false);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteClosing(true);
        window.setTimeout(() => {
            setDeleteModalOpen(false);
            setDeleteClosing(false);
            setItemToDelete(null);
        }, MODAL_CLOSE_MS);
    };

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
                    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
                },
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
                        load();
                    }, 10000);
                })
                .finally(() => setLoading(false));
        };

        load();
    }, []);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder(key === "version" ? "desc" : "asc");
        }
    };

    const sortIcon = (key: SortKey) => {
        if (sortKey !== key) return <FaSort className="opacity-30" />;
        return sortOrder === "asc" ? (
            <FaSortUp className="opacity-30" />
        ) : (
            <FaSortDown className="opacity-30" />
        );
    };

    const handleDeleteConfirm = () => {
        if (!itemToDelete) return;

        fetch(`${import.meta.env.VITE_API_URL}/items/${itemToDelete.id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
        }).then(() => {
            setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
            toast.success("アイテムを削除しました");
            closeDeleteModal();
        });
    };

    const handleAddTag = () => {
        const v = tagInput.trim();
        if (v && !selectedTags.includes(v)) {
            setSelectedTags([...selectedTags, v]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    };

    useEffect(() => {
        setCurrentPage(1);
        setListAnimKey((k) => k + 1);
    }, [keyword, selectedCategory, selectedTags, sortKey, sortOrder]);

    const filteredItems = useMemo(() => {
        const kw = keyword.toLowerCase();
        return items.filter((item) => {
            const hitKw =
                item.id.toLowerCase().includes(kw) ||
                item.name.toLowerCase().includes(kw) ||
                item.category.toLowerCase().includes(kw);

            const hitCategory = selectedCategory === "" || item.category === selectedCategory;

            const hitTags =
                selectedTags.length === 0 ||
                selectedTags.every((tag) => item.tags?.some((t: any) => t.label === tag));

            return hitKw && hitCategory && hitTags;
        });
    }, [items, keyword, selectedCategory, selectedTags]);

    const sortedItems = useMemo(() => {
        const copy = [...filteredItems];
        copy.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === bValue) return 0;

            const comp = aValue > bValue ? 1 : -1;
            return sortOrder === "asc" ? comp : -comp;
        });
        return copy;
    }, [filteredItems, sortKey, sortOrder]);

    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    const paginatedItems = sortedItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const allCategories = ["weapon", "tool", "material", "food"];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full bg-[#f8fafc]">
                <div className="animate-spin h-10 w-10 border-4 border-[#e9eef1] border-t-[#4a5b77] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[#eef5ff] text-[#080d12] p-4 font-sans">
            <div className="bg-white rounded-[1.25rem] p-1 mb-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7f8b91]">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        placeholder="キーワード検索 (ID, 名前, カテゴリ)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full bg-[#f3f8fb] text-[#080d12] pl-10 p-3 rounded-2xl placeholder-[#7f8b91] focus:outline-none focus:ring-2 focus:ring-[#e9eef1] focus:border-[#4a5b77] transition-all"
                    />
                </div>

                <button
                    onClick={openFilterModal}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border transition-all duration-200 font-medium ${selectedCategory || selectedTags.length > 0
                        ? "bg-[#f1f6f9] border-[#e9eef1] text-[#4a5b77]"
                        : "bg-white border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc]"
                        }`}
                >
                    <FaFilter
                        className={
                            selectedCategory || selectedTags.length > 0
                                ? "text-[#4a5b77]"
                                : "text-[#99a2a7]"
                        }
                    />
                    <span>絞り込み</span>
                    {(selectedCategory || selectedTags.length > 0) && (
                        <span className="bg-[#4a5b77] text-white text-xs px-2 py-0.5 rounded-full ml-1">
                            {(selectedCategory ? 1 : 0) + selectedTags.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="pb-1.5">
                <div className="bg-white rounded-2xl border border-[#e9eef1] overflow-hidden">
                    <div className="grid grid-cols-[64px_minmax(200px,1fr)_104px] md:grid-cols-[72px_minmax(260px,1fr)_200px_160px_220px_120px] gap-2 px-3 py-2 text-xs font-bold text-[#6f767a] bg-[#fbfdff] border-b border-[#e9eef1]">
                        <div></div>

                        <button
                            type="button"
                            onClick={() => toggleSort("name")}
                            className="text-left inline-flex items-center gap-2 hover:text-[#4a5b77]"
                        >
                            名前
                            {sortIcon("name")}
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleSort("version")}
                            className="text-left hidden md:inline-flex items-center gap-2 hover:text-[#4a5b77]"
                        >
                            更新日時
                            {sortIcon("version")}
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleSort("category")}
                            className="text-left hidden md:inline-flex items-center gap-2 hover:text-[#4a5b77]"
                        >
                            カテゴリー
                            {sortIcon("category")}
                        </button>

                        <div className="hidden md:block">ユーザー</div>

                        <div className="text-right"></div>
                    </div>

                    <div
                        key={listAnimKey}
                        className="starting:opacity-0 starting:translate-y-1 transition-[opacity,transform] duration-300"
                    >
                        {paginatedItems.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[64px_minmax(200px,1fr)_104px] md:grid-cols-[72px_minmax(260px,1fr)_200px_160px_220px_120px] gap-2 px-3 py-2 items-center border-b border-[#e9eef1] last:border-b-0 hover:bg-[#f6f9fb] transition-colors"
                            >
                                <div className="flex justify-center">
                                    <div className="h-12 w-12 rounded-xl bg-[#f1f6f9] flex items-center justify-center text-[#4a5b77] font-bold text-base shrink-0">
                                        {item.name.charAt(0)}
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm font-bold text-[#080d12] truncate">
                                            {item.name}
                                        </span>
                                        <span className="text-xs text-[#99a2a7] font-mono truncate">
                                            {item.id}
                                        </span>
                                    </div>

                                    {/* {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {item.tags.map((tag: Tag, i: number) => {
                                                const isLightColor =
                                                    /^#(?:[fF]{2}|[eE]{2}|[dD]{2})/.test(tag.color);
                                                return (
                                                    <span
                                                        key={i}
                                                        className="text-xs px-2.5 py-1 rounded-full font-medium shadow-sm border border-black/5"
                                                        style={{
                                                            backgroundColor: tag.color,
                                                            color: isLightColor ? "#080d12" : "#ffffff",
                                                        }}
                                                    >
                                                        {tag.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )} */}
                                </div>

                                <div className="hidden md:block">
                                    <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-3xs font-bold border-[#e9eef1] bg-[#f1f6f9] text-[#6f767a]">
                                        {new Date(item.version * 1000).toLocaleString("ja-JP", {
                                            timeZone: "Asia/Tokyo",
                                        })}
                                    </span>
                                </div>

                                <div className="hidden md:block">
                                    <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-3xs font-bold border-[#e9eef1] bg-[#f1f6f9] text-[#6f767a]">
                                        {categoryLabel(item.category)}
                                    </span>
                                </div>

                                <div className="pt-0.5">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="https://gravatar.com/avatar/4920e4b91c5f5027973515d5d38f5b23?size=120"
                                            alt="なまけもの"
                                            className="h-9 w-9 rounded-full border border-black/5 shadow-sm"
                                            loading="lazy"
                                        />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-[#080d12] truncate">
                                                なまけもの
                                            </div>
                                            <div className="text-xs text-[#99a2a7] truncate">
                                                Placeholder User
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => navigate(`/items/edit/${item.id}`)}
                                        className="h-10 w-10 rounded-xl bg-[#f1f6f9] hover:bg-[#e2e8f0] text-[#4a5b77] flex items-center justify-center transition-colors"
                                        title="編集"
                                    >
                                        <FaPencilAlt size={14} />
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        className="h-10 w-10 rounded-xl bg-[#f1f6f9] hover:bg-[#e2e8f0] text-[#dc2626] flex items-center justify-center transition-colors"
                                        title="削除"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {sortedItems.length === 0 && !loading && (
                            <div className="text-center py-16 bg-white">
                                <p className="text-[#99a2a7]">該当するアイテムはありません</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 text-[#4b5256] text-sm">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronLeft size={12} /> 前へ
                    </button>
                    <span className="font-medium bg-white px-4 py-2 rounded-lg">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        次へ <FaChevronRight size={12} />
                    </button>
                </div>
            )}

            <Link
                to="/items/create"
                className="flex fixed bottom-8 right-8 gap-2 ease-out transition-colors duration-300 items-center justify-center rounded-full bg-[#080d12] text-white py-2.5 px-4 leading-[1.3] font-bold"
            >
                <FaPlus />
                <span className="hidden sm:inline font-bold">新規作成</span>
            </Link>

            {showFilterModal && (
                <>
                    <div
                        onClick={closeFilterModal}
                        className={`fixed inset-0 bg-[color-mix(in_oklab,#6f767a_30%,transparent)] bg-opacity-30 transition-opacity duration-500 z-50
                            ${filterClosing ? "opacity-0" : "opacity-100"}
                            starting:opacity-0
                        `}
                    />
                    <div className="pointer-events-none fixed inset-0 flex h-100svh w-full z-50">
                        <div
                            className={`pointer-events-auto m-auto origin-bottom scrollable-y shadow-[0_25px_50px_-12px_#00000040] duration-500 ease-spring-subtle bg-[#f1f6f9] w-19/20 rounded-4xl max-w-xl max-h-[calc(100svh-2rem)]
                                transition-[opacity,transform]
                                ${filterClosing
                                    ? "opacity-0 translate-y-10 scale-80"
                                    : "opacity-100 translate-y-0 scale-100"
                                }
                                starting:translate-y-10 starting:opacity-0 starting:scale-80
                            `}
                        >
                            <div className="p-3.5 @container flex flex-col gap-5 scrollable-y flex-1 h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-[#080d12]">検索オプション</h2>
                                    <button
                                        onClick={closeFilterModal}
                                        className="text-[#99a2a7] hover:text-[#4b5256]"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <section>
                                    <h2 className="text-sm font-bold text-[#7f8b91] px-3">フィルター</h2>
                                    <div className="mt-1.5 py-3.5 bg-white shadow-xs rounded-2xl px-4.5">
                                        <div className="pt-1.5 py-1">
                                            <div className="flex gap-3.5 items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-bold leading-[1.3] -mt-0.5 flex items-center">
                                                        カテゴリー
                                                    </h3>
                                                    <div className="text-[.81rem] mt-1.5 text-[#6f767a] block">
                                                        アイテムのカテゴリーを選択してください
                                                    </div>
                                                </div>
                                                <div>
                                                    <select
                                                        value={selectedCategory}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                        className="border flex items-center transition-colors border-[#e2eaee] bg-white px-3 h-10 rounded-lg text-xs hover:bg-[#fbfdff] hover:border-[#cad3d8] shadow-xs"
                                                    >
                                                        <option value="">すべてのカテゴリ</option>
                                                        {allCategories.map((cat) => (
                                                            <option key={cat} value={cat}>
                                                                {categoryLabel(cat)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-[#f1f6f9] my-2.5"></div>

                                        <div className="pt-1.5 py-1">
                                            <div className="flex gap-3.5 items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-bold leading-[1.3] -mt-0.5 flex items-center text-[#080d12]">
                                                        タグフィルター
                                                    </h3>
                                                    <div className="text-[.81rem] mt-1.5 text-[#6f767a] block">
                                                        アイテムのタグを使用してフィルターをかけます。
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 mb-2">
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        placeholder="タグ名を入力..."
                                                        className="flex-1 bg-[#f8fafc] border border-[#e9eef1] text-[#080d12] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e9eef1] focus:border-[#4a5b77] transition-all placeholder-[#99a2a7]"
                                                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                                    />
                                                    <button
                                                        onClick={handleAddTag}
                                                        disabled={!tagInput.trim()}
                                                        className="bg-[#4a5b77] text-white px-4 py-2 rounded-xl hover:bg-[#3d4c63] text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        追加
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap gap-2 min-h-8 p-2 rounded-xl bg-[#e2eaee]">
                                                    {selectedTags.length > 0 ? (
                                                        selectedTags.map((tag) => (
                                                            <div key={tag} className="flex flex-wrap 2">
                                                                <span className="inline-flex items-center justify-center rounded-sm gap-2 px-2 py-0.5 text-3xs font-bold border-[#e9eef1] bg-[#f1f6f9] text-[#6f767a]">
                                                                    {tag}
                                                                    <button
                                                                        onClick={() => handleRemoveTag(tag)}
                                                                        className="hover:text-[#dc2626]"
                                                                    >
                                                                        <FaTimes size={10} />
                                                                    </button>
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="w-full text-center py-1">
                                                            <span className="text-xs text-[#99a2a7] italic">
                                                                タグは選択されていません
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("");
                                            setSelectedTags([]);
                                        }}
                                        className="px-5 py-2.5 text-[#7f8b91] hover:text-[#4b5256] text-sm font-medium transition-colors"
                                    >
                                        条件をリセット
                                    </button>
                                    <button
                                        onClick={closeFilterModal}
                                        className="px-6 py-2.5 bg-[#080d12] text-white rounded-xl hover:bg-[#2a2d33] font-medium transition-colors"
                                    >
                                        完了
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {deleteModalOpen && (
                <>
                    <div
                        onClick={closeDeleteModal}
                        className={`fixed inset-0 bg-[color-mix(in_oklab,#6f767a_30%,transparent)] bg-opacity-30 transition-opacity duration-500 z-60
                            ${deleteClosing ? "opacity-0" : "opacity-100"}
                            starting:opacity-0
                        `}
                    />
                    <div className="pointer-events-none fixed inset-0 flex h-100svh w-full z-60">
                        <div
                            className={`pointer-events-auto m-auto origin-bottom shadow-[0_25px_50px_-12px_#00000040] duration-500 ease-spring-subtle bg-[#f1f6f9] w-19/20 rounded-4xl max-w-md max-h-[calc(100svh-2rem)]
                                transition-[opacity,transform]
                                ${deleteClosing
                                    ? "opacity-0 translate-y-10 scale-80"
                                    : "opacity-100 translate-y-0 scale-100"
                                }
                                starting:translate-y-10 starting:opacity-0 starting:scale-80
                            `}
                        >
                            <div className="p-3.5 @container flex flex-col gap-5">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-[#080d12]">アイテム削除</h2>
                                    <button
                                        onClick={closeDeleteModal}
                                        className="text-[#99a2a7] hover:text-[#4b5256]"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <div className="bg-white shadow-xs rounded-2xl px-4.5 py-4">
                                    <div className="text-sm font-bold text-[#080d12]">
                                        本当に削除しますか？
                                    </div>
                                    <div className="text-[.81rem] mt-1.5 text-[#6f767a]">
                                        「
                                        <span className="font-bold text-[#080d12]">
                                            {itemToDelete?.name}
                                        </span>
                                        」を削除すると元に戻せません。
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={closeDeleteModal}
                                        className="px-5 py-2.5 text-[#7f8b91] hover:text-[#4b5256] text-sm font-medium transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="px-6 py-2.5 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] font-medium transition-colors"
                                    >
                                        削除する
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
