import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { SEVERITY_META, STATUS_META, formatDateTime } from '../utils/badges';

function BugListPage() {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterSeverity) params.severity = filterSeverity;

    api
      .get('/api/bugs', { params })
      .then((res) => {
        if (!cancelled) setBugs(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || '載入失敗');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterStatus, filterSeverity]);

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

      {loading && (
        <div className="text-center text-muted my-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
          <div className="mt-2 small">載入中...</div>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger">
          <strong>載入失敗</strong> — {error}
          <div className="small mt-1 text-muted">
            請確認後端 server 是否在 {import.meta.env.VITE_API_URL} 啟動。
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="text-muted small mb-2">
            {isFiltered ? `共篩選出 ${bugs.length} 筆` : `共 ${bugs.length} 筆`}
          </div>

          {bugs.length === 0 ? (
            <div className="alert alert-info">
              {isFiltered
                ? '沒有符合條件的 Bug。'
                : '目前沒有任何 Bug — 點右上角「+ 新增 Bug」開始。'}
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
                  {bugs.map((bug) => {
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
        </>
      )}
    </div>
  );
}

export default BugListPage;
