const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    getWorkspaceMembers,
    addWorkspaceMember,
    getWorkspaceTasks,
    createWorkspaceTask
} = require("../controllers/workspace.controller");

router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getUserWorkspaces);
router.get("/:id/members", authMiddleware, getWorkspaceMembers);
router.post("/:id/members", authMiddleware, addWorkspaceMember);
router.get("/:id/tasks", authMiddleware, getWorkspaceTasks);
router.post("/:id/tasks", authMiddleware, createWorkspaceTask);
router.get("/:id", authMiddleware, getWorkspaceById);

module.exports = router;