import EmptyState from './EmptyState.jsx';

// Generic table. `columns` describes each column:
//   { key: 'customer', header: 'Customer', render?: (row) => <jsx/>, align?: 'right' }
// Rows are drawn with rows.map(); `render` customises a cell, otherwise row[key] is shown.
export default function DataTable({ columns, rows, rowKey = 'id', onRowClick, emptyTitle, emptyMessage }) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle ?? 'No records found'} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(({ key, header, align }) => (
              <th
                key={key}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : undefined}
            >
              {columns.map(({ key, render, align }) => (
                <td
                  key={key}
                  className={`whitespace-nowrap px-4 py-3 text-slate-700 ${align === 'right' ? 'text-right tabular-nums' : ''}`}
                >
                  {render ? render(row) : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
