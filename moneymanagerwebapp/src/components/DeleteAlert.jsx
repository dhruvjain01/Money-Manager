import { LoaderCircle } from "lucide-react";
import { useState } from "react";

const DeleteAlert = ({ content, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const handleDelete = async () => {
        setLoading(true);
        try {
            await onDelete();
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <p className="text-sm">{content}</p>
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-purple-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-puprle-600 focus:ring-offset-1 active:scale-95 transition-all cursor-pointer">
                    {loading ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animated-spin" />
                            Deleting...
                        </>
                    ) : (
                        <>
                            Delete
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default DeleteAlert;