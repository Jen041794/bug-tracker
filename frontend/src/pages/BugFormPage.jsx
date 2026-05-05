import { useParams } from 'react-router-dom';

function BugFormPage({ mode }) {
  const { id } = useParams();

  return (
    <div>
      <h1 className="h3 mb-3">
        {mode === 'edit' ? '編輯 Bug' : '新增 Bug'}
      </h1>
      <div className="alert alert-info">
        Day 8 才會實作：{mode === 'edit' ? `編輯 id ${id} 的 Bug` : '新增 Bug 表單'}。
      </div>
    </div>
  );
}

export default BugFormPage;
