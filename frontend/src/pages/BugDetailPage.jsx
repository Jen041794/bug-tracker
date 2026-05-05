import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { SEVERITY_META, STATUS_META, formatDateTime } from '../utils/badges';

function BugDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    api
      .get(`/api/bugs/${id}`)
      .then((res) => {
        if (!cancelled) setBug(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || '載入失敗');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`確定要刪除這個 Bug 嗎?\n\n「${bug.title}」`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/api/bugs/${id}`);
      navigate('/');
    } catch (err) {
      alert(`刪除失敗:${err.message || '未知錯誤'}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted my-5">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
        <div className="mt-2 small">載入中...</div>
      </div>
    );
  }

  if (notFound) {
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

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>載入失敗</strong> — {error}
        <div className="small mt-1 text-muted">
          請確認後端 server 是否啟動。
        </div>
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
            <Link to={`/bugs/${bug.id}/edit`} className="btn btn-primary">
              ✏️ 編輯
            </Link>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '刪除中...' : '🗑️ 刪除'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BugDetailPage;
