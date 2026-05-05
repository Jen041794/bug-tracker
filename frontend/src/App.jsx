import { Routes, Route, NavLink, Link } from 'react-router-dom';
import BugListPage from './pages/BugListPage';
import BugDetailPage from './pages/BugDetailPage';
import BugFormPage from './pages/BugFormPage';

function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">
            🐛 Bug Tracker
          </Link>
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">
                Bug 列表
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/bugs/new" className="nav-link">
                新增 Bug
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<BugListPage />} />
          <Route path="/bugs/new" element={<BugFormPage mode="create" />} />
          <Route path="/bugs/:id" element={<BugDetailPage />} />
          <Route path="/bugs/:id/edit" element={<BugFormPage mode="edit" />} />
          <Route
            path="*"
            element={
              <div className="alert alert-warning">
                找不到頁面 — <Link to="/">回 Bug 列表</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
