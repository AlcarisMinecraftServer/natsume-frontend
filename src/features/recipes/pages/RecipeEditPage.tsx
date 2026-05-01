import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "@/services/apiFetch";
import type { RecipeFormData, RecipeFormErrors } from "../types";
import RecipeForm from "../components/RecipeForm";
import LoadingSpinner from "@/features/common/LoadingSpinner";

export default function RecipeEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState<RecipeFormData | null>(null);
    const [formErrors, setFormErrors] = useState<RecipeFormErrors>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            navigate("/recipes");
            return;
        }

        apiFetch(`/recipes/${encodeURIComponent(id)}`)
            .then((res) => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then((json) => {
                const data = json.data;
                setFormData({
                    id: data.id,
                    category: data.category,
                    materials: data.materials,
                    product: data.product,
                    is_hidden: data.is_hidden,
                    cooldown: data.cooldown,
                    unlock_level: data.unlock_level,
                });
            })
            .catch(() => {
                toast.error("データの取得に失敗しました");
                navigate(`/recipes${location.search}`);
            })
            .finally(() => setLoading(false));
    }, [id, navigate, location.search]);

    const validate = (): boolean => {
        if (!formData) return false;
        const errors: RecipeFormErrors = {
            category: formData.category.trim() === "",
            materials:
                formData.materials.length === 0 ||
                formData.materials.some((m) => m.id.trim() === "" || m.amount < 1),
            product: formData.product.id.trim() === "" || formData.product.amount < 1,
        };
        setFormErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleSubmit = async () => {
        if (!formData) return;
        if (!validate()) {
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 500);
            toast.error("必須項目が未入力です。入力内容をご確認ください。");
            return;
        }

        const { id: _id, ...patch } = formData;

        try {
            const res = await apiFetch(`/recipes/${encodeURIComponent(id!)}`, {
                method: "PATCH",
                body: JSON.stringify(patch),
            });
            if (!res.ok) throw new Error("Failed to update recipe");
            toast.success("レシピを更新しました");
            navigate(`/recipes${location.search}`);
        } catch (err) {
            console.error(err);
            toast.error("更新に失敗しました");
        }
    };

    if (loading || !formData) return <LoadingSpinner />;

    return (
        <RecipeForm
            title="編集"
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            isEditMode
            handleSubmit={handleSubmit}
            onCancel={() => navigate(`/recipes${location.search}`)}
        />
    );
}
