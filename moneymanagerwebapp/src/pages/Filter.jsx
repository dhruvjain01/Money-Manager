import { Search } from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import { useState } from "react";
import axiosConfig from "../util/axiosConfig.js"
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import TransactionInformationCard from "../components/TransactionInformationCard.jsx"
import moment from "moment";

const Filter = () => {
    const [type, setType] = useState("income");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [keyword, setKeyword] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("asc");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.APPLY_FILTERS, {
                type,
                startDate,
                endDate,
                keyword,
                sortField,
                sortOrder
            });
            // attach the type to each transaction so it won't change later
            const transactionsWithType = response.data.map(t => ({
                ...t,
                type
            }));
            setTransactions(transactionsWithType);
        } catch (error) {
            console.log("Failed to fetch transactions", error);
            toast.error(error.response?.data?.error || "Failed to fetch Transactions. Please try again");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dashboard activeMenu="Filters">
            <div className="my-5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Filter Transactions</h2>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h5 className="text-lg font-semibold text-gray-900">Select the Filters</h5>
                    </div>

                    <form className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">Type</label>
                            <select
                                value={type}
                                id="type"
                                className="w-full bg-transparent outline-none border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="startdate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                value={startDate}
                                id="startdate"
                                type="date"
                                className="w-full bg-transparent outline-none border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="enddate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                value={endDate}
                                id="enddate"
                                type="date"
                                className="w-full bg-transparent outline-none border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="sortField" className="block text-sm font-medium text-gray-700 mb-1">Sort Field</label>
                            <select
                                value={sortField}
                                id="sortField"
                                className="w-full bg-transparent outline-none border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                onChange={e => setSortField(e.target.value)}
                            >
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                                <option value="name">Name</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="sortorder" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <select
                                value={sortOrder}
                                id="sortorder"
                                className="w-full bg-transparent outline-none border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                onChange={e => setSortOrder(e.target.value)}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>

                        <div className="sm:col-span-1 md:col-span-1 flex items-end gap-1">
                            <div className="w-full">
                                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <input
                                    value={keyword}
                                    id="keyword"
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-transparent outline-none border border-gray-300 rounded-md py-2 px-3 text-gray-700 leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    onChange={e => setKeyword(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-purple-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 active:scale-95 transition-all cursor-pointer"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h5 className="text-lg font-semibold text-gray-900">Transactions</h5>
                    </div>
                    {transactions.length === 0 && !loading ? (
                        <p className="text-gray-500">Select the filters and click apply to filter the transactions</p>
                    ) : ""}
                    {loading ? (
                        <p className="text-gray-500">Loading transactions</p>
                    ) : ""}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-5">
                        {transactions.map((transaction, index) => (
                            <TransactionInformationCard
                                key={transaction.id}
                                title={transaction.name}
                                icon={transaction.icon}
                                date={moment(transaction.date).format("Do MMM YYYY")}
                                amount={transaction.amount}
                                type={transaction.type}
                                hideDeleteBtn
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default Filter;
