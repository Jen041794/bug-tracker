import { useParams } from 'react-router-dom';

function BugDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="h3 mb-3">Bug 詳情</h1>
      <div className="alert alert-info">
        Day 7 才會實作：依 id <code>{id}</code> 顯示單筆 Bug。
      </div>
    </div>
  );
}

export default BugDetailPage;
