export const defaultSchemas = {
    weapon: {
        weapon_type: "sword",
        required_level: 10,
        max_modification: 10,
        durability: 250,
        base: {
            attributes: {
                attack_damage: 25,
                movement_speed: 10,
                attack_range: 3,
                attack_speed: 1.5,
                experience_bonus: 10,
                drop_rate_bonus: 5
            },
            effects: [],
            buffs: []
        },
        "upgrades": []
    },
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
} as const;

export type SupportedCategory = keyof typeof defaultSchemas;
export type DataSchema = typeof defaultSchemas[SupportedCategory];
