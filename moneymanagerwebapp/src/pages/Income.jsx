import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard.jsx";
import axiosConfig from "../util/axiosConfig.js";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import IncomeList from "../components/IncomeList.jsx";
import Modal from "../components/Modal.jsx";
import AddIncomeForm from "../components/AddIncomeForm.jsx";
import toast from "react-hot-toast";
import DeleteAlert from "../components/DeleteAlert.jsx";
import IncomeOverview from "../components/IncomeOverview.jsx";

const Income = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  const fetchIncomeDetails = async () => {
    if (loading) return;

    try {
      const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOMES);
      if (response.status === 200) {
        setIncomeData(response.data);
      }
    } catch (error) {
      toast.error("Failed to Fetch Income Details");
    }
  };

  const fetchIncomeCategories = async () => {
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("income"));
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error(error.data?.message || "Failed to fetch income categories");
    }
  };

  const handleAddIncome = async (income) => {
    const { name, amount, date, icon, categoryId } = income;

    if (!name.trim()) return toast.error("Please enter a name");
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast.error("Amount should be a valid number greater than 0");
    if (!date) return toast.error("Please select a date");

    const today = new Date().toLocaleDateString("en-CA").replace(/\//g, "-");
    if (date > today) return toast.error("Date cannot be in the future");
    if (!categoryId) return toast.error("Please select a category");

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
        name,
        amount: Number(amount),
        date,
        icon,
        categoryId,
      });
      if (response.status === 201) {
        setOpenAddIncomeModal(false);
        toast.success("Income added successfully");
        fetchIncomeDetails();
        fetchIncomeCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add income");
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income Deleted Successfully");
      fetchIncomeDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete income");
    }
  };
    
    const handleDownloadIncomeDetails = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD, { responseType: "blob" });
            let fileName = "income_details.xlsx";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Download income details successfully");
        } catch (error) {
            console.error('Error downloading income details: ', error);
            toast.error(error.response?.data?.message || "Failed to download income");   
        }
    }

    const handleEmailIncomeDetails = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_INCOME);
            if (response.status === 200) {
                toast.success("Income details emailed successfully");
            }
        } catch (error) {
            console.error('Error emailing income details: ', error);
            toast.error(error.response?.data?.message || "Failed to email income");
        }
    }

  useEffect(() => {
    fetchIncomeDetails();
    fetchIncomeCategories();
  }, []);

  return (
    <Dashboard activeMenu="Income">
      <div className="my-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Top section: Button + Overview */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
            </div>
                <IncomeOverview transactions={incomeData} onAddIncome={() => setOpenAddIncomeModal(true)}/>
            </div>

          {/* Income List */}
          <IncomeList
            transactions={incomeData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadIncomeDetails}
            onEmail={handleEmailIncomeDetails}  
          />

          {/* Add Income Modal */}
          <Modal
            isOpen={openAddIncomeModal}
            onClose={() => setOpenAddIncomeModal(false)}
            title="Add Income"
          >
            <AddIncomeForm
              onAddIncome={(income) => {
                handleAddIncome(income);
              }}
              categories={categories}
            />
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={openDeleteAlert.show}
            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
            title="Delete Income"
          >
            <DeleteAlert
              content="Are you sure you want to delete this income?"
              onDelete={() => deleteIncome(openDeleteAlert.data)}
            />
          </Modal>
        </div>
      </div>
    </Dashboard>
  );
};

export default Income;
