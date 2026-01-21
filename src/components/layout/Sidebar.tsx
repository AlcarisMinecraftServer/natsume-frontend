import { useState, useEffect } from 'react';
import { FaCube, FaScroll, FaFolder, FaTicketAlt, FaUserCog, FaSignOutAlt, FaBars, FaTasks, FaPaintBrush } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/context/AuthContext';

const NavigationSidebar = () => {
    const navigate = useNavigate();
    const { actor, logout } = useAuth();

    const [currentPath, setCurrentPath] = useState('/items');
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const links = [
        { label: "アイテム設定", to: "/items", icon: FaCube },
        { label: "レシピ設定", to: "/recipes", icon: FaScroll },
        { label: "クエスト設定", to: "/quests", icon: FaTasks },
        { label: "リソースパック設定", to: "/resourcepacks", icon: FaPaintBrush },
        { label: "ファイル", to: "/files", icon: FaFolder },
        { label: "チケット", to: "/tickets", icon: FaTicketAlt },
        { label: "プレイヤー個人設定", to: "/player", icon: FaUserCog },
    ];


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const displayName = actor?.global_name || actor?.username || 'unknown';
    const avatarUrl = actor?.avatar_url || null;

    const handleNavClick = (to: string) => {
        setCurrentPath(to);
        navigate(to);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <>
            {isMobile && (
                <header
                    className="fixed top-2 right-2 z-50"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                >
                    <div className="flex justify-center items-center">
                        <div
                            className="backdrop-blur-sm relative w-full max-w-sm flex items-center justify-center p-2.5 shadow-sm"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '16px'
                            }}
                        >
                            <button
                                className="p-0.5 flex mr-auto"
                                style={{ color: '#7f8b91' }}
                                onClick={toggleSidebar}
                            >
                                <FaBars className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </header>
            )}

            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                className={`${isMobile
                    ? `fixed left-3 top-3 bottom-3 w-4/5 max-w-74.5 z-50 rounded-3xl shadow-lg border transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                    }`
                    : `${isExpanded ? 'w-74.5' : 'w-18'} h-screen border-r transition-all duration-300`
                    }`}
                style={{
                    backgroundColor: '#fff',
                    borderColor: isMobile ? '#e9eef1' : 'rgba(233, 238, 241, 0.7)',
                    animation: isMobile && isMobileMenuOpen ? 'sidebarIn 0.3s ease-out' : undefined
                }}
            >
                <div
                    className={`${isMobile
                        ? 'w-full h-full rounded-3xl'
                        : `${isExpanded ? 'w-74.5' : 'w-18'} fixed top-0 h-screen border-r`
                        } flex-col pt-4 flex transition-all duration-300`}
                    style={{
                        backgroundColor: '#fff',
                        borderColor: isMobile ? 'transparent' : 'rgba(233, 238, 241, 0.7)'
                    }}
                >
                    <header className={`flex items-center mb-6 ${isExpanded || isMobile ? 'justify-between px-5' : 'justify-center px-3'}`}>
                        {isExpanded && (
                            <a href="/" className="flex items-center gap-2.5">
                                <span
                                    className="h-10 w-10 aspect-square rounded-xl flex items-center justify-center text-white text-xl font-bold"
                                    style={{ backgroundColor: '#4a5b77' }}
                                >
                                    N
                                </span>
                                {(isExpanded || isMobile) && (
                                    <span
                                        className="text-lg font-bold"
                                        style={{ color: '#080d12' }}
                                    >
                                        Natsume
                                    </span>
                                )}
                            </a>
                        )}
                        {!isMobile && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: '#7f8b91' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f6f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <FaBars className="w-5 h-5" />
                            </button>
                        )}
                    </header>

                    <nav className={`flex-1 flex flex-col ${isExpanded || isMobile ? 'px-3' : 'px-2'}`}>
                        {links.map((link) => {
                            const isActive = currentPath === link.to;
                            const Icon = link.icon;
                            const showLabel = isExpanded || isMobile;

                            return (
                                <div
                                    key={link.to}
                                    className="relative group mb-1"
                                >
                                    <a
                                        href={link.to}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(link.to);
                                        }}
                                        className={`flex items-center rounded-lg transition-colors ${showLabel ? 'gap-3 px-3 py-3' : 'justify-center px-2 py-3'
                                            }`}
                                        style={{
                                            backgroundColor: isActive ? '#f1f6f9' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = '#f6f9fb')}
                                        onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <Icon
                                            className={`shrink-0 ${showLabel ? 'w-5 h-5' : 'w-6 h-6'}`}
                                            style={{ color: isActive ? '#4a5b77' : '#99a2a7' }}
                                        />
                                        {showLabel && (
                                            <span
                                                className="flex-1 text-left text-sm"
                                                style={{
                                                    color: isActive ? '#080d12' : '#4b5256',
                                                    fontWeight: isActive ? '600' : '500'
                                                }}
                                            >
                                                {link.label}
                                            </span>
                                        )}
                                    </a>

                                    {!showLabel && (
                                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 top-1/2 -translate-y-1/2">
                                            {link.label}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div className={`mt-auto border-t ${isExpanded || isMobile ? 'px-3' : 'px-2'} py-4`} style={{ borderColor: '#e9eef1' }}>
                        {(isExpanded || isMobile) ? (
                            <div className="flex items-center justify-between">
                                <button
                                    className="flex items-center gap-0 p-0 rounded-full transition-colors"
                                >
                                    <span className="w-10 h-10 flex rounded-full overflow-hidden">
                                        {avatarUrl ? (
                                            <img
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                src={avatarUrl}
                                            />
                                        ) : (
                                            <span
                                                className="w-full h-full flex items-center justify-center text-white font-bold"
                                                style={{ backgroundColor: '#4a5b77' }}
                                            >
                                                {displayName.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
                                    style={{
                                        color: '#dc2626',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <FaSignOutAlt className="w-4 h-4" />
                                    <span>ログアウト</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <button className="flex items-center p-0 rounded-full">
                                    <span className="w-10 h-10 flex rounded-full overflow-hidden">
                                        {avatarUrl ? (
                                            <img
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                src={avatarUrl}
                                            />
                                        ) : (
                                            <span
                                                className="w-full h-full flex items-center justify-center text-white font-bold"
                                                style={{ backgroundColor: '#4a5b77' }}
                                            >
                                                {displayName.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ color: '#dc2626' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="ログアウト"
                                >
                                    <FaSignOutAlt className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default NavigationSidebar;
