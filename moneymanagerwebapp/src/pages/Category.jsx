import { Plus } from "lucide-react";
import Dashboard from "../components/Dashboard.jsx";
import CategoryList from "../components/CategoryList.jsx";
import { useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig.js"
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import AddCategoryForm from "../components/AddCategoryForm.jsx";

const Category = ({children}) => {

    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [openAddCategoryModel, setOpenAddCategoryModel] = useState(false);
    const [openEditCategoryModel, setEditOpenCategoryModel] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(false);

    const fetchCategoriesDetails = async () => {
        if (loading) {
            return;
        }
        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
            if (response.status === 200) {
                console.log('categories', response.data);
                setCategoryData(response.data);
            }
        } catch (error) {
            console.error("Something went wrong. Please try again", error);
            // toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoriesDetails();
    }, []);

    const handleAddCategory = async (category) => {
        const { name, type, icon } = category;

        if (!name.trim()) {
            toast.error("Category name is required");
            return;
        }

        const isDuplicate = categoryData.some((category) => {
            return category.name.toLowerCase() === name.trim().toLowerCase();
        })

        if (isDuplicate) {
            toast.error("Category Already Exists");
            return;
        }

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ADD_CATEGORIES, { name, type, icon });
            if (response.status === 201) {
                toast.success("Category added successfully");
                setOpenAddCategoryModel(false);
                fetchCategoriesDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed To Add Category");
            console.error("Error occured  : ",error);
        }
    }

    const handleEditcategory = (categoryToEdit) => {
        setSelectedCategory(categoryToEdit);
        setEditOpenCategoryModel(true);
    }

    const handleUpdatecategory = async (updatedcategory) => {
        const { id, name, type, icon } = updatedcategory;
        if (!name.trim()) {
            toast.error("Category Name is required");
            return;
        }
        if (!id) {
            toast.error("Category ID is missing for update");
            return;
        }

        try {
            await axiosConfig.put(API_ENDPOINTS.UPDATE_CATEGORY(id), { name, type, icon });
            setEditOpenCategoryModel(false);
            setSelectedCategory(null);
            toast.success("Category Updated Successfully");
            fetchCategoriesDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Update the Category");
        }
    }

    return (
        <div>
            <Dashboard activeMenu="Category">
                <div className="my-5 mx-auto">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-semibold">All Categories</h2>
                        <button
                            onClick={()=>setOpenAddCategoryModel(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-purple-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-puprle-600 focus:ring-offset-1 active:scale-95 transition-all cursor-pointer">
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>


                    {/* Category list */}
                    <CategoryList categories={categoryData} onEditCategory={handleEditcategory}/>



                    {/* Adding category modal*/}
                    <Modal
                        isOpen={openAddCategoryModel}
                        onClose={()=>setOpenAddCategoryModel(false)}
                        title="Add Category"
                    >
                        <div className="max-h-[60vh] overflow-y-auto">
                            <AddCategoryForm onAddCategory={ handleAddCategory } />
                        </div>
                    </Modal>
                    {/* Updating category modal*/}
                    <Modal
                        isOpen={openEditCategoryModel}
                        onClose={() => {
                            setEditOpenCategoryModel(false)
                            setSelectedCategory(null)
                        }}
                        title="Update Category"
                    >
                        <AddCategoryForm
                            initialCategoryData = {selectedCategory}
                            onAddCategory={handleUpdatecategory}
                            isEditing = {true}
                        />
                    </Modal>


                </div>
            </Dashboard>
        </div>
    )
}

export default Category;