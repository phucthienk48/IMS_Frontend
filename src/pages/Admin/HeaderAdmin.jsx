import { Link } from "react-router-dom";

function HeaderAdmin() {
  return (
    <header
      className="shadow-sm"
      style={{
        background: "#0f172a",
        color: "#fff",
      }}
    >
      <div className="container d-flex justify-content-between align-items-center py-3">

        {/* Logo */}
        <div>
          <h3 className="m-0 fw-bold">
            IMS Admin
          </h3>
          <small>Internship Management System</small>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="d-flex list-unstyled m-0 gap-4 align-items-center">

            <li>
              <Link
                to="/admin/dashboard"
                className="text-white text-decoration-none"
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/admin/students"
                className="text-white text-decoration-none"
              >
                Students
              </Link>
            </li>

            <li>
              <Link
                to="/admin/internships"
                className="text-white text-decoration-none"
              >
                Internships
              </Link>
            </li>

            <li>
              <button className="btn btn-danger btn-sm">
                Logout
              </button>
            </li>

          </ul>
        </nav>

      </div>
    </header>
  );
}

export default HeaderAdmin;