import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "@/services/apiFetch";
import type { RecipeFormData, RecipeFormErrors } from "../types";
import RecipeForm from "../components/RecipeForm";

const defaultFormData: RecipeFormData = {
    id: "",
    category: "",
    materials: [{ id: "", amount: 1 }],
    product: { id: "", amount: 1 },
    is_hidden: false,
    cooldown: null,
    unlock_level: null,
};

export default function RecipeCreatePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState<RecipeFormData>(defaultFormData);
    const [formErrors, setFormErrors] = useState<RecipeFormErrors>({});

    const validate = (): boolean => {
        const errors: RecipeFormErrors = {
            id: formData.id.trim() === "",
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
        if (!validate()) {
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 500);
            toast.error("必須項目が未入力です。入力内容をご確認ください。");
            return;
        }

        try {
            const res = await apiFetch("/recipes", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.message ?? "Failed to create recipe");
            }
            navigate(`/recipes${location.search}`);
        } catch (err) {
            console.error(err);
            toast.error("作成に失敗しました");
        }
    };

    return (
        <RecipeForm
            title="新規作成"
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            handleSubmit={handleSubmit}
            onCancel={() => navigate(`/recipes${location.search}`)}
        />
    );
}
