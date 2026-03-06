import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Employee } from '../types';
import { Button } from '../components/ui/Button';
import { jsPDF } from 'jspdf';
import { ArrowLeft, User, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const EmployeeDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await api.get<Employee>(`/employees/${id}`);
                setEmployee(response.data);
            } catch (err) {
                setError('Failed to fetch employee details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    const exportCV = () => {
        if (!employee) return;

        const doc = new jsPDF();
        let yPos = 20;
        const lineHeight = 10;

        // Header
        doc.setFontSize(22);
        doc.text('Employee CV Profile', 105, yPos, { align: 'center' });
        yPos += lineHeight * 2;

        // Personal Info
        doc.setFontSize(16);
        doc.text('Personal Information', 20, yPos);
        yPos += lineHeight;

        doc.setFontSize(12);
        doc.text(`Name: ${employee.name}`, 20, yPos); yPos += lineHeight;
        doc.text(`NID: ${employee.nid}`, 20, yPos); yPos += lineHeight;
        doc.text(`Phone: ${employee.phone}`, 20, yPos); yPos += lineHeight;
        doc.text(`Department: ${employee.department}`, 20, yPos); yPos += lineHeight;
        doc.text(`Basic Salary: BDT ${employee.basicSalary.toLocaleString()}`, 20, yPos); yPos += lineHeight * 2;

        // Spouse Info
        if (employee.spouse) {
            doc.setFontSize(16);
            doc.text('Spouse Information', 20, yPos);
            yPos += lineHeight;

            doc.setFontSize(12);
            doc.text(`Name: ${employee.spouse.name}`, 20, yPos); yPos += lineHeight;
            doc.text(`NID: ${employee.spouse.nid}`, 20, yPos); yPos += lineHeight * 2;
        }

        // Children Info
        if (employee.children && employee.children.length > 0) {
            doc.setFontSize(16);
            doc.text('Children Information', 20, yPos);
            yPos += lineHeight;

            doc.setFontSize(12);
            employee.children.forEach((child, index) => {
                const formattedDate = format(new Date(child.dateOfBirth), 'dd MMM yyyy');
                doc.text(`${index + 1}. ${child.name} (DOB: ${formattedDate})`, 20, yPos);
                yPos += lineHeight;
            });
        }

        doc.save(`${employee.name.replace(/\s+/g, '_')}_CV.pdf`);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    }

    if (error || !employee) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-600 mb-4">{error || 'Employee not found.'}</div>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                </Button>
                <Button onClick={exportCV}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export CV (PDF)
                </Button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center bg-gray-50 border-b border-gray-200">
                    <User className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.name}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">NID</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.nid}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.phone}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Department</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.department}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Basic Salary</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">৳{employee.basicSalary.toLocaleString()}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center bg-gray-50 border-b border-gray-200">
                    <Users className="h-6 w-6 text-gray-400 mr-3" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Family Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Spouse</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {employee.spouse ? (
                                    <div>
                                        <p className="font-medium">{employee.spouse.name}</p>
                                        <p className="text-gray-500">NID: {employee.spouse.nid}</p>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">No spouse recorded</span>
                                )}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Children ({employee.children.length})</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {employee.children.length > 0 ? (
                                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                        {employee.children.map((child) => (
                                            <li key={child.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                <div className="w-0 flex-1 flex items-center">
                                                    <span className="ml-2 flex-1 w-0 truncate">{child.name}</span>
                                                </div>
                                                <div className="ml-4 flex-shrink-0 text-gray-500">
                                                    DOB: {format(new Date(child.dateOfBirth), 'dd MMM yyyy')}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-400 italic">No children recorded</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};
