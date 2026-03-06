const Semester = require("../models/Semester");

exports.getByYear = async (req, res) => {
  try {
    const { yearId } = req.params;

    const semesters = await Semester.find({ academicYear: yearId });
    //                              .populate('academicYear', 'year isCurrent');

    if (!semesters || semesters.length === 0) {
      return res
        .status(404)
        .json({ message: "No semesters found for this year." });
    }

    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  res.send("Create Semester - Under Construction by Dev 2");
};
exports.getAll = async (req, res) => {
  res.send("Get All Semesters - Under Construction by Dev 2");
};
exports.getOne = async (req, res) => {
  res.send("Get One Semester - Under Construction by Dev 2");
};
