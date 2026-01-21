import { useEffect, useState } from "react";
import { TbChevronDown, TbChevronUp, TbTrash, TbPlus } from "react-icons/tb";
import { Condition, DefaultRule, Rules } from "@/features/items/types";

type RulesEditorProps = {
  rawJson: Rules;
};

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
            // eslint-disable-next-line no-constant-binary-expression
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
    <div className="bg-[#ffffff] rounded-xl border border-[#e2eaee] p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#080d12]">デフォルト設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#6f767a]">破壊速度 (Speed)</label>
            <input
              type="number"
              value={defaultRule.speed}
              onChange={(e) => updateDefault("speed", parseFloat(e.target.value))}
              className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#6f767a]">ダメージ (Damage)</label>
            <input
              type="number"
              value={defaultRule.damage}
              onChange={(e) => updateDefault("damage", parseInt(e.target.value))}
              className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#080d12]">条件</h3>
          <button
            onClick={addCondition}
            className="px-3 py-1.5 bg-[#24afff] hover:bg-[#099bff] text-white rounded flex items-center gap-1 transition-colors text-sm font-medium"
          >
            <TbPlus size={16} />
            条件を追加
          </button>
        </div>

        {conditions.map((cond, idx) => (
          <div key={idx} className="bg-[#f6f9fb] border border-[#e2eaee] rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-[#080d12]">条件 {idx + 1}</h4>
              <button 
                onClick={() => toggleCondition(idx)} 
                className="text-[#4b5256] hover:text-[#080d12] transition-colors"
              >
                {expandedConditions[idx] ? <TbChevronUp size={20} /> : <TbChevronDown size={20} />}
              </button>
            </div>

            {expandedConditions[idx] && (
              <div className="space-y-4 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6f767a] mb-2">ブロックリスト (Blocks)</label>
                  {cond.blocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={block}
                        onChange={(e) =>
                          updateConditionBlock(idx, blockIdx, e.target.value)
                        }
                        className="flex-1 bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors placeholder-[#93a0a7]"
                      />
                      <button
                        onClick={() => removeConditionBlock(idx, blockIdx)}
                        className="text-[#ff6161] hover:text-[#ff4d4d] transition-colors p-1.5"
                      >
                        <TbTrash size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addConditionBlock(idx)}
                    className="mt-1 px-3 py-1.5 bg-[#24afff] hover:bg-[#099bff] text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <TbPlus size={14} />
                    ブロックを追加
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#6f767a]">破壊速度 (Speed)</label>
                    <input
                      type="number"
                      value={cond.speed}
                      onChange={(e) =>
                        updateCondition(idx, "speed", parseFloat(e.target.value))
                      }
                      className="w-full bg-[#ffffff] text-[#080d12] px-3 py-1.5 rounded border border-[#cad3d8] focus:border-[#24afff] focus:outline-none transition-colors"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cond.correct_for_drops}
                        onChange={(e) =>
                          updateCondition(idx, "correct_for_drops", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-[#cad3d8] text-[#24afff] focus:ring-[#24afff] focus:ring-offset-0"
                      />
                      <label 
                        className="text-sm font-semibold text-[#080d12] cursor-pointer select-none"
                        onClick={() => updateCondition(idx, "correct_for_drops", !cond.correct_for_drops)}
                      >
                        破壊時にドロップ (Correct for Drops)
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeCondition(idx)}
                  className="text-[#ff6161] hover:text-[#ff4d4d] text-sm flex items-center gap-1 transition-colors"
                >
                  <TbTrash size={16} />
                  条件を削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
