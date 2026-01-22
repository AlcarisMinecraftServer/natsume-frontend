import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { FormData, Tag } from "../types";

import LoadingSpinner from "@/features/common/LoadingSpinner";
import { apiFetch } from "@/services/apiFetch";

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

        const fetchItem = async () => {
            try {
                const res = await apiFetch(`/items/${id}`, { method: "GET" });

                if (!res.ok) {
                    throw new Error("Failed to fetch item");
                }

                const jsonResponse = await res.json();
                const itemData = jsonResponse.data;

                if (!itemData) {
                    throw new Error("Invalid API response structure");
                }

                const formattedData: FormData = {
                    ...itemData,
                };

                setItemId(itemData.id);
                setFormData(formattedData);
            } catch (error) {
                console.error(error);
                toast.error(<div>データの取得に失敗しました</div>);
                navigate("/items");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, navigate]);

    const validateForm = () => {
        if (!formData) return false;

        const errors = {
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
        if (!formData) return;

        if (!validateForm()) {
            triggerGlobalShake();
            toast.error(<div>必須項目が未入力です。<br />入力内容をご確認ください。</div>);
            return;
        }

        const payload = {
            ...formData,
            version: Math.floor(Date.now() / 1000),
            item_model: formData.item_model || null,
            tooltip_style: formData.tooltip_style || null,
        };

        try {
            const res = await apiFetch(`/items/${itemId}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to update item");
            }

            toast.success(<div>アイテムを更新しました</div>);
            navigate("/items");
        } catch (error) {
            console.error(error);
            toast.error(<div>更新に失敗しました</div>);
        }
    };

    if (loading || !formData) {
        return <LoadingSpinner />;
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ItemForm
                title="編集"
                formData={formData}
                setFormData={(newData) => setFormData(newData)}
                formErrors={formErrors}
                newTag={newTag}
                setNewTag={setNewTag}
                tagError={tagError}
                setTagError={setTagError}
                handleSubmit={handleSubmit}
            />
        </Suspense>
    );
}
