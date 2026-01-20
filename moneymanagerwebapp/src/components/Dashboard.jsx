import { useContext } from "react";
import MenuBar from "./MenuBar.jsx";
import Sidebar from "./SideBar.jsx";
import { AppContext } from "../context/AppContext.jsx";

const Dashboard = ({ children, activeMenu }) => {
    const { user } = useContext(AppContext);

    return (
        <div>
            <MenuBar activeMenu={ activeMenu } />
            <div className="flex">
                <div className="max- [1080px] :hidden">
                    <Sidebar activeMenu={ activeMenu }/>
                </div>
                <div className="grow mx-5">{ children }</div>
            </div>
        </div>
    )
}

export default Dashboard;