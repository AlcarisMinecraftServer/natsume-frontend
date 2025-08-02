import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { FormData, Tag } from "../types";
import { defaultSchemas } from "../schemas";

import { toast } from "react-toastify";

import LoadingSpinner from "@/features/common/LoadingSpinner";

const ItemForm = lazy(() => import("../components/ItemForm"));

export default function ItemCreatePage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>(() => {
        const category = "food";
        const schema = defaultSchemas[category];
        return {
            id: "",
            name: "",
            category,
            lore: [""],
            rarity: 1,
            max_stack: 64,
            custom_model_data: 0,
            price: { buy: 0, sell: 0, can_sell: false },
            tags: [],
            data: schema,
        };
    });

    const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [newTag, setNewTag] = useState<Tag>({ label: "", color: "" });
    const [tagError, setTagError] = useState<{ label?: boolean; color?: boolean }>({});

    const triggerGlobalShake = () => {
        document.body.classList.add("shake");
        setTimeout(() => {
            document.body.classList.remove("shake");
        }, 400);
    };

    const validateForm = () => {
        const errors: Partial<Record<keyof FormData, boolean>> = {
            id: formData.id.trim() === "",
            name: formData.name.trim() === "",
            lore: formData.lore.every(line => line.trim() === ""),
            rarity: formData.rarity < 1,
            max_stack: formData.max_stack < 1,
        };
        setFormErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            triggerGlobalShake();
            toast.error("必須項目が未入力です。\n入力内容をご確認ください。");
            return;
        }

        const payload = {
            ...formData,
            version: Math.floor(Date.now() / 1000),
        };

        await fetch(`${import.meta.env.VITE_API_URL}/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        navigate("/items");
    };

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ItemForm
                title="新規作成"
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                newTag={newTag}
                setNewTag={setNewTag}
                tagError={tagError}
                setTagError={setTagError}
                triggerGlobalShake={triggerGlobalShake}
                handleSubmit={handleSubmit}
            />
        </Suspense>
    );
}
