const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { createWorkspace, getUserWorkspaces, getWorkspaceById } = require("../controllers/workspace.controller");

router.post("/", authMiddleware, createWorkspace);

router.get("/", authMiddleware, getUserWorkspaces);

router.get("/:id", authMiddleware, getWorkspaceById);

module.exports = router;