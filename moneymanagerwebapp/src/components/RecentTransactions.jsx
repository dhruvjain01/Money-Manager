import { ArrowRight } from "lucide-react";
import TransactionInfoCard from "../components/TransactionInformationCard.jsx"
import moment from "moment";

const RecentTrasactions = ({transactions,onMore}) => {

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <h4 className="text-lg">Recent Transactions</h4>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-300 text-black text-sm font-medium rounded-lg shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                    onClick={onMore}>
                    More <ArrowRight className="text-base" size={15}/>
                </button>
            </div>
            <div>
                <div className="mt-6">
                    {transactions?.slice(0, 5)?.map(item => (
                        <TransactionInfoCard
                            key={item.id}
                            title={item.name}
                            icon={item.icon}
                            date={moment(item.date).format("Do MMM YYYY")}
                            amount={item.amount}
                            type={item.type}
                            hideDeleteBtn
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RecentTrasactions;