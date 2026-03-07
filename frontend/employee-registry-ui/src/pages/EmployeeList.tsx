import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Employee } from '../types';
import { Plus, Search, FileDown, Trash2, Edit, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { isAdmin } = useAuth();

    // 400ms Debounce effect
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 400);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Fetch data
    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const response = await api.get<Employee[]>('/employees', {
                    params: { search: debouncedSearchTerm || undefined }
                });
                setEmployees(response.data);
            } catch (err) {
                setError('Failed to fetch employees.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, [debouncedSearchTerm]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            await api.delete(`/employees/${id}`);
            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (err) {
            alert('Failed to delete employee.');
        }
    };

    const exportToPdf = () => {
        const doc = new jsPDF();
        doc.text('Employee List', 14, 15);

        const tableData = employees.map(emp => [
            emp.id,
            emp.name,
            emp.nid,
            emp.phone,
            emp.department,
            emp.basicSalary.toLocaleString()
        ]);

        autoTable(doc, {
            head: [['ID', 'Name', 'NID', 'Phone', 'Department', 'Basic Salary (BDT)']],
            body: tableData,
            startY: 20,
        });

        doc.save('employee_list.pdf');
    };

    // Generate initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-slate-900 text-2xl sm:text-3xl font-black leading-tight tracking-tight">Employees Registry</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and monitor all active personnel records</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={exportToPdf}
                        className="flex items-center justify-center gap-2 rounded-lg h-10 sm:h-11 px-4 sm:px-5 bg-white text-slate-700 border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <FileDown className="h-4 w-4" />
                        <span className="hidden xs:inline">Export PDF</span>
                        <span className="xs:hidden">PDF</span>
                    </button>
                    {isAdmin && (
                        <Link
                            to="/employees/new"
                            className="flex items-center justify-center gap-2 rounded-lg h-10 sm:h-11 px-4 sm:px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden xs:inline">Add Employee</span>
                            <span className="xs:hidden">Add</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, NID, or department..."
                        className="block w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 placeholder-slate-400 transition-all outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Name &amp; Contact</th>
                                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">NID Number</th>
                                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Department</th>
                                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Monthly Salary</th>
                                    <th className="px-4 sm:px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <div className="flex justify-center">
                                                <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!isLoading && employees.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                                {!isLoading && employees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                                                    {getInitials(employee.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{employee.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{employee.phone}</p>
                                                    {/* Show dept/salary on small screens */}
                                                    <div className="flex flex-wrap gap-1.5 mt-1 sm:hidden">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                                            {employee.department}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:py-5 hidden md:table-cell">
                                            <p className="text-sm text-slate-600 font-medium">{employee.nid}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                                {employee.department}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:py-5 hidden lg:table-cell">
                                            <p className="text-sm font-bold text-slate-900">৳{employee.basicSalary.toLocaleString()}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                                            <div className="flex justify-end gap-1 sm:gap-2">
                                                <Link
                                                    to={`/employees/${employee.id}`}
                                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </Link>
                                                {isAdmin && (
                                                    <Link
                                                        to={`/employees/${employee.id}/edit`}
                                                        className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </Link>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(employee.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer with count */}
                    {!isLoading && employees.length > 0 && (
                        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50">
                            <p className="text-xs text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{employees.length}</span> employee{employees.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
