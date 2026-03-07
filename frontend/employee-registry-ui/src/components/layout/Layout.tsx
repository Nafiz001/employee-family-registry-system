import React from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, Bell } from 'lucide-react';

export const Layout: React.FC = () => {
    const { isAuthenticated, username, role, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = username ? username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded-lg flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-slate-900 text-base sm:text-lg font-bold leading-tight tracking-tight">HR System</h2>
                    <nav className="hidden md:flex items-center gap-6 ml-2">
                        <Link
                            to="/"
                            className={`text-sm font-semibold py-1 transition-colors ${location.pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-slate-600 hover:text-primary'}`}
                        >
                            Employees
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        className="flex items-center justify-center rounded-full h-9 w-9 hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20 flex-shrink-0">
                            {initials}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 leading-none">{username}</p>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{role}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 rounded-lg h-9 px-2 sm:px-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-medium ml-1"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
                <Outlet />
            </main>

            <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-10 py-4">
                <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <p>© 2024 HR System Pro v2.4. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-primary transition-colors">Support Center</a>
                        <a href="#" className="hover:text-primary transition-colors">System Status</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
