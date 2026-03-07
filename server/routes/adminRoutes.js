const express = require('express');
const router  = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');

const college   = require('../controllers/CollegeController');
const course    = require('../controllers/CourseController');
const material  = require('../controllers/MaterialController.js');
const adminUser = require('../controllers/adminController');
const dashboard = require('../controllers/DashboardController');

router.get('/dashboard/stats',    verifyToken, dashboard.getStats);
router.get('/dashboard/activity', verifyToken, dashboard.getActivity);

router.get   ('/colleges',     verifyToken, college.getAll);
router.get   ('/colleges/:id', verifyToken, college.getById);
router.post  ('/colleges',     verifyToken, college.create);
router.put   ('/colleges/:id', verifyToken, college.update);
router.delete('/colleges/:id', verifyToken, college.remove);

router.get   ('/courses',     verifyToken, course.getAll);
router.get   ('/courses/:id', verifyToken, course.getById);
router.post  ('/courses',     verifyToken, course.create);
router.put   ('/courses/:id', verifyToken, course.update);
router.delete('/courses/:id', verifyToken, course.remove);

router.get   ('/materials',     verifyToken, material.getAll);
router.get   ('/materials/:id', verifyToken, material.getById);
router.post  ('/materials',     verifyToken, material.create);
router.put   ('/materials/:id', verifyToken, material.update);
router.delete('/materials/:id', verifyToken, material.remove);

router.get   ('/users',     verifyToken, adminUser.getAll);
router.put   ('/users/:id', verifyToken, adminUser.update);
router.delete('/users/:id', verifyToken, adminUser.remove);

module.exports = router;