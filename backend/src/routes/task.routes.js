const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const workspaceMiddleware = require("../middleware/workspace.middleware");
const authorizeRole = require("../middleware/role.middleware");
const { createTask, getWorkspaceTasks, getTaskById, updateTask, deleteTask, updateTaskStatus } = require("../controllers/task.controller");

router.post("/", authMiddleware, authorizeRole("admin"), createTask);
router.get("/workspace/:workspaceId", authMiddleware, authorizeRole("admin"), workspaceMiddleware, getWorkspaceTasks);
router.get("/:taskId", authMiddleware, getTaskById);
router.put("/:taskId", authMiddleware, updateTask);
router.delete("/:taskId", authMiddleware, authorizeRole("admin"), deleteTask);
router.patch("/:taskId/status", authMiddleware, updateTaskStatus);

module.exports = router;