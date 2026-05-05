import { useParams, Link } from 'react-router-dom';
import mockBugs from '../data/mockBugs';
import { SEVERITY_META, STATUS_META, formatDateTime } from '../utils/badges';

function BugDetailPage() {
  const { id } = useParams();
  const bug = mockBugs.find((b) => b.id === id);

  if (!bug) {
    return (
      <div className="alert alert-warning">
        <h2 className="h5">找不到這個 Bug</h2>
        <p className="mb-2">
          ID <code>{id}</code> 對應不到任何資料。可能已經被刪除,或網址打錯了。
        </p>
        <Link to="/" className="btn btn-sm btn-outline-secondary">
          ← 回 Bug 列表
        </Link>
      </div>
    );
  }

  const sev = SEVERITY_META[bug.severity];
  const stat = STATUS_META[bug.status];

  return (
    <div>
      <div className="mb-3">
        <Link to="/" className="text-decoration-none">
          ← 回 Bug 列表
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className={`badge bg-${sev.color}`}>{sev.label}</span>
            <span className={`badge bg-${stat.color}`}>{stat.label}</span>
          </div>

          <h1 className="h3 mb-3">{bug.title}</h1>

          {bug.description && (
            <div className="mb-4">
              <div className="text-muted small mb-1">描述</div>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {bug.description}
              </p>
            </div>
          )}

          <dl className="row mb-4">
            <dt className="col-sm-3 text-muted">指派給</dt>
            <dd className="col-sm-9">
              {bug.assignee || <span className="text-muted">未指派</span>}
            </dd>

            <dt className="col-sm-3 text-muted">回報者</dt>
            <dd className="col-sm-9">{bug.reporter}</dd>

            <dt className="col-sm-3 text-muted">建立時間</dt>
            <dd className="col-sm-9">{formatDateTime(bug.createdAt)}</dd>

            <dt className="col-sm-3 text-muted">最後更新</dt>
            <dd className="col-sm-9">{formatDateTime(bug.updatedAt)}</dd>
          </dl>

          <div className="d-flex gap-2">
            <Link
              to={`/bugs/${bug.id}/edit`}
              className="btn btn-primary"
            >
              ✏️ 編輯
            </Link>
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled
              title="Day 8 才會啟用"
            >
              🗑️ 刪除（Day 8 啟用)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BugDetailPage;
