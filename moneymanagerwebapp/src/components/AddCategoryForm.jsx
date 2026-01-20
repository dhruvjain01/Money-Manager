import { useEffect, useState } from "react";
import Input from "../components/Input.jsx";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import { LoaderCircle, LoaderIcon } from "lucide-react";

const AddCategoryForm = ({onAddCategory, initialCategoryData, isEditing}) => {
    const [category, setCategory] = useState({
        name: "",
        type: "income",
        icon: ""
    })

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing && initialCategoryData) {
            setCategory(initialCategoryData);
        }
        else {
            setCategory({ name: "", type: "income", icon: "" });
        }
    }, [isEditing, initialCategoryData]);

    const categoryTypeOptions = [
        { value: "income", label: "Income" },
        { value: "expense", label: "Expense" }
    ]

    const handleChange = (key,value) => {
        setCategory({ ...category, [key]: value });
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onAddCategory(category);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="p-4 space-y-5">
            <EmojiPickerPopup
                icon={category.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />
            <Input
                value={category.name}
                onChange={({ target }) => handleChange("name", target.value)}
                label="Category Name"
                placeholder="e.g., Freelance, Salary, Groceries"
                type="text"
            />
            <Input
                Label="Category Type"
                value={category.type}
                onChange={({ target }) => handleChange("type", target.value)}
                isSelect={true}
                options={categoryTypeOptions}
            />
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white text-sm font-medium rounded-lg shadow hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                    {loading ? (
                        <>
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            {isEditing ? "Updating..." : "Adding..."}
                        </>
                    ) : (
                        <>{isEditing ? "Update Category" : "Add Category"}</>
                    )}
                </button>
            </div>
        </div>
    );
}

export default AddCategoryForm;