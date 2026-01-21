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

export type CustomModelData =
    | { type: 'floats'; value: number[] }
    | { type: 'flags'; value: boolean[] }
    | { type: 'strings'; value: string[] }
    | { type: 'colors'; value: number[] };

export type FormData = {
    id: string;
    name: string;
    category: SupportedCategory;
    lore: string[];
    rarity: number;
    max_stack: number;
    custom_model_data: CustomModelData | null;
    item_model: string | null;
    tooltip_style: string | null;
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

export interface ToolData {
    tool_type: string;
    max_damage: number;
    rules: Rules;
    upgrades: any[];
};

export interface Rules {
    default: DefaultRule;
    conditions: Condition[];
}

export interface DefaultRule {
    speed: number;
    damage: number;
};

export interface Condition {
    blocks: string[];
    speed?: number;
    correct_for_drops?: boolean;
}