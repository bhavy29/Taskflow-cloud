const pool = require("../config/db");

const checkWorkspaceMember = async (req, res, next) => {
    try {
        const workspaceId =
            req.params.workspaceId || req.body.workspace_id;

        const memberCheck = await pool.query(
            `SELECT *
             FROM workspace_members
             WHERE workspace_id = $1
             AND user_id = $2`,
            [workspaceId, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = checkWorkspaceMember;