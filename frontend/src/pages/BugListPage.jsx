import { useState } from 'react';
import { Link } from 'react-router-dom';
import mockBugs from '../data/mockBugs';
import { SEVERITY_META, STATUS_META, formatDateTime } from '../utils/badges';

function BugListPage() {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const filtered = mockBugs.filter((bug) => {
    if (filterStatus && bug.status !== filterStatus) return false;
    if (filterSeverity && bug.severity !== filterSeverity) return false;
    return true;
  });

  const handleReset = () => {
    setFilterStatus('');
    setFilterSeverity('');
  };

  const isFiltered = filterStatus || filterSeverity;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Bug 列表</h1>
        <Link to="/bugs/new" className="btn btn-primary">
          + 新增 Bug
        </Link>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label htmlFor="filter-status" className="form-label small mb-1">
                狀態
              </label>
              <select
                id="filter-status"
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">全部</option>
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="filter-severity" className="form-label small mb-1">
                嚴重度
              </label>
              <select
                id="filter-severity"
                className="form-select form-select-sm"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="">全部</option>
                {Object.entries(SEVERITY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleReset}
                disabled={!isFiltered}
              >
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted small mb-2">
        {isFiltered
          ? `共 ${mockBugs.length} 筆 / 篩選後 ${filtered.length} 筆`
          : `共 ${mockBugs.length} 筆`}
        （目前用假資料,Day 9 會接後端 API)
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-info">
          沒有符合條件的 Bug。
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>嚴重度</th>
                <th>標題</th>
                <th style={{ width: '100px' }}>狀態</th>
                <th style={{ width: '120px' }}>指派給</th>
                <th style={{ width: '120px' }}>回報者</th>
                <th style={{ width: '160px' }}>建立時間</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bug) => {
                const sev = SEVERITY_META[bug.severity];
                const stat = STATUS_META[bug.status];
                return (
                  <tr key={bug.id}>
                    <td>
                      <span className={`badge bg-${sev.color}`}>
                        {sev.label}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/bugs/${bug.id}`}
                        className="text-decoration-none"
                      >
                        {bug.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge bg-${stat.color}`}>
                        {stat.label}
                      </span>
                    </td>
                    <td>
                      {bug.assignee || (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{bug.reporter}</td>
                    <td className="text-muted small">
                      {formatDateTime(bug.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BugListPage;
