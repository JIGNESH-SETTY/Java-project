import React from 'react';

interface GlassTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassTable: React.FC<GlassTableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-[24px] border border-white/90 shadow-[0_4px_16px_rgba(41,40,43,0.03)] bg-white/80 backdrop-blur-md">
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
    <thead className={`border-b border-slate-100 bg-white/60 text-[11px] font-bold text-[#8E8B92] uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const GlassTableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-slate-100/80 text-xs text-[#29282B] ${className}`}>{children}</tbody>;
};

export const GlassTableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr className={`hover:bg-white/80 transition-colors ${className}`} {...props}>
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
    <td className={`px-4 py-3.5 text-[#29282B] ${className}`} {...props}>
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
    <th className={`px-4 py-3 text-slate-700 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};
