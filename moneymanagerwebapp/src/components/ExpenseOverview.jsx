import { useEffect, useState } from "react";
import CustomLineChartData from "./CustomLineChartData.jsx";
import { prepareExpenseLineChartData } from "../util/util.js";
import { Plus } from "lucide-react";

const ExpenseOverview = ({ transactions, onAddExpense }) => {
    const [chartData, setChartData] = useState([]);
    useEffect(() => {
        const result = prepareExpenseLineChartData(transactions);
        // console.log(result);
        setChartData(result);

        return () => { };
    }, [transactions]);

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-lg">
                        Expense Overview
                    </h5>
                    <p className="text-xs text-gray-400 mt-0 5">
                        Track your spendings over time and analyze your expense trends.
                    </p>
                </div>
                <button
                onClick={onAddExpense}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white text-sm font-medium rounded-lg shadow-md hover:bg-purple-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={18} /> Add Expense
              </button>
            </div>
            <div className="mt-10">
                <CustomLineChartData data={chartData}/>
            </div>
        </div>
    )
}

export default ExpenseOverview;