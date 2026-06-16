const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const workspaceMiddleware = require("../middleware/workspace.middleware");
const { createTask, getWorkspaceTasks, getTaskById, updateTask, deleteTask } = require("../controllers/task.controller");

router.post("/", authMiddleware,createTask);
router.get("/workspace/:workspaceId", authMiddleware, workspaceMiddleware, getWorkspaceTasks);
router.get("/:taskId", authMiddleware, getTaskById);
router.put("/:taskId", authMiddleware, updateTask);
router.delete("/:taskId", authMiddleware, deleteTask);

module.exports = router;