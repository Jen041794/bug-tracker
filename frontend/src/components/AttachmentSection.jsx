import { useRef, useState } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AttachmentSection({ bugId, attachments, onChange }) {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const accepted = [];
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        showToast(`「${file.name}」不是支援的圖片格式`, 'error');
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        showToast(`「${file.name}」超過 5MB 上限`, 'error');
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    setUploading(true);
    const newOnes = [];
    for (const file of accepted) {
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await api.post(`/api/bugs/${bugId}/attachments`, form, {
          headers: { 'Content-Type': undefined },
        });
        newOnes.push(res.data);
      } catch (err) {
        const msg = err.response?.data?.error || err.message || '上傳失敗';
        showToast(`「${file.name}」上傳失敗：${msg}`, 'error');
      }
    }
    setUploading(false);

    if (newOnes.length > 0) {
      onChange([...(attachments || []), ...newOnes]);
      showToast(`已上傳 ${newOnes.length} 張圖片`, 'success');
    }
  };

  const handleDelete = async (att) => {
    if (!window.confirm(`確定要刪除這張附件嗎？\n\n「${att.filename}」`)) {
      return;
    }
    setDeletingId(att.id);
    try {
      await api.delete(`/api/attachments/${att.id}`);
      onChange((attachments || []).filter((a) => a.id !== att.id));
      showToast('附件已刪除', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '刪除失敗';
      showToast(`刪除失敗：${msg}`, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const list = attachments || [];

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="text-muted small">
          附件 {list.length > 0 && `(${list.length})`}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handlePickFiles}
          disabled={uploading}
        >
          {uploading ? '上傳中...' : '📎 加入圖片'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(',')}
          multiple
          hidden
          onChange={handleFilesSelected}
        />
      </div>

      <div className="form-text mb-2">
        支援 JPG / PNG / WebP / GIF，單檔 5MB 以內
      </div>

      {list.length === 0 ? (
        <div className="text-muted small fst-italic">尚未加入任何附件</div>
      ) : (
        <div className="d-flex flex-wrap gap-2">
          {list.map((att) => (
            <div
              key={att.id}
              className="position-relative border rounded overflow-hidden"
              style={{ width: 120, height: 120 }}
            >
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${att.filename} (${formatSize(att.size)}) — 點擊看原圖`}
              >
                <img
                  src={att.url}
                  alt={att.filename}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </a>
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute"
                style={{
                  top: 4,
                  right: 4,
                  padding: '0 6px',
                  lineHeight: 1.2,
                  fontSize: 12,
                }}
                onClick={() => handleDelete(att)}
                disabled={deletingId === att.id}
                title="刪除附件"
              >
                {deletingId === att.id ? '…' : '×'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttachmentSection;
