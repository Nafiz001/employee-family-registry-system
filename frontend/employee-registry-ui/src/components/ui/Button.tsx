import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 border text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

        const variants = {
            primary: "border-transparent text-white bg-primary hover:bg-primary/90 focus:ring-primary/50 shadow-sm",
            secondary: "border-slate-200 text-slate-700 bg-white hover:bg-slate-50 focus:ring-primary/30",
            danger: "border-transparent text-white bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
