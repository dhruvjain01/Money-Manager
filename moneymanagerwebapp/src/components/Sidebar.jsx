import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { SIDE_BAR_DATA } from "../assets/assets.js";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({activeMenu}) => {
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px]">
      
      {/* Profile section */}
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 shadow">
            <User className="w-10 h-10 text-purple-500" />
          </div>
        )}
        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ""}
        </h5>
      </div>

      {/* Menu items */}
      {SIDE_BAR_DATA.map((item, index) => (
        <button onClick={()=>navigate(item.path)}
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 
                     text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors cursor-pointer ${activeMenu == item.label ? "text-white bg-purple-800" : ""}`}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
