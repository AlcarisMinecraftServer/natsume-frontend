const MCMETA = "https://raw.githubusercontent.com/misode/mcmeta";
const VERSION = "1.21.8";

export interface MinecraftItem {
    id: string;
    nameJa: string;
    nameEn: string;
}

let itemsPromise: Promise<MinecraftItem[]> | null = null;

export function loadMinecraftItems(): Promise<MinecraftItem[]> {
    if (!itemsPromise) {
        itemsPromise = Promise.all([
            fetch(`${MCMETA}/${VERSION}-summary/registries/data.min.json`).then((r) => r.json()),
            fetch(`${MCMETA}/${VERSION}-assets/assets/minecraft/lang/en_us.json`).then((r) => r.json()),
            fetch(`${MCMETA}/${VERSION}-assets/assets/minecraft/lang/ja_jp.json`).then((r) => r.json()),
        ])
            .then(([registries, en, ja]) => {
                const ids: string[] = registries.item ?? [];
                return ids
                    .filter((id) => id !== "air")
                    .map((id) => {
                        const shortId = id.replace("minecraft:", "");
                        const nameEn =
                            en[`item.minecraft.${shortId}`] ??
                            en[`block.minecraft.${shortId}`] ??
                            shortId;
                        const nameJa =
                            ja[`item.minecraft.${shortId}`] ??
                            ja[`block.minecraft.${shortId}`] ??
                            nameEn;
                        return { id: shortId, nameJa, nameEn };
                    });
            })
            .catch((e) => {
                itemsPromise = null;
                throw e;
            });
    }
    return itemsPromise;
}
