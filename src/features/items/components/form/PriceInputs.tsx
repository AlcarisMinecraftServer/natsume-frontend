import NumberInputWithSpin from "@/components/form/NumberInput";

type Price = {
    buy: number;
    sell: number;
    can_sell: boolean;
};

type Props = {
    price: Price;
    onChange: (value: Price) => void;
};

export default function PriceInputs({ price = { buy: 0, sell: 0, can_sell: false }, onChange }: Props) {
    return (
        <>
            <NumberInputWithSpin
                label="Buy Price"
                value={price.buy}
                onChange={(v) => onChange({ ...price, buy: v })}
            />
            <NumberInputWithSpin
                label="Sell Price"
                value={price.sell}
                onChange={(v) => onChange({ ...price, sell: v })}
            />
            <div>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={price.can_sell}
                        onChange={(e) =>
                            onChange({ ...price, can_sell: e.target.checked })
                        }
                        className="form-checkbox"
                    />
                    <span>販売可能</span>
                </label>
            </div>
        </>
    );
}
