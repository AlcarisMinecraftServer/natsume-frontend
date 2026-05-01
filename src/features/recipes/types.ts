export interface RecipeMaterial {
    id: string;
    amount: number;
}

export interface RecipeProduct {
    id: string;
    amount: number;
}

export interface RecipeActor {
    id?: string | null;
    username?: string | null;
    global_name?: string | null;
    avatar_url?: string | null;
}

export interface Recipe {
    id: string;
    category: string;
    materials: RecipeMaterial[];
    product: RecipeProduct;
    is_hidden: boolean;
    cooldown: number | null;
    unlock_level: number | null;
    last_actor?: RecipeActor | null;
}

export type RecipeFormData = {
    id: string;
    category: string;
    materials: RecipeMaterial[];
    product: RecipeProduct;
    is_hidden: boolean;
    cooldown: number | null;
    unlock_level: number | null;
};

export type RecipeFormErrors = {
    id?: boolean;
    category?: boolean;
    materials?: boolean;
    product?: boolean;
};
