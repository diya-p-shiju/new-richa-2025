import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";


const Layout: React.FC  = () => {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/login");
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Outlet />
      </div>
  )
};

export default Layout;