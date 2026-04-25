import { ArrowRight } from "lucide-react";
import TransactionInformationCard from "./TransactionInformationCard.jsx";
import moment from "moment";

const Transactions = ({transactions, onMore, type, title}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <h5 className="text-lg">{title}</h5>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-300 text-black text-sm font-medium rounded-lg shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                    onClick={onMore}>
                    More <ArrowRight className="text-base" size={15} />
                </button>
            </div>
            <div className="mt-6">
                {transactions?.slice(0, 5)?.map(item => (
                    <TransactionInformationCard
                        key={item.id}
                        title={item.name}
                        icon={item.icon}
                        date={moment(item.date).format("Do MMM YYYY")}
                        amount={item.amount}
                        type={type}
                        hideDeleteBtn
                    />
                ))}
            </div>
        </div>
    )
}

export default Transactions;