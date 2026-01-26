import imagekit from "../config/imagekit.js";

const uploadToImageKit = async (file, folder = "employees") => {
  try {
    if (!file || !file.buffer) {
      console.log("❌ NO FILE BUFFER RECEIVED");
      return "";
    }

    const result = await imagekit.upload({
      file: file.buffer, // 🔥 required
      fileName: `${Date.now()}-${file.originalname}`,
      folder,
    });

    return result.url;
  } catch (error) {
    console.error("❌ IMAGEKIT UPLOAD ERROR");
    console.error(error);
    throw new Error("Image upload failed");
  }
};

export default uploadToImageKit;
