import { Outlet } from "react-router-dom";
import HeaderLecturer from "../components/HeaderLecturer";
import Footer from "../components/Footer";

export default function LecturerLayout() {
  return (
    <div className="ims-layout">
      <HeaderLecturer />
      <main className="ims-main">
        <div className="ims-page">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
