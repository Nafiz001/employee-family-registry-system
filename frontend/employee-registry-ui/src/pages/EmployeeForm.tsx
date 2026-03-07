import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { Trash2, Plus, ArrowLeft, User, Users as UsersIcon, Baby } from 'lucide-react';
import { format } from 'date-fns';

const schema = yup.object({
    name: yup.string().required('Name is required').max(100),
    nid: yup.string()
        .required('NID is required')
        .matches(/^(\d{10}|\d{17})$/, 'NID must be exactly 10 or 17 digits'),
    phone: yup.string()
        .required('Phone is required')
        .matches(/^(\+8801|01)[3-9]\d{8}$/, 'Must be a valid Bangladesh phone number'),
    department: yup.string().required('Department is required').max(100),
    basicSalary: yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required('Salary is required')
        .positive('Must be positive'),
    hasSpouse: yup.boolean().default(false),
    spouse: yup.object().when('hasSpouse', {
        is: true,
        then: () => yup.object({
            name: yup.string().required('Spouse name is required'),
            nid: yup.string()
                .required('Spouse NID is required')
                .matches(/^(\d{10}|\d{17})$/, 'NID must be exactly 10 or 17 digits')
        }),
        otherwise: () => yup.object().notRequired().nullable()
    }),
    children: yup.array().of(
        yup.object({
            name: yup.string().required('Child name is required'),
            dateOfBirth: yup.string().required('Date of birth is required')
        })
    ).default([])
});

type FormData = yup.InferType<typeof schema>;

export const EmployeeForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [globalError, setGlobalError] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(isEditMode);

    const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            hasSpouse: false,
            children: [],
            basicSalary: 0
        }
    });

    const { fields: childrenFields, append: appendChild, remove: removeChild } = useFieldArray({
        control,
        name: "children"
    });

    const hasSpouse = watch('hasSpouse');

    // Load existing data if edit mode
    useEffect(() => {
        const fetchEmployee = async () => {
            if (!isEditMode) return;
            try {
                const response = await api.get(`/employees/${id}`);
                const emp = response.data;
                setValue('name', emp.name);
                setValue('nid', emp.nid);
                setValue('phone', emp.phone);
                setValue('department', emp.department);
                setValue('basicSalary', emp.basicSalary);

                if (emp.spouse) {
                    setValue('hasSpouse', true);
                    setValue('spouse', { name: emp.spouse.name, nid: emp.spouse.nid });
                }

                if (emp.children && emp.children.length > 0) {
                    emp.children.forEach((c: any) => {
                        // format date for date-input YYYY-MM-DD
                        const formattedDate = format(new Date(c.dateOfBirth), 'yyyy-MM-dd');
                        appendChild({ name: c.name, dateOfBirth: formattedDate });
                    });
                }
            } catch (err: any) {
                setGlobalError('Failed to load employee data.');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchEmployee();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);

    const onSubmit = async (data: FormData) => {
        setGlobalError('');
        try {
            // Clean up body based on hasSpouse
            const payload = {
                name: data.name,
                nid: data.nid,
                phone: data.phone,
                department: data.department,
                basicSalary: data.basicSalary,
                spouse: data.hasSpouse ? data.spouse : null,
                children: data.children
            };

            if (isEditMode) {
                await api.put(`/employees/${id}`, payload);
            } else {
                await api.post('/employees', payload);
            }
            navigate('/');
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors) {
                // Backend returns errors as array of { field, error } objects
                const backendErrors = Array.isArray(errors)
                    ? errors.map((e: any) => e.error ?? e.message ?? String(e)).join(', ')
                    : Object.values(errors).flat().join(', ');
                setGlobalError(backendErrors);
            } else if (err.response?.data?.message) {
                setGlobalError(err.response.data.message);
            } else {
                setGlobalError('Something went wrong. Please try again.');
            }
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Page header */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <h1 className="text-slate-900 text-xl sm:text-2xl font-black leading-tight">
                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {globalError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                        {globalError}
                    </div>
                )}

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-primary/5 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-slate-900 text-base font-bold">Personal Information</h2>
                    </div>
                    <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <FormField label="Full Name *" error={errors.name?.message}>
                                <input
                                    {...register('name')}
                                    placeholder="e.g. John Doe"
                                    className={fieldClass(!!errors.name)}
                                />
                            </FormField>
                            <FormField label="NID (10 or 17 digits) *" error={errors.nid?.message}>
                                <input
                                    {...register('nid')}
                                    placeholder="e.g. 1234567890"
                                    disabled={isEditMode}
                                    className={fieldClass(!!errors.nid, isEditMode)}
                                />
                            </FormField>
                            <FormField label="Phone (+880...) *" error={errors.phone?.message}>
                                <input
                                    {...register('phone')}
                                    placeholder="e.g. +8801712345678"
                                    className={fieldClass(!!errors.phone)}
                                />
                            </FormField>
                            <FormField label="Department *" error={errors.department?.message}>
                                <input
                                    {...register('department')}
                                    placeholder="e.g. Engineering"
                                    className={fieldClass(!!errors.department)}
                                />
                            </FormField>
                            <FormField label="Basic Salary (BDT) *" error={errors.basicSalary?.message} className="sm:col-span-2">
                                <input
                                    type="number"
                                    {...register('basicSalary')}
                                    placeholder="e.g. 50000"
                                    className={fieldClass(!!errors.basicSalary)}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Spouse Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-primary" />
                            <h2 className="text-slate-900 text-base font-bold">Spouse Information</h2>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                id="hasSpouse"
                                type="checkbox"
                                {...register('hasSpouse')}
                                className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-slate-600 font-medium select-none">Has Spouse?</span>
                        </label>
                    </div>
                    {hasSpouse ? (
                        <div className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <FormField label="Spouse Name *" error={(errors.spouse as any)?.name?.message}>
                                    <input
                                        {...register('spouse.name' as any)}
                                        placeholder="e.g. Jane Doe"
                                        className={fieldClass(!!(errors.spouse as any)?.name)}
                                    />
                                </FormField>
                                <FormField label="Spouse NID (10 or 17 digits) *" error={(errors.spouse as any)?.nid?.message}>
                                    <input
                                        {...register('spouse.nid' as any)}
                                        placeholder="e.g. 1234567890"
                                        className={fieldClass(!!(errors.spouse as any)?.nid)}
                                    />
                                </FormField>
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 sm:px-6 py-4">
                            <p className="text-sm text-slate-400 italic">Toggle "Has Spouse?" to add spouse details.</p>
                        </div>
                    )}
                </div>

                {/* Children */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Baby className="h-5 w-5 text-primary" />
                            <h2 className="text-slate-900 text-base font-bold">Children</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => appendChild({ name: '', dateOfBirth: '' })}
                            className="flex items-center gap-1.5 rounded-lg h-9 px-3 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Child
                        </button>
                    </div>
                    <div className="p-5 sm:p-6 space-y-4">
                        {childrenFields.length === 0 && (
                            <p className="text-sm text-slate-400 italic">No children added yet.</p>
                        )}
                        {childrenFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start bg-background-light rounded-lg p-4 border border-primary/5">
                                <div className="sm:col-span-5">
                                    <FormField label="Child's Name *" error={errors.children?.[index]?.name?.message}>
                                        <input
                                            {...register(`children.${index}.name`)}
                                            placeholder="e.g. Emily"
                                            className={fieldClass(!!errors.children?.[index]?.name)}
                                        />
                                    </FormField>
                                </div>
                                <div className="sm:col-span-5">
                                    <FormField label="Date of Birth *" error={errors.children?.[index]?.dateOfBirth?.message}>
                                        <input
                                            type="date"
                                            {...register(`children.${index}.dateOfBirth`)}
                                            className={fieldClass(!!errors.children?.[index]?.dateOfBirth)}
                                        />
                                    </FormField>
                                </div>
                                <div className="sm:col-span-2 flex sm:justify-end sm:pt-6">
                                    <button
                                        type="button"
                                        onClick={() => removeChild(index)}
                                        className="flex items-center gap-1.5 rounded-lg h-10 px-3 bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sm:hidden">Remove</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-white text-slate-700 border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {isEditMode ? 'Save Changes' : 'Create Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper sub-components
interface FormFieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
    className?: string;
}

function FormField({ label, error, children, className = '' }: FormFieldProps) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            {children}
            {error && <p className="text-xs text-rose-600 mt-0.5">{error}</p>}
        </div>
    );
}

function fieldClass(hasError: boolean, disabled = false) {
    return [
        'w-full h-11 px-4 rounded-lg border text-sm outline-none transition-all',
        'placeholder:text-slate-400 text-slate-900',
        hasError ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary',
        disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white',
    ].join(' ');
}
