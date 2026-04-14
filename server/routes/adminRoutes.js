const express = require('express');
const router  = express.Router();

const { verifyToken, adminOnly } = require('../middleware/authMiddleware');

const college         = require('../controllers/CollegeController');
const course          = require('../controllers/CourseController');
const material        = require('../controllers/MaterialController.js');
const adminUser       = require('../controllers/adminController');
const dashboard       = require('../controllers/DashboardController');
//const studentCourse   = require('../controllers/studentCourseController');

const auth      = [verifyToken];
const authAdmin = [verifyToken, adminOnly];

router.get('/dashboard/stats',    ...authAdmin, dashboard.getStats);
router.get('/dashboard/activity', ...authAdmin, dashboard.getActivity);

router.get   ('/colleges',     ...authAdmin, college.getAll);
router.get   ('/colleges/:id', ...authAdmin, college.getById);
router.post  ('/colleges',     ...authAdmin, college.create);
router.put   ('/colleges/:id', ...authAdmin, college.update);
router.delete('/colleges/:id', ...authAdmin, college.remove);

router.get   ('/courses',     ...authAdmin, course.getAll);
router.get   ('/courses/:id', ...authAdmin, course.getById);
router.post  ('/courses',     ...authAdmin, course.create);
router.put   ('/courses/:id', ...authAdmin, course.update);
router.delete('/courses/:id', ...authAdmin, course.remove);

// router.get   ('/courses/:id/students',            ...authAdmin, studentCourse.getStudents);
// router.post  ('/courses/:id/students',            ...authAdmin, studentCourse.addStudent);
// router.delete('/courses/:id/students/:studentId', ...authAdmin, studentCourse.removeStudent);

//router.get('/students/:studentId/courses', ...authAdmin, studentCourse.getStudentCourses);

router.get   ('/materials',     ...authAdmin, material.getAll);
router.get   ('/materials/:id', ...authAdmin, material.getById);
router.post  ('/materials',     ...authAdmin, material.create);
router.put   ('/materials/:id', ...authAdmin, material.update);
router.delete('/materials/:id', ...authAdmin, material.remove);

router.get   ('/users',     ...authAdmin, adminUser.getAll);
router.put   ('/users/:id', ...authAdmin, adminUser.update);
router.delete('/users/:id', ...authAdmin, adminUser.remove);

module.exports = router;