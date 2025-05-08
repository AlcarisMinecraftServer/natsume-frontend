export const defaultSchemas = {
    food: {
        nutrition: 4,
        saturation: 0.6,
        can_always_eat: false,
        eat_seconds: 1.8,
        effects: [],
        attributes: [],
        buffs: []
    },
    tool: {
        tool_type: "pickaxe",
        max_damage: 250,
        rules: {},
        upgrades: []
    },
    armor: {
        slot: "chest",
        defense: 3,
        toughness: 2.0,
        knockback_resistance: 0.0,
        durability: 300,
        enchantable: true
    },
    material: {},
    weapon: {}
} as const;

export type SupportedCategory = keyof typeof defaultSchemas;
export type DataSchema = typeof defaultSchemas[SupportedCategory];
