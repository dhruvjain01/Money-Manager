import { Coins, Wallet, WalletCards } from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import InfoCard from "../components/InfoCard.jsx";
import { addThousandsSeparator } from "../util/util.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig.js"
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import RecentTrasactions from "../components/RecentTransactions.jsx";
import FinanceOverview from "../components/FinanceOverview.jsx";
import Transactions from "../components/Transactions.jsx";

const Home = () => {

    const navigate = useNavigate();
    const [dashboardData, setDashBoardData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        if (loading) {
            return;
        }

        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DASHBOARD_DATA);
            console.log(response.data);
            if (response.status === 200) {
                setDashBoardData(response.data);
            }
        } catch (error) {
            console.error("Something went wrong ", error);
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
        return () => { };
    }, []);

    return (
        <div>
            <Dashboard activeMenu="Dashboard">
                <div className="my-5 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Display the cards*/}
                        <InfoCard
                            icon={<WalletCards />}
                            label="Total Balance"
                            value={addThousandsSeparator(dashboardData?.["Total Balance"] || 0)}
                            color="bg-purple-800"
                        />
                        <InfoCard
                            icon={<Wallet />}
                            label="Total Income"
                            value={addThousandsSeparator(dashboardData?.["Total Income"] || 0)}
                            color="bg-green-800"
                        />
                        <InfoCard
                            icon={<Coins />}
                            label="Total Expense"
                            value={addThousandsSeparator(dashboardData?.["Total Expense"] || 0)}
                            color="bg-red-800"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Recent transactions */}
                        <RecentTrasactions
                            transactions={dashboardData?.["Recent Transactions"]}
                            onMore={() => navigate("/expense")}
                        />

                        {/* finance overview chart */}
                        <FinanceOverview
                            totalBalance={dashboardData?.["Total Balance"] || 0}
                            totalIncome={dashboardData?.["Total Income"] || 0}
                            totalExpense={dashboardData?.["Total Expense"] || 0}
                        />

                        {/* Expense transactions */}
                        <Transactions
                            transactions={ dashboardData?.["Recent 5 Expenses"]}
                            onMore={ () => navigate("/expense") }
                            type="expense"
                            title="Recent Expenses"
                        />
                        
                        {/* Income transactions */}
                        <Transactions
                            transactions={ dashboardData?.["Recent 5 Incomes"]}
                            onMore={ () => navigate("/income") }
                            type="income"
                            title="Recent Incomes"
                        />
                    </div>
                </div>
            </Dashboard>
        </div>
    )
}

export default Home;