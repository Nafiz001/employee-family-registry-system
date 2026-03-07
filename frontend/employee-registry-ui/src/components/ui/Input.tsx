import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', disabled, ...props }, ref) => {
        return (
            <div className={`w-full flex flex-col gap-1.5 ${className}`}>
                <label className="block text-sm font-semibold text-slate-700">
                    {label}
                </label>
                <input
                    ref={ref}
                    disabled={disabled}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className={[
                        'appearance-none block w-full px-4 py-2.5 border rounded-lg',
                        'placeholder:text-slate-400 text-slate-900 text-sm outline-none transition-all',
                        error ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary',
                        disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white',
                    ].join(' ')}
                    {...props}
                />
                {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
