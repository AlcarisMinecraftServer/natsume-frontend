import { useEffect, useState } from "react";
import { TbChevronDown, TbChevronUp, TbTrash, TbPlus } from "react-icons/tb";
import { Condition, DefaultRule, Rules, RulesEditorProps } from "@/features/items/types";

export default function RulesEditor({ rawJson }: RulesEditorProps) {
  const [defaultRule, setDefaultRule] = useState<DefaultRule>({
    speed: 1.0,
    damage: 1,
  });
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [expandedConditions, setExpandedConditions] = useState<boolean[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(JSON.stringify(rawJson)) as Rules;

      if (parsed.default) setDefaultRule(parsed.default);
      if (parsed.conditions) {
        setConditions(
          parsed.conditions.map((c: any) => ({
            blocks: Array.isArray(c.blocks) ? c.blocks : [c.blocks],
            speed: Number(c.speed) ?? 0,
            correct_for_drops: !!c.correct_for_drops,
          }))
        );
        setExpandedConditions(parsed.conditions.map(() => true));
      }
    } catch (e) {
      console.error("ルールの読み込みに失敗", e);
    }
  }, [rawJson]);

  const updateDefault = (field: keyof DefaultRule, value: number) => {
    setDefaultRule((prev) => ({ ...prev, [field]: value }));
  };

  const updateCondition = (
    index: number,
    field: keyof Omit<Condition, "blocks">,
    value: number | boolean
  ) => {
    setConditions((conds) => {
      const updated = [...conds];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateConditionBlock = (condIdx: number, blockIdx: number, value: string) => {
    setConditions((conds) =>
      conds.map((c, i) =>
        i === condIdx
          ? { ...c, blocks: c.blocks.map((b, j) => (j === blockIdx ? value : b)) }
          : c
      )
    );
  };

  const addConditionBlock = (index: number) => {
    setConditions((conds) =>
      conds.map((c, i) => (i === index ? { ...c, blocks: [...c.blocks, ""] } : c))
    );
  };

  const removeConditionBlock = (condIdx: number, blockIdx: number) => {
    setConditions((conds) =>
      conds.map((c, i) =>
        i === condIdx ? { ...c, blocks: c.blocks.filter((_, j) => j !== blockIdx) } : c
      )
    );
  };

  const addCondition = () => {
    setConditions((conds) => [
      ...conds,
      { blocks: [""], speed: 0, correct_for_drops: false },
    ]);
    setExpandedConditions((e) => [...e, true]);
  };

  const removeCondition = (index: number) => {
    setConditions((c) => c.filter((_, i) => i !== index));
    setExpandedConditions((e) => e.filter((_, i) => i !== index));
  };

  const toggleCondition = (index: number) => {
    setExpandedConditions((e) =>
      e.map((val, i) => (i === index ? !val : val))
    );
  };

  return (
    <div className="p-4 bg-[#2a2d33] rounded border border-gray-600 text-white space-y-6">
      {/* Default rule */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">デフォルト設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">破壊速度</label>
            <input
              type="number"
              value={defaultRule.speed}
              onChange={(e) => updateDefault("speed", parseFloat(e.target.value))}
              className="w-full bg-[#1c1e22] text-white px-3 py-2 rounded border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">ダメージ</label>
            <input
              type="number"
              value={defaultRule.damage}
              onChange={(e) => updateDefault("damage", parseInt(e.target.value))}
              className="w-full bg-[#1c1e22] text-white px-3 py-2 rounded border border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">条件</h3>
        {conditions.map((cond, idx) => (
          <div key={idx} className="bg-[#1c1e22] border border-gray-600 rounded p-4 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">条件 {idx + 1}</h4>
              <button onClick={() => toggleCondition(idx)} className="text-white">
                {expandedConditions[idx] ? <TbChevronUp /> : <TbChevronDown />}
              </button>
            </div>

            {expandedConditions[idx] && (
              <div className="space-y-4 mt-3">
                <div>
                  <label className="block text-sm mb-1">ブロックリスト</label>
                  {cond.blocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={block}
                        onChange={(e) =>
                          updateConditionBlock(idx, blockIdx, e.target.value)
                        }
                        className="flex-1 bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
                      />
                      <button
                        onClick={() => removeConditionBlock(idx, blockIdx)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <TbTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addConditionBlock(idx)}
                    className="mt-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <TbPlus className="inline mr-1" /> ブロックを追加
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">破壊速度</label>
                    <input
                      type="number"
                      value={cond.speed}
                      onChange={(e) =>
                        updateCondition(idx, "speed", parseFloat(e.target.value))
                      }
                      className="w-full bg-[#2a2d33] text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={cond.correct_for_drops}
                      onChange={(e) =>
                        updateCondition(idx, "correct_for_drops", e.target.checked)
                      }
                    />
                    <label>破壊時にドロップする</label>
                  </div>
                </div>

                <button
                  onClick={() => removeCondition(idx)}
                  className="text-red-500 hover:text-red-400 text-sm flex items-center"
                >
                  <TbTrash className="mr-1" /> 条件を削除
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addCondition}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <TbPlus className="mr-1" /> 条件を追加
        </button>
      </div>
    </div>
  );
}
