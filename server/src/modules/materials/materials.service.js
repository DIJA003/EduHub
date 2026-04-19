const Material = require("./material.model");
const Course = require("../courses/course.model");
const { notify, notifyMany } = require("../notifications/notification.service");
const User = require("../users/user.model");

const confirmUpload = async ({ uploadedBy, uploaderRole, body }) => {
  const {
    storagePath,
    fileName,
    mimeType,
    fileSize,
    courseId,
    sectionId,
    sectionLabel,
    yearId,
    title,
    fileUrl,
    fileType,
  } = body;

  let courseName = "";
  let courseRef = null;

  if (courseId) {
    const course = await Course.findById(courseId).select("title").lean();
    if (course) {
      courseName = course.title;
      courseRef = courseId;
    }
  }

  const status = uploaderRole === "student" ? "pending" : "approved";

  const material = await Material.create({
    title: title || fileName,
    type: fileType || "Other",
    size: formatBytes(fileSize),
    fileUrl,
    storagePath,
    courseRef,
    uploadedBy,
    uploaderRole,
    status,
    sectionId: sectionId || "",
    sectionLabel: sectionLabel || "",
    yearId: yearId || "",
  });

  if (uploaderRole === "student" && courseRef) {
    const course = await Course.findById(courseRef)
      .select("title instructorRef")
      .lean();

    if (course?.instructorRef) {
      const uploader = await User.findById(uploadedBy).select("name").lean();
      await notify({
        recipient: course.instructorRef,
        sender: uploadedBy,
        type: "material_submitted",
        title: "New material pending review",
        message: `${uploader?.name || "A student"} submitted "${material.title}" in ${course.title}`,
        metadata: { materialRef: material._id, courseRef: course._id },
      });
    }

    const admins = await User.find({ role: "admin", isDeleted: { $ne: true } })
      .select("_id")
      .lean();
    const adminIds = admins
      .map((a) => a._id)
      .filter((id) => id.toString() !== course?.instructorRef?.toString());

    if (adminIds.length) {
      await notifyMany(adminIds, {
        sender: uploadedBy,
        type: "material_submitted",
        title: "New material pending review",
        message: `"${material.title}" needs review`,
        metadata: { materialRef: material._id, courseRef: courseRef },
      });
    }
  }

  return material;
};

const approveMaterial = async ({
  materialId,
  reviewerId,
  reviewerRole,
  feedback = "",
}) => {
  const material = await Material.findById(materialId);
  if (!material) {
    const err = new Error("Material not found");
    err.status = 404;
    throw err;
  }

  if (material.status !== "pending") {
    const err = new Error("Only pending materials can be approved");
    err.status = 400;
    throw err;
  }

  if (reviewerRole !== "admin") {
    const course = await Course.findOne({
      _id: material.courseRef,
      instructorRef: reviewerId,
    });
    if (!course) {
      const err = new Error("You can only approve materials in your courses");
      err.status = 403;
      throw err;
    }
  }

  material.status = "approved";
  material.mentorFeedback = feedback;
  material.reviewedBy = reviewerId;
  material.reviewedAt = new Date();
  await material.save();

  const course = await Course.findById(material.courseRef)
    .select("title")
    .lean();

  await notify({
    recipient: material.uploadedBy,
    sender: reviewerId,
    type: "material_approved",
    title: "Material approved",
    message: `Your material "${material.title}" was approved in ${course?.title || "your course"}.${feedback ? ` Feedback: ${feedback}` : ""}`,
    metadata: { materialRef: material._id, courseRef: material.courseRef },
  });

  return material;
};

const rejectMaterial = async ({
  materialId,
  reviewerId,
  reviewerRole,
  feedback = "",
}) => {
  const material = await Material.findById(materialId);
  if (!material) {
    const err = new Error("Material not found");
    err.status = 404;
    throw err;
  }

  if (material.status !== "pending") {
    const err = new Error("Only pending materials can be rejected");
    err.status = 400;
    throw err;
  }

  if (reviewerRole !== "admin") {
    const course = await Course.findOne({
      _id: material.courseRef,
      instructorRef: reviewerId,
    });
    if (!course) {
      const err = new Error("You can only reject materials in your courses");
      err.status = 403;
      throw err;
    }
  }

  material.status = "rejected";
  material.mentorFeedback = feedback;
  material.reviewedBy = reviewerId;
  material.reviewedAt = new Date();
  await material.save();

  const course = await Course.findById(material.courseRef)
    .select("title")
    .lean();

  await notify({
    recipient: material.uploadedBy,
    sender: reviewerId,
    type: "material_rejected",
    title: "Material rejected",
    message: `Your material "${material.title}" was rejected in ${course?.title || "your course"}.${feedback ? ` Reason: ${feedback}` : ""}`,
    metadata: { materialRef: material._id, courseRef: material.courseRef },
  });

  return material;
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

module.exports = { confirmUpload, approveMaterial, rejectMaterial };
