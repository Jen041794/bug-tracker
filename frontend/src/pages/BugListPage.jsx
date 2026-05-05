import { Link } from 'react-router-dom';
import mockBugs from '../data/mockBugs';
import { SEVERITY_META, STATUS_META, formatDateTime } from '../utils/badges';

function BugListPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Bug 列表</h1>
        <Link to="/bugs/new" className="btn btn-primary">
          + 新增 Bug
        </Link>
      </div>

      <div className="text-muted small mb-2">
        共 {mockBugs.length} 筆（目前用假資料,Day 9 會接後端 API)
      </div>

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
            {mockBugs.map((bug) => {
              const sev = SEVERITY_META[bug.severity];
              const stat = STATUS_META[bug.status];
              return (
                <tr key={bug.id}>
                  <td>
                    <span className={`badge bg-${sev.color}`}>{sev.label}</span>
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
                  <td>{bug.assignee || <span className="text-muted">—</span>}</td>
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
    </div>
  );
}

export default BugListPage;
