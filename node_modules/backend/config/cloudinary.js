import { v2 as cloudinary } from "cloudinary";
export const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured:", {
    cloud_name: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: Boolean(process.env.CLOUDINARY_API_KEY),
    api_secret: Boolean(process.env.CLOUDINARY_API_SECRET),
  });
};
