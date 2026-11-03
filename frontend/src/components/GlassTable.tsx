import React from 'react';

interface GlassTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassTable: React.FC<GlassTableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900">
      <table className={`w-full text-left text-xs border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const GlassTableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const GlassTableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-900 dark:text-slate-100 ${className}`}>{children}</tbody>;
};

export const GlassTableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const GlassTableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-4 py-3.5 text-slate-900 dark:text-slate-200 ${className}`} {...props}>
      {children}
    </td>
  );
};

export const GlassTableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th className={`px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};
