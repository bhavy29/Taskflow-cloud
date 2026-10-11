const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {
    try {

        const userId = req.user.id;

        // Total Tasks
        const totalTasks = await pool.query(
            `SELECT COUNT(*) 
             FROM tasks
             WHERE assigned_to = $1`,
            [userId]
        );

        // Completed Tasks
        const completedTasks = await pool.query(
            `SELECT COUNT(*)
             FROM tasks
             WHERE assigned_to = $1
             AND status = 'Done'`,
            [userId]
        );

        // Pending Tasks
        const pendingTasks = await pool.query(
            `SELECT COUNT(*)
             FROM tasks
             WHERE assigned_to = $1
             AND status != 'Done'`,
            [userId]
        );

        // Workspaces
        const workspaces = await pool.query(
            `SELECT COUNT(*)
             FROM workspace_members
             WHERE user_id = $1`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            stats: {
                totalTasks: parseInt(totalTasks.rows[0].count),
                completedTasks: parseInt(completedTasks.rows[0].count),
                pendingTasks: parseInt(pendingTasks.rows[0].count),
                workspaces: parseInt(workspaces.rows[0].count)
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

exports.getDashboardProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        const projects = await pool.query(
            `SELECT
                w.id,
                w.name,
                w.description,
                w.created_at
             FROM workspaces w
             JOIN workspace_members wm
                ON w.id = wm.workspace_id
             WHERE wm.user_id = $1
             ORDER BY w.created_at DESC
             LIMIT 5`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            projects: projects.rows
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Only pending tasks
exports.getDashboardTasks = async (req, res) => {
    try {

        const tasks = await pool.query(
            `SELECT
                id,
                title,
                description,
                status,
                deadline,
                created_at
             FROM tasks
             WHERE assigned_to = $1 AND status != $2
             ORDER BY created_at DESC`,
            [req.user.id, "Done"]
        );

        return res.status(200).json({
            success: true,
            tasks: tasks.rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

