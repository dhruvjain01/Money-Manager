import EmojiPicker from "emoji-picker-react";
import { Image, X } from "lucide-react";
import { useState } from "react";

const EmojiPickerPopup = ({icon, onSelect}) => {
    const [isOpen, setIsOpen] = useState(false); 
    
    const handleEmojiClick = (emoji) => {
        onSelect(emoji?.imageUrl || "");
        setIsOpen(false);
    }

    return (
        <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
            <div
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-4 cursor-pointer p-3 rounded-lg border border-blue-300 hover:border-purple-800 hover:bg-purple-50/50 transition-all duration-200 ease-in-out">
                <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-purple-500 rounded-lg border border-purple-100">
                    {icon ? (
                        <img src={icon} alt="Icon" className="w-10 h-10 object-contain" />
                    ) : (
                        <Image className="w-6 h-6"/>
                    )}
                </div>
                <p>{icon ? "Change icon" : "Pick Icon"}</p>
            </div>
            {isOpen && (
                <div className="relative inline-block">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute -top-3 -right-3 z-10 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                        <X className="w-4 h-4 text-gray-600 cursor-pointer"/>
                    </button>
                    <div className="relative z-0">
                        <EmojiPicker
                            open={isOpen}
                            height={400}
                            width={360}
                            onEmojiClick={handleEmojiClick}
                        />    
                    </div>
                </div>
            )}
        </div>
    
    )
}

export default EmojiPickerPopup;