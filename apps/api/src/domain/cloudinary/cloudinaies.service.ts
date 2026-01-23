import cloudinary from "../../../lib/cloudinary";

export const cloudinaryService = {
  upload: async (file: File) => {
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "uploads",
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  },

  deleteByUrl: async (url: string) => {
    // ตรวจสอบว่าเป็น Cloudinary URL หรือไม่
    if (!url.includes("cloudinary.com")) {
      return {
        message: "Invalid Cloudinary URL",
        type: "INVALID_URL",
      };
    }
    // แยกส่วนของ URL
    const parts = url.split("/upload/");
    if (parts.length !== 2) {
      return {
        message: "Invalid Cloudinary URL format",
        type: "INVALID_URL_FORMAT",
      };
    }
    // แยก version และ public_id
    const afterUpload = parts[1];
    const matches = afterUpload.match(/v\d+\/(.*?)(?:\.[^.]*)?$/);
    if (!matches || !matches[1]) {
      return {
        message: "Could not extract public_id from URL",
        type: "INVALID_URL_FORMAT",
      };
    }
    const public_id = matches[1];
    // ลบรูปภาพทันที
    const result = await cloudinary.uploader.destroy(public_id);
    if (result.result === "ok") {
      return {
        message: "Delete successful",
        public_id: public_id,
      };
    } else {
      return {
        message: "Image not found or already deleted",
        type: "NOT_FOUND",
      };
    }
  },
};
