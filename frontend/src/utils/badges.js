// 把後端的 enum 值轉成顯示用的「顏色」和「中文標籤」。
// 後端傳什麼，前端怎麼亮 — 都在這。
// Day 8/9 接表單和 API 時也會用同一份。

export const SEVERITY_META = {
  CRITICAL: { color: 'danger', label: '危急' },
  MAJOR: { color: 'warning', label: '主要' },
  MINOR: { color: 'success', label: '次要' },
};

export const STATUS_META = {
  OPEN: { color: 'primary', label: '未處理' },
  IN_PROGRESS: { color: 'info', label: '處理中' },
  CLOSED: { color: 'secondary', label: '已關閉' },
};

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
