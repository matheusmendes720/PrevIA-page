
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-4 px-3 py-2 border-t border-brand-light-navy/50">
      <span className="text-sm text-brand-slate">
        Página <span className="font-semibold text-brand-lightest-slate">{currentPage}</span> de <span className="font-semibold text-brand-lightest-slate">{totalPages}</span>
      </span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-semibold rounded-md bg-brand-light-navy/50 text-brand-slate disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-light-navy"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-semibold rounded-md bg-brand-light-navy/50 text-brand-slate disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-light-navy"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default Pagination;