function Header() {
  return (
    <header className="bg-primary text-white shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">
        
        {/* Logo + Title */}
        <div>
          <h3 className="m-0 fw-bold">
            IMS
          </h3>
          <small>Internship Management System</small>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="d-flex list-unstyled m-0 gap-4">
            <li>
              <a href="#" className="text-white text-decoration-none">
                Home
              </a>
            </li>

            <li>
              <a href="#" className="text-white text-decoration-none">
                Students
              </a>
            </li>

            <li>
              <a href="#" className="text-white text-decoration-none">
                Internship
              </a>
            </li>

            <li>
              <a href="#" className="text-white text-decoration-none">
                Login
              </a>
            </li>
          </ul>
        </nav>

      </div>
    </header>
  );
}

export default Header;