import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function UserLayout() {
  return (
    <div className="ims-layout">
      <Header />
      <main className="ims-main">
        <div className="ims-page">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
