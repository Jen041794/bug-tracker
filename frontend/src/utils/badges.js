// 把後端的 enum 值轉成顯示用的「顏色」和「中文標籤」。
// 後端傳什麼，前端怎麼亮 — 都在這。
// Day 8/9 接表單和 API 時也會用同一份。

export const SEVERITY_META = {
  CRITICAL: { color: 'danger', label: '緊急' },
  MAJOR: { color: 'orange', label: '一般' },
  MINOR: { color: 'success', label: '低' },
};

export const STATUS_META = {
  OPEN: { color: 'secondary', label: '待處理' },
  IN_PROGRESS: { color: 'primary', label: '處理中' },
  CLOSED: { color: 'success', label: '已關閉' },
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
