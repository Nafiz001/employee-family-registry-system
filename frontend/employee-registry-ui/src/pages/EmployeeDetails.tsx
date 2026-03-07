import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Employee } from '../types';
import { jsPDF } from 'jspdf';
import { ArrowLeft, FileText, User, Users as UsersIcon, Edit, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export const EmployeeDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
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
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const primary: [number, number, number] = [17, 17, 212];    // #1111d4
        const primaryLight: [number, number, number] = [235, 235, 252];
        const slate800: [number, number, number] = [30, 41, 59];
        const slate500: [number, number, number] = [100, 116, 139];
        const white: [number, number, number] = [255, 255, 255];

        // ── Header banner ──────────────────────────────────────────────
        doc.setFillColor(...primary);
        doc.rect(0, 0, pageW, 46, 'F');

        // Initials circle
        const initials = employee.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
        doc.setFillColor(...white);
        doc.circle(26, 23, 13, 'F');
        doc.setTextColor(...primary);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(initials, 26, 27, { align: 'center' });

        // Name & department
        doc.setTextColor(...white);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(employee.name, 46, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${employee.department}  ·  Employee ID: #EMP-${employee.id}`, 46, 29);

        // Salary badge
        doc.setFillColor(255, 255, 255, 0.18);
        doc.setTextColor(...white);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`BDT ${employee.basicSalary.toLocaleString('en-US')} / month`, pageW - 14, 20, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Basic Salary', pageW - 14, 27, { align: 'right' });

        // Generated date
        doc.setTextColor(200, 200, 240);
        doc.setFontSize(7);
        doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, pageW - 14, 38, { align: 'right' });

        let yPos = 60;

        // ── Section helper ──────────────────────────────────────────────
        const drawSection = (title: string) => {
            doc.setFillColor(...primaryLight);
            doc.roundedRect(14, yPos - 5, pageW - 28, 9, 2, 2, 'F');
            doc.setDrawColor(...primary);
            doc.setLineWidth(0.6);
            doc.line(14, yPos - 5, 14, yPos + 4);
            doc.setTextColor(...primary);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(title.toUpperCase(), 19, yPos + 1);
            yPos += 13;
        };

        // ── Two-column field helper ─────────────────────────────────────
        const drawRow = (label1: string, val1: string, label2: string, val2: string) => {
            const mid = pageW / 2 + 4;
            doc.setTextColor(...slate500);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(label1, 20, yPos);
            doc.setTextColor(...slate800);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(val1, 46, yPos);

            doc.setTextColor(...slate500);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(label2, mid, yPos);
            doc.setTextColor(...slate800);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(val2, mid + 26, yPos);
            yPos += 8;
        };

        // ── Personal Information ────────────────────────────────────────
        drawSection('Personal Information');
        drawRow('Full Name', employee.name, 'Phone', employee.phone);
        drawRow('NID Number', employee.nid, 'Department', employee.department);

        yPos += 4;

        // ── Family Information header ───────────────────────────────────
        const hasFamily = employee.spouse || (employee.children && employee.children.length > 0);
        if (hasFamily) {
            drawSection('Family Information');
        }

        // Spouse
        if (employee.spouse) {
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(14, yPos - 3, pageW - 28, 20, 2, 2, 'F');
            doc.setTextColor(...slate500);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text('SPOUSE', 20, yPos + 3);
            doc.setTextColor(...slate800);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(employee.spouse.name, 20, yPos + 10);
            doc.setTextColor(...slate500);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`NID: ${employee.spouse.nid}`, 20, yPos + 16);
            yPos += 26;
        }

        // Children
        if (employee.children && employee.children.length > 0) {
            yPos += 2;
            doc.setTextColor(...slate500);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('CHILDREN', 20, yPos);
            yPos += 7;

            employee.children.forEach((child, index) => {
                const formattedDate = format(new Date(child.dateOfBirth), 'dd MMM yyyy');
                const rowY = yPos;
                doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 252 : 255);
                doc.roundedRect(14, rowY - 4, pageW - 28, 10, 1, 1, 'F');
                doc.setTextColor(...slate800);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}.  ${child.name}`, 20, rowY + 2);
                doc.setTextColor(...slate500);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`DOB: ${formattedDate}`, pageW - 14, rowY + 2, { align: 'right' });
                yPos += 12;
            });
        }

        // ── Footer ──────────────────────────────────────────────────────
        doc.setFillColor(...primary);
        doc.rect(0, pageH - 12, pageW, 12, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Employee & Family Registry System  ·  Confidential', pageW / 2, pageH - 5, { align: 'center' });

        doc.save(`${employee.name.replace(/\s+/g, '_')}_CV.pdf`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">{error || 'Employee not found.'}</div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </button>
            </div>
        );
    }

    const initials = employee.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Hero Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3 flex-shrink-0">
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl sm:text-4xl ring-4 ring-primary/10">
                            {initials}
                        </div>
                        <div className="text-center sm:hidden">
                            <h1 className="text-slate-900 text-xl font-bold">{employee.name}</h1>
                            <p className="text-primary font-medium text-sm">{employee.department}</p>
                            <p className="text-slate-400 text-xs mt-0.5">ID: #EMP-{employee.id}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 w-full">
                        <div className="hidden sm:block mb-5">
                            <h1 className="text-slate-900 text-2xl font-bold">{employee.name}</h1>
                            <p className="text-primary font-medium">{employee.department}</p>
                            <p className="text-slate-400 text-sm mt-0.5">Employee ID: #EMP-{employee.id}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-background-light rounded-lg">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                    <p className="text-sm font-bold text-slate-800">Active</p>
                                </div>
                            </div>
                            <div className="p-3 bg-background-light rounded-lg">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Monthly Salary</p>
                                <p className="text-sm font-bold text-primary">৳{employee.basicSalary.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                            <button
                                onClick={exportCV}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg h-10 sm:h-11 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                <FileText className="h-4 w-4" />
                                Export CV (PDF)
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate(`/employees/${id}/edit`)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg h-10 sm:h-11 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            )}
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 rounded-lg h-10 sm:h-11 px-4 bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-primary/5 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-slate-900 text-base sm:text-lg font-bold">Personal Information</h2>
                </div>
                <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                        <div className="border-b border-slate-100 pb-3">
                            <p className="text-slate-500 text-xs font-medium mb-1">Full Name</p>
                            <p className="text-slate-900 text-sm sm:text-base font-semibold">{employee.name}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-3">
                            <p className="text-slate-500 text-xs font-medium mb-1">National ID (NID)</p>
                            <p className="text-slate-900 text-sm sm:text-base font-semibold">{employee.nid}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-3">
                            <p className="text-slate-500 text-xs font-medium mb-1">Phone Number</p>
                            <p className="text-slate-900 text-sm sm:text-base font-semibold">{employee.phone}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-3">
                            <p className="text-slate-500 text-xs font-medium mb-1">Department</p>
                            <p className="text-slate-900 text-sm sm:text-base font-semibold">{employee.department}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-3 sm:col-span-2">
                            <p className="text-slate-500 text-xs font-medium mb-1">Basic Salary</p>
                            <p className="text-primary text-sm sm:text-base font-bold">৳{employee.basicSalary.toLocaleString()} / mo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Family Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-primary/5 flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-slate-900 text-base sm:text-lg font-bold">Family Information</h2>
                </div>
                <div className="p-5 sm:p-6 space-y-6">
                    {/* Spouse */}
                    <div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Spouse</h3>
                        {employee.spouse ? (
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-light border border-primary/5">
                                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-semibold text-sm">{employee.spouse.name}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">NID: {employee.spouse.nid} • Primary Emergency Contact</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm italic">No spouse recorded</p>
                        )}
                    </div>

                    {/* Children */}
                    <div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
                            Children ({employee.children.length})
                        </h3>
                        {employee.children.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {employee.children.map((child) => {
                                    const dob = format(new Date(child.dateOfBirth), 'dd MMM yyyy');
                                    const age = new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear();
                                    return (
                                        <div key={child.id} className="flex items-center gap-3 p-4 rounded-lg bg-background-light border border-primary/5">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                <BadgeCheck className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-semibold text-sm">{child.name}</p>
                                                <p className="text-slate-500 text-xs mt-0.5">DOB: {dob} • Age: {age}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm italic">No children recorded</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer note */}
            <div className="flex justify-center pb-6">
                <p className="text-slate-400 text-xs text-center">
                    Confidential employee record. Authorized access only.
                </p>
            </div>
        </div>
    );
};
