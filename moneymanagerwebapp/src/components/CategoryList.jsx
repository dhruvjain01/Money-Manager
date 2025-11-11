import { Layers2, Pencil } from "lucide-react";

const CategoryList = ({categories, onEditCategory}) => {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Category Sources</h4>
            </div>
            {categories.length === 0 ? (
                <p className="text-gray-500 text-sm">
                    No categories added yet. Add some to get started!
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                            <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full shadow-sm">
                                {category.icon ? (
                                    <img src={category.icon} alt={category.name} className="h-6 w-6" />
                                ) : (
                                    <Layers2 className="text-purple-700" size={22} />
                                )}
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {category.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">
                                        {category.type}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onEditCategory(category)}
                                    className="text-gray-400 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Pencil size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CategoryList;