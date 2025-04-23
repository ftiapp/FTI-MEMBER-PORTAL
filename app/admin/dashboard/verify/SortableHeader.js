import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

export default function SortableHeader({ field, label, sortField, sortOrder, onSort }) {
  const isActive = sortField === field;
  const handleSort = () => {
    if (!onSort) return;
    if (!isActive) onSort(field, 'asc');
    else onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
  };
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none"
      onClick={handleSort}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive && (
          sortOrder === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />
        )}
      </span>
    </th>
  );
}
