function Dashboard() {
  return (
    <div>

      <h2 className="fw-bold mb-4">
        Admin Dashboard
      </h2>

      <div className="row g-4">

        {/* Card 1 */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5>Total Students</h5>

              <h2 className="fw-bold text-primary">
                120
              </h2>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5>Internship Requests</h5>

              <h2 className="fw-bold text-success">
                45
              </h2>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5>Approved Students</h5>

              <h2 className="fw-bold text-danger">
                32
              </h2>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;