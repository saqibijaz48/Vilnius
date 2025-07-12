import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  console.log(location.pathname, isAuthenticated);

  // Redirect to home page by default
  if (location.pathname === "/") {
    return <Navigate to="/shop/home" />;
  }

  // Protected admin routes - require authentication and admin role
  if (location.pathname.includes("/admin")) {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    }
    if (user?.role !== "admin") {
      return <Navigate to="/unauth-page" />;
    }
  }

  // Protected checkout route - require authentication
  if (location.pathname.includes("/checkout") && !isAuthenticated) {
    // Store the intended destination for redirect after login
    sessionStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/auth/login" />;
  }

  // Protected account routes - require authentication
  if (location.pathname.includes("/shop/account") && !isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    // Check if there's a redirect destination
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    if (redirectPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      return <Navigate to={redirectPath} />;
    }
    
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/shop/home" />;
    }
  }

  // Prevent admin users from accessing shop routes (except public ones)
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("/shop") &&
    !location.pathname.includes("/shop/home") &&
    !location.pathname.includes("/shop/listing") &&
    !location.pathname.includes("/shop/search")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;