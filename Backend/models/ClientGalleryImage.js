import mongoose from "mongoose";

export const GALLERY_CAPTION_MAX = 200;

// Images an admin uploads for a specific client (ImageKit folder "client-gallery").
const clientGalleryImageSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    url: { type: String, required: true },
    fileId: { type: String, default: null },
    filePath: { type: String, default: null },
    caption: { type: String, default: "", trim: true, maxlength: GALLERY_CAPTION_MAX },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("ClientGalleryImage", clientGalleryImageSchema);
