import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function SidebarLayout() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
