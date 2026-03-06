import React from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
    const { isAuthenticated, username, role, logout } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Users className="h-8 w-8 text-blue-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">EmpFamilyReg</span>
                            </div>
                            <nav className="ml-6 flex space-x-8">
                                <Link to="/" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Employees
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-4 text-sm text-gray-600">
                                Welcome, <span className="font-medium text-gray-900">{username}</span> ({role})
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center text-gray-500 hover:text-gray-700"
                            >
                                <LogOut className="h-5 w-5 mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};
