const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const { getDashboardStats, getDashboardTasks, getDashboardProjects } = require("../controllers/dashboard.controller");

router.get(
    "/stats",
    authMiddleware,
    getDashboardStats
);

router.get(
    "/tasks",
    authMiddleware,
    getDashboardTasks
);

router.get(
    "/projects",
    authMiddleware,
    getDashboardProjects
);

module.exports = router;
