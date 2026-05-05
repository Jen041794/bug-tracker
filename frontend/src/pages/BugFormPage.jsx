import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import mockBugs from '../data/mockBugs';
import { SEVERITY_META, STATUS_META } from '../utils/badges';

const EMPTY_FORM = {
  title: '',
  description: '',
  severity: '',
  status: 'OPEN',
  reporter: '',
  assignee: '',
};

function BugFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = mode === 'edit';
  const existingBug = isEdit ? mockBugs.find((b) => b.id === id) : null;

  const initialForm = existingBug
    ? {
        title: existingBug.title,
        description: existingBug.description ?? '',
        severity: existingBug.severity,
        status: existingBug.status,
        reporter: existingBug.reporter,
        assignee: existingBug.assignee ?? '',
      }
    : EMPTY_FORM;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  if (isEdit && !existingBug) {
    return (
      <div className="alert alert-warning">
        <h2 className="h5">找不到這個 Bug</h2>
        <p className="mb-2">
          ID <code>{id}</code> 對應不到任何資料。
        </p>
        <Link to="/" className="btn btn-sm btn-outline-secondary">
          ← 回 Bug 列表
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) {
      next.title = '請輸入標題';
    } else if (form.title.length > 200) {
      next.title = '標題最多 200 字';
    }
    if (!form.severity) {
      next.severity = '請選擇嚴重度';
    }
    if (!form.reporter.trim()) {
      next.reporter = '請輸入回報者';
    }
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...form,
      description: form.description.trim() || null,
      assignee: form.assignee.trim() || null,
      title: form.title.trim(),
      reporter: form.reporter.trim(),
    };

    console.log(`[${isEdit ? 'PATCH' : 'POST'}] payload:`, payload);
    alert(
      `${isEdit ? '編輯' : '新增'}成功(模擬)\nDay 9 才會真的存到 DB,目前先 console.log。`,
    );
    navigate('/');
  };

  return (
    <div>
      <div className="mb-3">
        <Link to="/" className="text-decoration-none">
          ← 回 Bug 列表
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h1 className="h3 mb-4">{isEdit ? '編輯 Bug' : '新增 Bug'}</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                標題 <span className="text-danger">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                value={form.title}
                onChange={handleChange}
                maxLength={200}
              />
              {errors.title && (
                <div className="invalid-feedback">{errors.title}</div>
              )}
              <div className="form-text">
                {form.title.length} / 200
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                描述
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="severity" className="form-label">
                  嚴重度 <span className="text-danger">*</span>
                </label>
                <select
                  id="severity"
                  name="severity"
                  className={`form-select ${errors.severity ? 'is-invalid' : ''}`}
                  value={form.severity}
                  onChange={handleChange}
                >
                  <option value="">— 請選擇 —</option>
                  {Object.entries(SEVERITY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}（{key}）
                    </option>
                  ))}
                </select>
                {errors.severity && (
                  <div className="invalid-feedback">{errors.severity}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="status" className="form-label">
                  狀態
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}（{key}）
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="reporter" className="form-label">
                  回報者 <span className="text-danger">*</span>
                </label>
                <input
                  id="reporter"
                  name="reporter"
                  type="text"
                  className={`form-control ${errors.reporter ? 'is-invalid' : ''}`}
                  value={form.reporter}
                  onChange={handleChange}
                />
                {errors.reporter && (
                  <div className="invalid-feedback">{errors.reporter}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="assignee" className="form-label">
                  指派給
                </label>
                <input
                  id="assignee"
                  name="assignee"
                  type="text"
                  className="form-control"
                  value={form.assignee}
                  onChange={handleChange}
                  placeholder="留空 = 未指派"
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary">
                {isEdit ? '儲存變更' : '新增 Bug'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BugFormPage;
