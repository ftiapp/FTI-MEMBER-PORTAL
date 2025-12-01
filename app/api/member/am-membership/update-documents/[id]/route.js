import { NextResponse } from "next/server";
import { executeQueryWithoutTransaction } from "@/app/lib/db";
import { getSession } from "@/app/lib/session";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";

export async function POST(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, message: "ไม่พบรหัสใบสมัคร" }, { status: 400 });
  }

  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await request.formData();

    const files = {};
    const productionImages = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key.startsWith("productionImages[")) {
          productionImages.push({ key, file: value });
        } else {
          files[key] = value;
        }
      }
    }

    if (productionImages.length > 0) {
      files["productionImages"] = productionImages;
    }

    if (Object.keys(files).length === 0) {
      return NextResponse.json({ success: true, message: "ไม่มีไฟล์ที่ต้องอัปเดต" });
    }

    const mainRows = await executeQueryWithoutTransaction(
      "SELECT user_id FROM MemberRegist_AM_Main WHERE id = ? LIMIT 1",
      [id],
    );

    if (!mainRows || mainRows.length === 0 || mainRows[0].user_id !== userId) {
      return NextResponse.json(
        { success: false, message: "ไม่พบใบสมัครนี้หรือคุณไม่มีสิทธิ์แก้ไข" },
        { status: 403 },
      );
    }

    const docTypesToReplace = new Set();
    for (const fieldName of Object.keys(files)) {
      if (fieldName === "productionImages") {
        docTypesToReplace.add("productionImage");
      } else {
        docTypesToReplace.add(fieldName);
      }
    }

    for (const docType of docTypesToReplace) {
      const existingDocs = await executeQueryWithoutTransaction(
        "SELECT id, cloudinary_url FROM MemberRegist_AM_Documents WHERE main_id = ? AND document_type = ?",
        [id, docType],
      );

      if (existingDocs && existingDocs.length > 0) {
        for (const doc of existingDocs) {
          if (doc.cloudinary_url) {
            try {
              await deleteFromCloudinary(doc.cloudinary_url);
            } catch (e) {
              console.error("Error deleting Cloudinary file for doc id", doc.id, e);
            }
          }
        }

        await executeQueryWithoutTransaction(
          "DELETE FROM MemberRegist_AM_Documents WHERE main_id = ? AND document_type = ?",
          [id, docType],
        );
      }
    }

    const uploadedDocuments = {};

    for (const fieldName of Object.keys(files)) {
      const fileValue = files[fieldName];

      if (fieldName === "productionImages" && Array.isArray(fileValue)) {
        for (let index = 0; index < fileValue.length; index++) {
          const { file } = fileValue[index];
          try {
            const buffer = await file.arrayBuffer();
            const result = await uploadToCloudinary(Buffer.from(buffer), file.name, {
              folder: `am-membership/${id}/production-images`,
              resource_type: "image",
            });

            if (result.success) {
              const documentKey = `productionImages_${index}`;
              uploadedDocuments[documentKey] = {
                document_type: "productionImage",
                file_name: file.name,
                file_path: result.url,
                file_size: file.size,
                mime_type: file.type,
                cloudinary_url: result.url,
              };
            }
          } catch (uploadError) {
            console.error(
              "Error uploading production image in update-documents (AM):",
              uploadError,
            );
          }
        }
      } else if (fileValue instanceof File) {
        try {
          const buffer = await fileValue.arrayBuffer();
          const result = await uploadToCloudinary(Buffer.from(buffer), fileValue.name, {
            folder: `am-membership/${id}`,
            resource_type: "auto",
          });

          if (result.success) {
            uploadedDocuments[fieldName] = {
              document_type: fieldName,
              file_name: fileValue.name,
              file_path: result.url,
              file_size: fileValue.size,
              mime_type: fileValue.type,
              cloudinary_url: result.url,
            };
          }
        } catch (uploadError) {
          console.error(
            `Error uploading file for ${fieldName} in update-documents (AM):`,
            uploadError,
          );
        }
      }
    }

    for (const documentKey in uploadedDocuments) {
      const doc = uploadedDocuments[documentKey];
      try {
        await executeQueryWithoutTransaction(
          `INSERT INTO MemberRegist_AM_Documents
             (main_id, document_type, file_name, file_path, cloudinary_url, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [id, doc.document_type, doc.file_name, doc.file_path, doc.cloudinary_url],
        );
      } catch (dbError) {
        console.error(`Error inserting document ${documentKey} in update-documents (AM):`, dbError);
      }
    }

    return NextResponse.json({ success: true, message: "อัปเดตเอกสารแนบเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[AM API] Error in update-documents:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถอัปเดตเอกสารแนบได้" },
      { status: 500 },
    );
  }
}
