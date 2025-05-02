import { FaSearch, FaFilter } from "react-icons/fa";

export default function ItemSearchBar({ keyword, setKeyword, setShowFilter }: {
    keyword: string;
    setKeyword: (v: string) => void;
    setShowFilter: (v: boolean) => void;
}) {
    return (
        <div className="relative mb-4 flex gap-2">
            <div className="relative flex-1">
                <span className="absolute left-3 top-3.25 text-gray-400">
                    <FaSearch />
                </span>
                <input
                    type="text"
                    placeholder="キーワード検索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-[#2a2d33] text-white pl-9 pr-4 py-2 rounded border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
            </div>

            <button
                onClick={() => setShowFilter(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2d33] text-white rounded border border-gray-600 hover:bg-[#35393f]"
            >
                <FaFilter /> 絞り込み
            </button>
        </div>
    );
}
