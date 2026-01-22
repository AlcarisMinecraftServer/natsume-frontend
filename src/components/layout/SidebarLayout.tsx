import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function SidebarLayout() {
    return (
        <div className="flex min-h-screen w-full bg-[#0d0e11] text-gray-200">
            <Sidebar />

            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
