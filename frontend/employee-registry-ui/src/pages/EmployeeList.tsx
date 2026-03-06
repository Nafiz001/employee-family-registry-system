import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Employee } from '../types';
import { Button } from '../components/ui/Button';
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Employees Registry</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="secondary" onClick={exportToPdf} className="flex-1 sm:flex-none">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    {isAdmin && (
                        <Link to="/employees/new" className="flex-1 sm:flex-none">
                            <Button className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Employee
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, NID, or department..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 relative">
                                {isLoading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!isLoading && employees.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                                {!isLoading && employees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                                                <span className="text-sm text-gray-500">{employee.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.nid}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {employee.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ৳{employee.basicSalary.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link to={`/employees/${employee.id}`} className="text-gray-600 hover:text-blue-600" title="View Details">
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                {isAdmin && (
                                                    <Link to={`/employees/${employee.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit">
                                                        <Edit className="w-5 h-5" />
                                                    </Link>
                                                )}
                                                {isAdmin && (
                                                    <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
