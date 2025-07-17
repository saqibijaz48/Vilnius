import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full min-h-screen">
        <Outlet />
      </main>
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;
