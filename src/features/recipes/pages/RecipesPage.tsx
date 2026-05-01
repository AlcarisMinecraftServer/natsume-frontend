import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    FaPlus,
    FaSearch,
    FaFilter,
    FaTimes,
    FaPencilAlt,
    FaTrash,
    FaHistory,
    FaChevronLeft,
    FaChevronRight,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaDownload,
    FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { apiFetch } from "@/services/apiFetch";
import { downloadJson } from "@/features/common/utils/downloadJson";
import AuditLogModal from "@/features/audit-logs/components/AuditLogModal";
import type { Recipe } from "../types";

type SortKey = "id" | "category";

const RECIPES_PER_PAGE = 12;
const MODAL_CLOSE_MS = 500;

const errorToastId = "recipes-connection-error";
const loadingToastId = "recipes-connection-loading";
const recoveryToastId = "recipes-connection-recovered";

const parsePageParam = (value: string | null) => {
    const n = Number.parseInt(value ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
};

export default function RecipesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isFirstLoad = useRef(true);
    const didMount = useRef(false);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState("");

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterClosing, setFilterClosing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const pageParam = searchParams.get("page");
    const [currentPage, setCurrentPage] = useState(() => parsePageParam(pageParam));

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteClosing, setDeleteClosing] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [auditClosing, setAuditClosing] = useState(false);
    const [auditTarget, setAuditTarget] = useState<Recipe | null>(null);

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

    const openDeleteModal = (recipe: Recipe) => {
        setRecipeToDelete(recipe);
        setDeleteClosing(false);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteClosing(true);
        window.setTimeout(() => {
            setDeleteModalOpen(false);
            setDeleteClosing(false);
            setRecipeToDelete(null);
        }, MODAL_CLOSE_MS);
    };

    const openAuditModal = (recipe: Recipe) => {
        setAuditTarget(recipe);
        setAuditClosing(false);
        setAuditModalOpen(true);
    };

    const closeAuditModal = () => {
        setAuditClosing(true);
        window.setTimeout(() => {
            setAuditModalOpen(false);
            setAuditClosing(false);
            setAuditTarget(null);
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

            apiFetch("/recipes")
                .then((res) => {
                    if (!res.ok) throw new Error("API error");
                    return res.json();
                })
                .then((json) => {
                    setRecipes(json.data);
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
                    isFirstLoad.current = false;
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

    const allCategories = useMemo(
        () => [...new Set(recipes.map((r) => r.category))].sort(),
        [recipes]
    );

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
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

    const handleDeleteConfirm = async () => {
        if (!recipeToDelete) return;
        try {
            const res = await apiFetch(`/recipes/${encodeURIComponent(recipeToDelete.id)}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");
            setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
            toast.success("レシピを削除しました");
            closeDeleteModal();
        } catch {
            toast.error("削除に失敗しました");
        }
    };

    const handleExport = async () => {
        const toastId = "export-recipes-toast";
        toast.loading("エクスポート中...", {
            toastId,
            closeButton: false,
            draggable: false,
            closeOnClick: false,
        });
        try {
            const res = await apiFetch("/recipes");
            if (!res.ok) throw new Error("API error");
            const json = await res.json();
            const data = (json.data as Recipe[]).map(({ last_actor: _, ...rest }) => rest);
            const date = new Date().toISOString().slice(0, 10);
            downloadJson(data, `recipes-${date}.json`);
            toast.update(toastId, {
                render: "エクスポート完了",
                type: "success",
                isLoading: false,
                autoClose: 3000,
                closeButton: false,
                draggable: false,
            });
        } catch {
            toast.update(toastId, {
                render: "エクスポートに失敗しました",
                type: "error",
                isLoading: false,
                autoClose: 3000,
                closeButton: false,
                draggable: false,
            });
        }
    };

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        setCurrentPage(1);
        setListAnimKey((k) => k + 1);
    }, [keyword, selectedCategory, sortKey, sortOrder]);

    useEffect(() => {
        const pageFromQuery = parsePageParam(pageParam);
        setCurrentPage((prev) => (prev === pageFromQuery ? prev : pageFromQuery));
    }, [pageParam]);

    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        if (currentPage <= 1) next.delete("page");
        else next.set("page", String(currentPage));
        if (next.toString() !== searchParams.toString()) {
            setSearchParams(next, { replace: true });
        }
    }, [currentPage, searchParams, setSearchParams]);

    const filteredRecipes = useMemo(() => {
        const kw = keyword.toLowerCase();
        return recipes.filter((recipe) => {
            const hitKw =
                !kw ||
                recipe.id.toLowerCase().includes(kw) ||
                recipe.category.toLowerCase().includes(kw);
            const hitCategory = !selectedCategory || recipe.category === selectedCategory;
            return hitKw && hitCategory;
        });
    }, [recipes, keyword, selectedCategory]);

    const sortedRecipes = useMemo(() => {
        const copy = [...filteredRecipes];
        copy.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === bVal) return 0;
            const comp = aVal > bVal ? 1 : -1;
            return sortOrder === "asc" ? comp : -comp;
        });
        return copy;
    }, [filteredRecipes, sortKey, sortOrder]);

    const totalPages = Math.ceil(sortedRecipes.length / RECIPES_PER_PAGE);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedRecipes = sortedRecipes.slice(
        (currentPage - 1) * RECIPES_PER_PAGE,
        currentPage * RECIPES_PER_PAGE
    );

    const actorDisplay = (recipe: Recipe) => {
        const actor = recipe.last_actor;
        if (!actor || actor.username === "unknown") return null;
        const displayName = actor.global_name ?? actor.username ?? null;
        if (!displayName) return null;
        return { displayName, username: actor.username, avatarUrl: actor.avatar_url };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full bg-[#f8fafc]">
                <div className="animate-spin h-10 w-10 border-4 border-[#e9eef1] border-t-[#4a5b77] rounded-full" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[#eef5ff] text-[#080d12] p-4 font-sans">
            {/* Toolbar */}
            <div className="bg-white rounded-[1.25rem] p-1 mb-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7f8b91]">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        placeholder="キーワード検索 (ID, カテゴリ)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full bg-[#f3f8fb] text-[#080d12] pl-10 p-3 rounded-2xl placeholder-[#7f8b91] focus:outline-none focus:ring-2 focus:ring-[#e9eef1] transition-all"
                    />
                </div>

                <button
                    onClick={openFilterModal}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border transition-all duration-200 font-medium ${selectedCategory
                        ? "bg-[#f1f6f9] border-[#e9eef1] text-[#4a5b77]"
                        : "bg-white border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc]"
                        }`}
                >
                    <FaFilter className={selectedCategory ? "text-[#4a5b77]" : "text-[#99a2a7]"} />
                    <span>絞り込み</span>
                    {selectedCategory && (
                        <span className="bg-[#4a5b77] text-white text-xs px-2 py-0.5 rounded-full ml-1">
                            1
                        </span>
                    )}
                </button>

                <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border bg-white border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-all duration-200 font-medium"
                >
                    <FaDownload className="text-[#99a2a7]" />
                    <span>エクスポート</span>
                </button>
            </div>

            {/* List */}
            <div className="pb-1.5">
                <div className="bg-white rounded-2xl border border-[#e9eef1] overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_104px] md:grid-cols-[minmax(180px,1.5fr)_150px_minmax(180px,2fr)_72px_200px_130px] gap-2 px-3 py-2 text-xs font-bold text-[#6f767a] bg-[#fbfdff] border-b border-[#e9eef1]">
                        <button
                            type="button"
                            onClick={() => toggleSort("id")}
                            className="text-left inline-flex items-center gap-2 hover:text-[#4a5b77]"
                        >
                            ID
                            {sortIcon("id")}
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleSort("category")}
                            className="text-left hidden md:inline-flex items-center gap-2 hover:text-[#4a5b77]"
                        >
                            カテゴリー
                            {sortIcon("category")}
                        </button>

                        <div className="hidden md:block">素材 → 生成物</div>
                        <div className="hidden md:flex items-center justify-center"><FaEyeSlash size={12} /></div>
                        <div className="hidden md:block">ユーザー</div>
                        <div className="text-right" />
                    </div>

                    {/* Rows */}
                    <div
                        key={listAnimKey}
                        className="starting:opacity-0 starting:translate-y-1 transition-[opacity,transform] duration-300"
                    >
                        {paginatedRecipes.map((recipe) => {
                            const actor = actorDisplay(recipe);
                            const materialsText = recipe.materials
                                .map((m) => `${m.id} ×${m.amount}`)
                                .join(", ");

                            return (
                                <div
                                    key={recipe.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => navigate(`/recipes/edit/${encodeURIComponent(recipe.id)}${location.search}`)}
                                    onKeyDown={(e) => {
                                        if (e.target !== e.currentTarget) return;
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            navigate(`/recipes/edit/${encodeURIComponent(recipe.id)}${location.search}`);
                                        }
                                    }}
                                    className="grid grid-cols-[1fr_104px] md:grid-cols-[minmax(180px,1.5fr)_150px_minmax(180px,2fr)_72px_200px_130px] gap-2 px-3 py-3 items-center border-b border-[#e9eef1] last:border-b-0 hover:bg-[#f6f9fb] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#24afff]/30"
                                >
                                    {/* ID + category badge (mobile) */}
                                    <div className="min-w-0">
                                        <div className="flex flex-col leading-tight gap-0.5">
                                            <span className="text-sm font-mono font-bold text-[#080d12] truncate">
                                                {recipe.id}
                                            </span>
                                            <div className="flex items-center gap-1.5 md:hidden">
                                                <span className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold bg-[#f1f6f9] text-[#6f767a]">
                                                    {recipe.category}
                                                </span>
                                                {recipe.is_hidden && (
                                                    <span className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold bg-[#fef3c7] text-[#92400e]">
                                                        <FaEyeSlash size={9} />
                                                        非表示
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category (desktop) */}
                                    <div className="hidden md:block">
                                        <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold bg-[#f1f6f9] text-[#6f767a]">
                                            {recipe.category}
                                        </span>
                                    </div>

                                    {/* Materials → Product (desktop) */}
                                    <div className="hidden md:block min-w-0">
                                        <span className="text-xs text-[#6f767a] truncate block">
                                            {materialsText}
                                        </span>
                                        <span className="text-xs font-medium text-[#080d12] truncate block">
                                            → {recipe.product.id} ×{recipe.product.amount}
                                        </span>
                                    </div>

                                    {/* Hidden badge (desktop) */}
                                    <div className="hidden md:flex items-center justify-center">
                                        {recipe.is_hidden ? (
                                            <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold bg-[#fef3c7] text-[#92400e]">
                                                <FaEyeSlash size={10} />
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[#d1d9de]">—</span>
                                        )}
                                    </div>

                                    {/* Last actor (desktop) */}
                                    <div className="hidden md:flex items-center gap-3 pt-0.5">
                                        {actor ? (
                                            <>
                                                {actor.avatarUrl ? (
                                                    <img
                                                        src={actor.avatarUrl}
                                                        alt={actor.displayName}
                                                        className="h-9 w-9 rounded-full border border-black/5 shadow-sm shrink-0"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div
                                                        className="h-9 w-9 rounded-full border border-black/5 shadow-sm flex items-center justify-center text-white font-bold shrink-0"
                                                        style={{ backgroundColor: "#4a5b77" }}
                                                    >
                                                        {actor.displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-[#080d12] truncate">
                                                        {actor.displayName}
                                                    </div>
                                                    {actor.username && actor.username !== actor.displayName && (
                                                        <div className="text-xs text-[#99a2a7] truncate">
                                                            {actor.username}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-[#99a2a7]">—</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/recipes/edit/${encodeURIComponent(recipe.id)}${location.search}`);
                                            }}
                                            className="h-10 w-10 rounded-xl bg-[#f1f6f9] hover:bg-[#e2e8f0] text-[#4a5b77] flex items-center justify-center transition-colors"
                                            title="編集"
                                        >
                                            <FaPencilAlt size={14} />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAuditModal(recipe);
                                            }}
                                            className="h-10 w-10 rounded-xl bg-[#f1f6f9] hover:bg-[#e2e8f0] text-[#4a5b77] flex items-center justify-center transition-colors"
                                            title="編集履歴"
                                        >
                                            <FaHistory size={14} />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(recipe);
                                            }}
                                            className="h-10 w-10 rounded-xl bg-[#f1f6f9] hover:bg-[#e2e8f0] text-[#dc2626] flex items-center justify-center transition-colors"
                                            title="削除"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {sortedRecipes.length === 0 && !loading && (
                            <div className="text-center py-16 bg-white">
                                <p className="text-[#99a2a7]">該当するレシピはありません</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 text-[#4b5256] text-sm mt-4">
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

            {/* FAB */}
            <Link
                to={`/recipes/create${location.search}`}
                className="flex fixed bottom-8 right-8 gap-2 ease-out transition-colors duration-300 items-center justify-center rounded-full bg-[#080d12] text-white py-2.5 px-4 leading-[1.3] font-bold"
            >
                <FaPlus />
                <span className="hidden sm:inline font-bold">新規作成</span>
            </Link>

            {/* Filter Modal */}
            {showFilterModal && (
                <>
                    <div
                        onClick={closeFilterModal}
                        className={`fixed inset-0 bg-[color-mix(in_oklab,#6f767a_30%,transparent)] transition-opacity duration-500 z-50
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
                            <div className="p-3.5 flex flex-col gap-5 scrollable-y flex-1 h-full">
                                <div className="flex justify-between items-center mb-2">
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
                                        <div className="flex gap-3.5 items-start">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-bold leading-[1.3] flex items-center">
                                                    カテゴリー
                                                </h3>
                                                <div className="text-[.81rem] mt-1.5 text-[#6f767a]">
                                                    レシピのカテゴリーを選択してください
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
                                                            {cat}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setSelectedCategory("")}
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

            {/* Audit Log Modal */}
            {auditModalOpen && auditTarget && (
                <AuditLogModal
                    resourceType="recipe"
                    resourceId={auditTarget.id}
                    resourceLabel={auditTarget.id}
                    onClose={closeAuditModal}
                    closing={auditClosing}
                />
            )}

            {/* Delete Modal */}
            {deleteModalOpen && (
                <>
                    <div
                        onClick={closeDeleteModal}
                        className={`fixed inset-0 bg-[color-mix(in_oklab,#6f767a_30%,transparent)] transition-opacity duration-500 z-60
                            ${deleteClosing ? "opacity-0" : "opacity-100"}
                            starting:opacity-0
                        `}
                    />
                    <div className="pointer-events-none fixed inset-0 flex h-100svh w-full z-60">
                        <div
                            className={`pointer-events-auto m-auto origin-bottom shadow-[0_25px_50px_-12px_#00000040] duration-500 ease-spring-subtle bg-[#f1f6f9] w-19/20 rounded-4xl max-w-md
                                transition-[opacity,transform]
                                ${deleteClosing
                                    ? "opacity-0 translate-y-10 scale-80"
                                    : "opacity-100 translate-y-0 scale-100"
                                }
                                starting:translate-y-10 starting:opacity-0 starting:scale-80
                            `}
                        >
                            <div className="p-3.5 flex flex-col gap-5">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-[#080d12]">レシピ削除</h2>
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
                                        <span className="font-mono font-bold text-[#080d12]">
                                            {recipeToDelete?.id}
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
