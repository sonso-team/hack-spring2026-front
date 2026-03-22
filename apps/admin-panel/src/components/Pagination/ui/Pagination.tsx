import './Pagination.scss';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPage }: PaginationProps) => (
  <div className="pagination">
    <button
      type="button"
      className="pagination__btn"
      onClick={() => onPage(Math.max(1, page - 1))}
      disabled={page === 1}
    >
      ←
    </button>
    <span className="pagination__info">
      {page} / {totalPages}
    </span>
    <button
      type="button"
      className="pagination__btn"
      onClick={() => onPage(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
    >
      →
    </button>
  </div>
);
