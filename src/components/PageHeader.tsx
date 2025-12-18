
import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="mb-6">
            <h1 className="text-2xl font-bold text-brand-lightest-slate">{title}</h1>
            <p className="text-brand-slate">{subtitle}</p>
        </header>
    );
};

export default PageHeader;
