import StringListEditor from "../../../common/StringListEditor";

type MaterialData = {
    magic_materials: string[];
};

type Props = {
    data: MaterialData;
    onChange: (newData: MaterialData) => void;
};

export default function MaterialForm({ data, onChange }: Props) {
    const update = <K extends keyof MaterialData>(key: K, value: MaterialData[K]) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <div className="space-y-6">
            <StringListEditor
                title="魔法素材 (Magic Materials)"
                description="魔法関連の素材やエッセンスを指定します"
                items={data.magic_materials ?? []}
                onChange={(v) => update("magic_materials", v)}
                placeholder="red:3"
            />
        </div>
    );
}