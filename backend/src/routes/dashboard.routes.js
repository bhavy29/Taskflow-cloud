const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const { getDashboardStats, getDashboardTasks } = require("../controllers/dashboard.controller");

router.get(
    "/stats",
    authMiddleware,
    getDashboardStats
);

module.exports = router;

router.get(
    "/tasks",
    authMiddleware,
    getDashboardTasks
);