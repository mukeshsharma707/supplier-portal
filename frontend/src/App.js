import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewQuery from "./pages/NewQuery";
import QueryList from "./pages/QueryList";
import QueryDetail from "./pages/QueryDetail";

function App() {
  return (
    <BrowserRouter>
      <header className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Supplier Portal</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/queries">Queries</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/new-query">New Query</Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-query" element={<NewQuery />} />
          <Route path="/queries" element={<QueryList />} />
          <Route path="/query/:id" element={<QueryDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;