import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh]">
                <div className="relative bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[70vh]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;