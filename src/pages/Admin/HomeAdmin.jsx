function HomeAdmin() {
  return (
    <div>

      {/* Welcome Section */}
      <div
        className="p-5 rounded shadow-sm mb-5"
        style={{
          background: "linear-gradient(to right, #0f172a, #1e293b)",
          color: "#fff",
        }}
      >
        <div className="row align-items-center">

          <div className="col-md-8">
            <h1 className="fw-bold mb-3">
              Welcome Admin
            </h1>

            <p className="fs-5">
              Manage internship students, applications,
              approvals, and internship progress efficiently.
            </p>

            <button className="btn btn-light btn-lg mt-3">
              Manage System
            </button>
          </div>

          <div className="col-md-4 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2620/2620277.png"
              alt="Admin"
              style={{
                width: "220px",
              }}
            />
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-5">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">

              <h5>Total Students</h5>

              <h2 className="fw-bold text-primary">
                520
              </h2>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">

              <h5>Internship Requests</h5>

              <h2 className="fw-bold text-success">
                140
              </h2>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">

              <h5>Approved Students</h5>

              <h2 className="fw-bold text-danger">
                100
              </h2>

            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">

              <h5>Partner Companies</h5>

              <h2 className="fw-bold text-warning">
                45
              </h2>

            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mb-5">

        <h3 className="fw-bold mb-4">
          Quick Actions
        </h3>

        <div className="row g-4">

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <h5 className="fw-bold">
                  Manage Students
                </h5>

                <p>
                  View and manage all student information,
                  internship applications, and status.
                </p>

                <button className="btn btn-primary">
                  View Students
                </button>

              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <h5 className="fw-bold">
                  Internship Requests
                </h5>

                <p>
                  Review and approve internship registration
                  requests from students.
                </p>

                <button className="btn btn-success">
                  Review Requests
                </button>

              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">

                <h5 className="fw-bold">
                  Reports & Statistics
                </h5>

                <p>
                  Analyze internship progress and generate
                  system reports easily.
                </p>

                <button className="btn btn-dark">
                  View Reports
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity */}
      <div>

        <h3 className="fw-bold mb-4">
          Recent Activities
        </h3>

        <div className="card border-0 shadow-sm">
          <div className="card-body">

            <ul className="list-group list-group-flush">

              <li className="list-group-item">
                Student Nguyen Van A submitted internship request.
              </li>

              <li className="list-group-item">
                Internship application approved for Tran Thi B.
              </li>

              <li className="list-group-item">
                New company added to internship partner list.
              </li>

              <li className="list-group-item">
                Internship progress updated by lecturer.
              </li>

            </ul>

          </div>
        </div>

      </div>

    </div>
  );
}

export default HomeAdmin;