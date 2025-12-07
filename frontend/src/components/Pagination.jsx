import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ current, total, onPageChange }) => {

    const paginationRange = () => {
        const totalPageCount = total;
        const siblingCount = 1;
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount);
        }

        const leftSiblingIndex = Math.max(current - siblingCount, 1);
        const rightSiblingIndex = Math.min(current + siblingCount, totalPageCount);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, '...', totalPageCount];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
            return [firstPageIndex, '...', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
        }
    };

    const range = (start, end) => {
        let length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    };

    const pages = paginationRange();

    if (current === 0 || total < 2) {
        return null;
    }

    return (
        <div className="pagination-container">
            <button
                className="page-btn text"
                disabled={current === 1}
                onClick={() => onPageChange(current - 1)}
            >
                Previous
            </button>

            {pages.map((p, index) => {
                if (p === '...') {
                    return <span key={`dots-${index}`} className="dots">...</span>;
                }
                return (
                    <button
                        key={p}
                        className={`page-btn ${current === p ? 'active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                );
            })}

            <button
                className="page-btn text"
                disabled={current === total}
                onClick={() => onPageChange(current + 1)}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
