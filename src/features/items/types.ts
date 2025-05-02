import type { SupportedCategory } from "./schemas";

export type Tag = {
    label: string;
    color: string;
};

export type Price = {
    buy: number;
    sell: number;
    can_sell: boolean;
};

export type FormData = {
    id: string;
    name: string;
    category: SupportedCategory | "material" | "weapon";
    lore: string[];
    rarity: number;
    max_stack: number;
    custom_model_data: number;
    price: Price;
    tags: Tag[];
    data: Record<string, any>;
};

export type Effect = {
    effect: string;
    duration: number;
    amplifier: number;
    chance: number;
};

export type Attribute = {
    attribute: string;
    operation: string;
    value: number;
    duration: number;
};

export type Buff = {
    kind: string;
    duration: number;
    amount: number;
};

export interface RulesEditorProps {
    initialRules: string;
    setRulesJson: (json: string) => void;
}