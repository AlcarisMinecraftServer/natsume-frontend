import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FormData, Tag } from "../types";
import { defaultSchemas } from "../schemas";

import LoadingSpinner from "@/features/common/LoadingSpinner";

const ItemForm = lazy(() => import("../components/ItemForm"));

export default function ItemEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [itemId, setItemId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [newTag, setNewTag] = useState<Tag>({ label: "", color: "" });
    const [tagError, setTagError] = useState<{ label?: boolean; color?: boolean }>({});
    const [loading, setLoading] = useState(true);

    const triggerGlobalShake = () => {
        document.body.classList.add("shake");
        setTimeout(() => {
            document.body.classList.remove("shake");
        }, 400);
    };

    useEffect(() => {
        if (!id) {
            navigate("/items");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/items/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
        })
            .then(res => res.json())
            .then(json => {
                const item = json.data;
                const schema = defaultSchemas[item.category as keyof typeof defaultSchemas] || {};
                const data = {
                    ...schema,
                    ...(item.data?.data ?? item.data ?? {})
                };

                setItemId(item.id);

                setFormData({
                    id: item.id || "",
                    name: item.name || "",
                    category: item.category || "food",
                    lore: Array.isArray(item.lore) ? item.lore : [""],
                    rarity: item.rarity ?? 1,
                    max_stack: item.max_stack ?? 64,
                    custom_model_data: item.custom_model_data ?? 0,
                    price: item.price ?? { buy: 0, sell: 0, can_sell: false },
                    tags: item.tags ?? [],
                    data,
                });
            })
            .catch(error => {
                console.error("Fetch Error", error);
                navigate("/items");
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleSubmit = async () => {
        if (!formData) return;

        const errors: Partial<Record<keyof FormData, boolean>> = {
            id: formData.id.trim() === "",
            name: formData.name.trim() === "",
            lore: formData.lore.every(line => line.trim() === ""),
            rarity: formData.rarity < 1,
            max_stack: formData.max_stack < 1,
        };
        setFormErrors(errors);

        if (Object.values(errors).some(Boolean)) {
            triggerGlobalShake();
            return;
        }

        const payload = {
            ...formData,
            version: Math.floor(Date.now() / 1000),
        };

        await fetch(`${import.meta.env.VITE_API_URL}/items/${itemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        navigate("/items");
    };

    if (loading || !formData) {
        return <LoadingSpinner />;
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ItemForm
                title="編集"
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