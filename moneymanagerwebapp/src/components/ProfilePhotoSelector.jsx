import { useRef, useState } from "react";
import { Upload, User, Trash } from "lucide-react";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onChooseFile = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex justify-center mb-4">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <div
          className="relative w-[68px] h-[68px] flex items-center justify-center 
                     bg-purple-100 rounded-full border border-purple-200 shadow-md
                     hover:shadow-lg transition-shadow"
          title="Click the button to upload profile photo"
        >
          <User className="text-purple-500" size={28} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent double trigger
              onChooseFile();
            }}
            className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center 
                       bg-indigo-600 text-white rounded-full shadow 
                       hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Upload size={12} />
          </button>
        </div>
      ) : (
        <div className="relative w-[68px] h-[68px]">
          <img
            src={previewUrl}
            alt="profile"
            className="w-[68px] h-[68px] rounded-full object-cover border border-gray-300 shadow-md"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Avoid bubbling
              handleRemoveImage();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center 
                       bg-red-600 text-white rounded-full shadow 
                       hover:bg-red-700 transition-colors cursor-pointer"
            title="Remove photo"
          >
            <Trash size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
