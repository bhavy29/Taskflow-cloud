const express = require("express");
const router = express.Router();
const { createWorkspace, getUserWorkspaces, getWorkspaceById } = require("../controllers/workspace.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, createWorkspace);

router.get("/", authMiddleware, getUserWorkspaces);

router.get("/:id", authMiddleware, getWorkspaceById);

module.exports = router;