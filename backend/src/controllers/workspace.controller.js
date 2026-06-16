const pool = require("../config/db");

// Create Workspace
exports.createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Workspace name is required"
            });
        }

        // Create workspace
        const workspaceResult = await pool.query(
            `INSERT INTO workspaces
            (name, description, owner_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, description || null, req.user.id]
        );

        const workspace = workspaceResult.rows[0];

        // Add creator as member
        await pool.query(
            `INSERT INTO workspace_members
            (workspace_id, user_id)
            VALUES ($1, $2)`,
            [workspace.id, req.user.id]
        );

        return res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            workspace
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get All User Workspaces
exports.getUserWorkspaces = async (req, res) => {
    try {

        const workspaces = await pool.query(
            `SELECT
                w.id,
                w.name,
                w.description,
                w.owner_id,
                w.created_at
            FROM workspaces w
            JOIN workspace_members wm
                ON w.id = wm.workspace_id
            WHERE wm.user_id = $1
            ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            count: workspaces.rows.length,
            workspaces: workspaces.rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get Workspace By ID
exports.getWorkspaceById = async (req, res) => {
    try {

        const { id } = req.params;

        const workspace = await pool.query(
            `SELECT
                w.id,
                w.name,
                w.description,
                w.owner_id,
                w.created_at
            FROM workspaces w
            JOIN workspace_members wm
                ON w.id = wm.workspace_id
            WHERE w.id = $1
            AND wm.user_id = $2`,
            [id, req.user.id]
        );

        if (workspace.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found or access denied"
            });
        }

        return res.status(200).json({
            success: true,
            workspace: workspace.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};