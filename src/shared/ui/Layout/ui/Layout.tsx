import { PropsWithChildren } from 'react';
import './layout.scss';

export function Layout ({ children }: PropsWithChildren)
{
    return (
        <div className="app-layout">
            <div className="app-layout__inner">{children}</div>
        </div>
    );
}
