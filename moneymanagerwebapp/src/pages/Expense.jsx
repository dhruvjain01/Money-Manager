import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import axiosConfig from '../util/axiosConfig.js';
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Modal from "../components/Modal.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import toast from "react-hot-toast";


const Expense = () => {
    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    const fetchExpenseDetails = async () => {
        if (loading) return;

        try {
        const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSES);
        if (response.status === 200) {
            setExpenseData(response.data);
        }
        } catch (error) {
        toast.error("Failed to Fetch Expense Details");
        }
    };

    const fetchExpenseCategories = async () => {
        try {
        const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("expense"));
        if (response.status === 200) {
            setCategories(response.data);
        }
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to fetch expense categories");
    }
  };

    const handleAddExpense = async (expense) => {
    const { name, amount, date, icon, categoryId } = expense;

    if (!name.trim()) return toast.error("Please enter a name");
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast.error("Amount should be a valid number greater than 0");
    if (!date) return toast.error("Please select a date");

    const today = new Date().toLocaleDateString("en-CA").replace(/\//g, "-");
    if (date > today) return toast.error("Date cannot be in the future");
    if (!categoryId) return toast.error("Please select a category");

    try {
        const response = await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
            name,
            amount: Number(amount),
            date,
            icon,
            categoryId,
        });
        if (response.status === 201) {
            setOpenAddExpenseModal(false);
            toast.success("Expense added successfully");
            fetchExpenseDetails();
            fetchExpenseCategories();
        }
            } catch (error) {
            toast.error(error.response?.data?.error || "Failed to add expense");
        }
    };

    const deleteExpense = async (id) => {
        try {
        await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(id));
        setOpenDeleteAlert({ show: false, data: null });
        toast.success("Expense Deleted Successfully");
        fetchExpenseDetails();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete expense");
        }
    };
    
    const handleDownloadExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD, { responseType: "blob" });
            let fileName = "expense_details.xlsx";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Download expense details successfully");
        } catch (error) {
            console.error('Error downloading expense details: ', error);
            toast.error(error.response?.data?.error || "Failed to download expense");   
        }
    }

    const handleEmailExpenseDetails = async () => {
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.EMAIL_EXPENSE);
            if (response.status === 200) {
                toast.success("Expense details emailed successfully");
            }
        } catch (error) {
            console.error('Error emailing expense details: ', error);
            toast.error(error.response?.data?.error || "Failed to email expense");
        }
    }

  useEffect(() => {
    fetchExpenseDetails();
    fetchExpenseCategories();
  }, []);

  return (
    <Dashboard activeMenu="Expense">
      <div className="my-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Top section: Button + Overview */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
            </div>
                <ExpenseOverview transactions={expenseData} onAddExpense={() => setOpenAddExpenseModal(true)}/>
            </div>

          {/* Expense List */}
          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadExpenseDetails}
            onEmail={handleEmailExpenseDetails}  
          />

          {/* Add Expense Modal */}
          <Modal
            isOpen={openAddExpenseModal}
            onClose={() => setOpenAddExpenseModal(false)}
            title="Add Expense"
          >
            <AddExpenseForm
              onAddExpense={(expense) => {
                handleAddExpense(expense);
              }}
              categories={categories}
            />
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={openDeleteAlert.show}
            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
            title="Delete Expense"
          >
            <DeleteAlert
              content="Are you sure you want to delete this expense?"
              onDelete={() => deleteExpense(openDeleteAlert.data)}
            />
          </Modal>
        </div>
      </div>
    </Dashboard>
  );
}

export default Expense;
