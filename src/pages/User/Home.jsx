function Home() {
  return (
    <div>

      {/* Hero Section */}
      <div
        className="p-5 rounded shadow-sm mb-5"
        style={{
          background: "linear-gradient(to right, #0ea5e9, #2563eb)",
          color: "#fff",
        }}
      >
        <div className="row align-items-center">

          <div className="col-md-7">
            <h1 className="fw-bold mb-3">
              Internship Management System
            </h1>

            <p className="fs-5">
              Manage internship applications, student information,
              and internship progress efficiently.
            </p>

            <button className="btn btn-light btn-lg mt-3">
              Get Started
            </button>
          </div>

          <div className="col-md-5 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
              alt="IMS"
              style={{
                width: "250px",
              }}
            />
          </div>

        </div>
      </div>

      {/* Features */}
      <div className="mb-5">

        <h2 className="fw-bold mb-4 text-center">
          Main Features
        </h2>

        <div className="row g-4">

          {/* Feature 1 */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <h4 className="fw-bold mb-3">
                  Student Management
                </h4>

                <p>
                  Manage student profiles, internship requests,
                  and academic information.
                </p>

              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <h4 className="fw-bold mb-3">
                  Internship Tracking
                </h4>

                <p>
                  Monitor internship progress, approvals,
                  and reports in real time.
                </p>

              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">

                <h4 className="fw-bold mb-3">
                  Secure Document Upload
                </h4>

                <p>
                  Upload CV, transcript, and citizen ID documents
                  securely and quickly.
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-5">

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h2 className="fw-bold text-primary">500+</h2>
              <p>Students</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h2 className="fw-bold text-success">120+</h2>
              <p>Companies</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h2 className="fw-bold text-danger">300+</h2>
              <p>Internships</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body">
              <h2 className="fw-bold text-warning">95%</h2>
              <p>Success Rate</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Intro */}
      <div
        className="text-center p-4 rounded shadow-sm"
        style={{
          background: "#e0f2fe",
        }}
      >
        <h3 className="fw-bold">
          Start Your Internship Journey Today
        </h3>

        <p className="mb-0">
          IMS helps students and administrators manage internships
          more effectively and professionally.
        </p>
      </div>

    </div>
  );
}

export default Home;