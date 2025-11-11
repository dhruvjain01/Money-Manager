import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const UPLOAD_PRESET_NAME = "MoneyManager";

const uploadProfileImage = async (image) => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", UPLOAD_PRESET_NAME);

  try {
    const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Cloudinary upload failed: ${data.error?.message || response.statusText}`
      );
    }

    console.log("Image uploaded successfully.", data);
    return data.secure_url;
  } catch (error) {
    console.error("Error Uploading the Image", error);
    throw error;
  }
};

export default uploadProfileImage;
