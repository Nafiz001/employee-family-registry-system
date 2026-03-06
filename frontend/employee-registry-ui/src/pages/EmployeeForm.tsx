import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
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
            if (err.response?.data?.errors) {
                // Backend validation errors
                const backendErrors = Object.values(err.response.data.errors).flat().join(', ');
                setGlobalError(backendErrors);
            } else if (err.response?.data?.message) {
                setGlobalError(err.response.data.message);
            } else {
                setGlobalError('Something went wrong. Please try again.');
            }
        }
    };

    if (isLoadingData) {
        return <div className="p-8 text-center text-gray-500">Loading form data...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </h1>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">

                    {globalError && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md">
                            {globalError}
                        </div>
                    )}

                    {/* Personal Info */}
                    <div className="space-y-6 py-2">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <Input
                                label="Full Name *"
                                {...register('name')}
                                error={errors.name?.message}
                            />
                            <Input
                                label="NID (10 or 17 digits) *"
                                {...register('nid')}
                                error={errors.nid?.message}
                                disabled={isEditMode} // Cannot change NID once created typically
                            />
                            <Input
                                label="Phone (+880...) *"
                                {...register('phone')}
                                error={errors.phone?.message}
                            />
                            <Input
                                label="Department *"
                                {...register('department')}
                                error={errors.department?.message}
                            />
                            <Input
                                label="Basic Salary (BDT) *"
                                type="number"
                                {...register('basicSalary')}
                                error={errors.basicSalary?.message}
                            />
                        </div>
                    </div>

                    {/* Spouse Info */}
                    <div className="space-y-6 pt-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Spouse Information</h3>
                            <div className="flex items-center">
                                <input
                                    id="hasSpouse"
                                    type="checkbox"
                                    {...register('hasSpouse')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="hasSpouse" className="ml-2 block text-sm text-gray-900">
                                    Has Spouse?
                                </label>
                            </div>
                        </div>

                        {hasSpouse && (
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 bg-gray-50 p-4 rounded-md">
                                <Input
                                    label="Spouse Name *"
                                    {...register('spouse.name' as any)}
                                    error={(errors.spouse as any)?.name?.message}
                                />
                                <Input
                                    label="Spouse NID (10 or 17 digits) *"
                                    {...register('spouse.nid' as any)}
                                    error={(errors.spouse as any)?.nid?.message}
                                />
                            </div>
                        )}
                    </div>

                    {/* Children Info */}
                    <div className="space-y-6 pt-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Children</h3>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => appendChild({ name: '', dateOfBirth: '' })}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Child
                            </Button>
                        </div>

                        {childrenFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-12 bg-gray-50 p-4 rounded-md items-start">
                                <div className="sm:col-span-5">
                                    <Input
                                        label="Child's Name *"
                                        {...register(`children.${index}.name`)}
                                        error={errors.children?.[index]?.name?.message}
                                    />
                                </div>
                                <div className="sm:col-span-5">
                                    <Input
                                        label="Date of Birth *"
                                        type="date"
                                        {...register(`children.${index}.dateOfBirth`)}
                                        error={errors.children?.[index]?.dateOfBirth?.message}
                                    />
                                </div>
                                <div className="sm:col-span-2 pt-6 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => removeChild(index)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {childrenFields.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No children added.</p>
                        )}
                    </div>

                    <div className="pt-8 flex justify-end">
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="mr-3">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {isEditMode ? 'Save Changes' : 'Create Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
