import { Download, LoaderCircle, Mail } from "lucide-react";
import TransactionInformationCard from "./TransactionInformationCard";
import moment from "moment";
import { useState } from "react";

const ExpenseList = ({ transactions, onDelete, onDownload, onEmail }) => {
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingDownload, setLoadingDownload] = useState(false);
    
    const handleEmail = async () => {
        setLoadingEmail(true);
        try {
            await onEmail();
        }
        finally {
            setLoadingEmail(false);
        }
    }

    const handleDownload = async () => {
        setLoadingDownload(true);
        try {
            await onDownload();
        }
        finally {
            setLoadingDownload(false);
        }
    }
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h5 className="text-lg font-semibold text-gray-800 tracking-tight">
                Expense Sources
                </h5>
                <div className="flex items-center justify-end gap-3">
                <button
                    disabled={loadingEmail}
                    onClick={handleEmail}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 cursor-pointer">
                    {loadingEmail ? (
                        <>
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Emailing...
                        </>
                    ) : (
                        <>
                            <Mail size={18} className="text-purple-700" />  Email
                        </>
                    )}
                </button>
                <button
                    disabled={loadingDownload}
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 cursor-pointer">
                    {loadingDownload ? (
                        <>
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download size={18} className="text-purple-700" />  Download
                        </>
                    )}
                </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {/* display the expenses */}
                {transactions?.map((expense) => (
                <TransactionInformationCard
                    key={expense.id}
                    title={expense.name}
                    icon={expense.icon}
                    date={moment(expense.date).format("Do MMM YYYY")}
                    amount={expense.amount}
                    type="expense"
                    onDelete={() => {
                    onDelete(expense.id);
                    }}
                />
                ))}
            </div>
        </div>
    )
}

export default ExpenseList;