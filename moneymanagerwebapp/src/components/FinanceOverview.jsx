import { addThousandsSeparator } from "../util/util.js";
import CustomPieChart from "./CustomPieChart.jsx"

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
    const COLORS = ["#59168B", "#a0090e", "#016630"];

    const balanceData = [
        { name: "Total Balance", amount: totalBalance },
        { name: "Total Income", amount: totalIncome },
        { name: "Total Expenses", amount: totalExpense },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">Financial Overview</h5>
            </div>
            <CustomPieChart
                data={balanceData}
                label="Total Balance"
                totalAmount={`₹${addThousandsSeparator(totalBalance)}`}
            colors={COLORS}
            showTextAnchor
            />
        </div>
    )
}

export default FinanceOverview;