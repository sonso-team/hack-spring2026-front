import './button.scss';

interface ButtonProps
{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export function Button ({ children, onClick, className = '', type = 'button' }: ButtonProps)
{
    return (
        <button className={`btn${className ? ` ${className}` : ''}`} onClick={onClick} type={type}>
            {children}
        </button>
    );
}
