export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="ims-pagination">
      <span>
        Trang {page}/{totalPages} · {total} mục
      </span>
      <div className="ims-pagination-actions">
        <button type="button" onClick={() => onChange(1)} disabled={page === 1}>
          Đầu
        </button>
        <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}>
          Trước
        </button>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
        >
          Sau
        </button>
        <button
          type="button"
          onClick={() => onChange(totalPages)}
          disabled={page === totalPages}
        >
          Cuối
        </button>
      </div>
    </div>
  );
}
