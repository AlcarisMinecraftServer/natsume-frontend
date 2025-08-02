import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";

export default function Sidebar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { label: "アイテム設定", to: "/items" },
        { label: "レシピ設定", to: "/recipes" },
        { label: "ファイル設定", to: "/files" },
        { label: "チケット", to: "/tickets" },
        { label: "プレイヤー個人設定", to: "/player" },
    ];

    const account = {
        name: "なまけもの",
        id: "user_123456",
        avatarUrl: "https://via.placeholder.com/40x40",
    };

    return (
        <>
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 md:hidden z-[98]"
                />
            )}

            <div
                className={`
                    fixed top-0 left-0 h-full w-64 bg-[#1c1e22] text-[#f2f2fb] border-r border-gray-700 transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    md:translate-x-0 md:static md:block z-[99]
                `}
            >
                <div className="flex justify-between items-center px-4 py-3 md:hidden border-b border-gray-700">
                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Natsume CMS
                    </div>
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="hidden md:block px-4 py-3 mx-2 text-sm font-semibold text-gray-400 uppercase border-b border-gray-700 tracking-wider">
                    Natsume CMS
                </div>

                <nav className="px-4 py-4 space-y-1">
                    {links.map(({ label, to }) => (
                        <Link
                            key={label}
                            to={to}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-2 rounded transition ${
                                location.pathname === to
                                    ? "bg-[#1e3a8a] text-white"
                                    : "hover:bg-[#2a2d33] hover:text-white text-gray-300"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src={account.avatarUrl}
                            alt="avatar"
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="text-sm leading-tight truncate">
                            <div>{account.name}</div>
                            <div className="text-xs text-gray-400">{account.id}</div>
                        </div>
                    </div>
                    <button
                        className="text-gray-400 hover:text-red-400 transition"
                        onClick={() => alert("ログアウト処理")}
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </div>

            {!isOpen && (
                <button
                    className="fixed top-4 right-4 z-[999] bg-white/90 text-black shadow-md p-2 rounded-md md:hidden border border-gray-300"
                    onClick={() => setIsOpen(true)}
                >
                    <FaBars />
                </button>
            )}
        </>
    );
}
