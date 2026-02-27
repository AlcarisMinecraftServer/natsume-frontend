import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { apiFetch } from "@/services/apiFetch";
import { downloadJson } from "@/features/common/utils/downloadJson";

interface RecipeInput {
    item_id: string;
    quantity: number;
    [key: string]: unknown;
}

interface RecipeOutput {
    item_id: string;
    quantity: number;
    [key: string]: unknown;
}

interface Recipe {
    id: string;
    category: string;
    inputs: RecipeInput[];
    output: RecipeOutput;
    [key: string]: unknown;
}

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/recipes")
            .then((res) => {
                if (!res.ok) throw new Error("API error");
                return res.json();
            })
            .then((json) => {
                setRecipes(json.data);
            })
            .catch((err) => {
                console.error("データ取得失敗", err);
                toast.error("レシピデータの取得に失敗しました");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        const toastId = "export-recipes-toast";
        toast.loading("エクスポート中...", { toastId, closeButton: false, draggable: false, closeOnClick: false });
        try {
            const res = await apiFetch("/recipes");
            if (!res.ok) throw new Error("API error");
            const json = await res.json();
            const date = new Date().toISOString().slice(0, 10);
            downloadJson(json.data, `recipes-${date}.json`);
            toast.update(toastId, { render: "エクスポート完了", type: "success", isLoading: false, autoClose: 3000, closeButton: false, draggable: false });
        } catch {
            toast.update(toastId, { render: "エクスポートに失敗しました", type: "error", isLoading: false, autoClose: 3000, closeButton: false, draggable: false });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full bg-[#f8fafc]">
                <div className="animate-spin h-10 w-10 border-4 border-[#e9eef1] border-t-[#4a5b77] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[#eef5ff] text-[#080d12] p-4 font-sans">
            <div className="bg-white rounded-[1.25rem] p-1 mb-4 flex justify-end">
                <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border bg-white border-[#e9eef1] text-[#4b5256] hover:bg-[#f8fafc] transition-all duration-200 font-medium"
                >
                    <FaDownload className="text-[#99a2a7]" />
                    <span>エクスポート</span>
                </button>
            </div>

            <div className="pb-1.5">
                <div className="bg-white rounded-2xl border border-[#e9eef1] overflow-hidden">
                    <div className="grid grid-cols-[minmax(180px,1fr)_140px_1fr] gap-2 px-3 py-2 text-xs font-bold text-[#6f767a] bg-[#fbfdff] border-b border-[#e9eef1]">
                        <div>ID</div>
                        <div>カテゴリ</div>
                        <div>インプット → アウトプット</div>
                    </div>

                    {recipes.length === 0 ? (
                        <div className="text-center py-16 bg-white">
                            <p className="text-[#99a2a7]">レシピはありません</p>
                        </div>
                    ) : (
                        recipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="grid grid-cols-[minmax(180px,1fr)_140px_1fr] gap-2 px-3 py-3 items-center border-b border-[#e9eef1] last:border-b-0 hover:bg-[#f6f9fb] transition-colors"
                            >
                                <div className="font-mono text-sm text-[#080d12] truncate">{recipe.id}</div>

                                <div>
                                    <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold bg-[#f1f6f9] text-[#6f767a]">
                                        {recipe.category}
                                    </span>
                                </div>

                                <div className="text-sm text-[#4b5256] truncate">
                                    {recipe.inputs?.map((i) => `${i.item_id} ×${i.quantity}`).join(", ")}
                                    {" → "}
                                    <span className="font-medium text-[#080d12]">
                                        {recipe.output?.item_id} ×{recipe.output?.quantity}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
