import { UploadIcon, XIcon } from "@phosphor-icons/react";
import React, { RefObject, useState } from "react";
import { toast } from "sonner";

interface FileDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleBoxClick: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (files: FileList | null) => void;
  uploadedFiles?: File[];
  onRemoveFile?: (filename: string) => void;
  mode?: "multiple" | "single";
  label?: string;
}

export function FileDropzone({
  label = "อัพโหลดรูปภาพ",
  fileInputRef,
  handleBoxClick,
  handleDragOver,
  handleDrop,
  handleFileSelect,
  uploadedFiles = [],
  onRemoveFile,
  mode = "multiple",
}: FileDropzoneProps) {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  // Generate preview URLs for image files
  React.useEffect(() => {
    uploadedFiles.forEach((file) => {
      if (file.type.startsWith("image/") && !previewUrls[file.name]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls((prev) => ({
            ...prev,
            [file.name]: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    });

    // Cleanup preview URLs for removed files
    const currentFileNames = new Set(uploadedFiles.map((f) => f.name));
    setPreviewUrls((prev) => {
      const newUrls: Record<string, string> = {};
      Object.keys(prev).forEach((name) => {
        if (currentFileNames.has(name)) {
          newUrls[name] = prev[name];
        } else {
          // Revoke object URL to free memory
          if (prev[name].startsWith("blob:")) {
            URL.revokeObjectURL(prev[name]);
          }
        }
      });
      return newUrls;
    });
  }, [uploadedFiles]);

  const handleRemove = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFile) {
      onRemoveFile(filename);
    }
    // Clean up preview URL
    if (previewUrls[filename]) {
      if (previewUrls[filename].startsWith("blob:")) {
        URL.revokeObjectURL(previewUrls[filename]);
      }
      setPreviewUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[filename];
        return newUrls;
      });
    }
  };

  // ตรวจสอบไฟล์
  const validateFile = (file: File): string | null => {
    // ตรวจสอบประเภทไฟล์ (jpeg, png เท่านั้น)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "รองรับเฉพาะไฟล์ JPEG และ PNG เท่านั้น";
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 4MB)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxSize) {
      return "ขนาดไฟล์ไม่เกิน 4MB";
    }

    return null;
  };

  // Wrapper function to handle file selection based on mode
  const handleFileSelectWrapper = (files: FileList | null) => {
    if (!files || files.length === 0) {
      handleFileSelect(null);
      return;
    }

    // ตรวจสอบจำนวนไฟล์ใน single mode
    if (mode === "single" && files.length > 1) {
      toast.error("ไม่สามารถอัพโหลดได้มากกว่า 1 รูป", {
        description: "กรุณาเลือกไฟล์เดียวเท่านั้น",
        position: "bottom-right",
      });
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // ตรวจสอบไฟล์ทั้งหมด
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // แสดง toast สำหรับไฟล์ที่ไม่ถูกต้อง
    if (invalidFiles.length > 0) {
      invalidFiles.forEach((error) => {
        toast.error("ไม่สามารถอัพโหลดไฟล์", {
          description: error,
          position: "bottom-right",
        });
      });
    }

    // ถ้ามีไฟล์ที่ถูกต้อง ให้ส่งต่อไป
    if (validFiles.length > 0) {
      if (mode === "single") {
        // ใน single mode ให้ส่งแค่ไฟล์แรก
        const singleFile = validFiles[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(singleFile);
        handleFileSelect(dataTransfer.files);
      } else {
        // ใน multiple mode ส่งไฟล์ทั้งหมดที่ถูกต้อง
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => {
          dataTransfer.items.add(file);
        });
        handleFileSelect(dataTransfer.files);
      }
    }
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    e.preventDefault();
    // จัดการไฟล์ตาม mode
    handleFileSelectWrapper(e.dataTransfer.files);
  };

  return (
    <div className="px-2">
      <div
        className="border-2 border-dashed border-border rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer"
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDrop={handleDropWrapper}
      >
        <div className="mb-2 bg-muted rounded-full p-3">
          <UploadIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-normal tracking-widest text-foreground">
          {label}
        </p>
        <p className="text-sm font-normal tracking-widest text-muted-foreground mt-1">
          หรือ,{" "}
          <label
            htmlFor="fileUpload"
            className="text-primary font-normal tracking-widest hover:text-primary/90  cursor-pointer"
            onClick={(e) => e.stopPropagation()} // Prevent triggering handleBoxClick
          >
            คลิกเพื่อเลือก
          </label>{" "}
          (ขนาดสูงสุด 4MB)
        </p>
        <input
          type="file"
          id="fileUpload"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/jpg,image/png"
          multiple={mode === "multiple"}
          onChange={(e) => handleFileSelectWrapper(e.target.files)}
        />
      </div>

      {/* Image Previews */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file) => (
            <div
              key={file.name}
              className="relative group border border-border rounded-md overflow-hidden bg-muted/50"
            >
              {previewUrls[file.name] ? (
                <img
                  src={previewUrls[file.name]}
                  alt={file.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">กำลังโหลด...</p>
                </div>
              )}
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(file.name, e)}
                  className="absolute top-1 right-1 bg-destructive  text-white cursor-pointer rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                  aria-label="ลบรูปภาพ"
                >
                  <XIcon size={16} weight="bold" />
                </button>
              )}
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
