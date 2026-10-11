const pool = require("../config/db");

const ensureWorkspaceMemberRoleColumn = async () => {
    await pool.query(
        `ALTER TABLE workspace_members
         ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'Member'`
    );
};

const ensureTaskPriorityColumn = async () => {
    await pool.query(
        `ALTER TABLE tasks
         ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium'`
    );
};


exports.createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Workspace name is required"
            });
        }

        await ensureWorkspaceMemberRoleColumn();

        const existingWorkspace = await pool.query(
            `SELECT 1
             FROM workspaces
             WHERE name = $1 AND owner_id = $2`,
            [name.trim(), req.user.id]
        );

        if (existingWorkspace.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "A workspace with this name already exists"
            });
        }

        const workspaceResult = await pool.query(
            `INSERT INTO workspaces
             (name, description, owner_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name.trim(), description?.trim() || null, req.user.id]
        );

        const workspace = workspaceResult.rows[0];

        await pool.query(
            `INSERT INTO workspace_members
             (workspace_id, user_id, role)
             VALUES ($1, $2, $3)`,
            [workspace.id, req.user.id, "Admin"]
        );

        return res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            workspace
        });

    } catch (error) {
        console.error("Create workspace error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Get All User Workspaces
exports.getUserWorkspaces = async (req, res) => {
    try {
        // Fetch all workspaces where the user is a member
        await ensureWorkspaceMemberRoleColumn();
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

        await ensureWorkspaceMemberRoleColumn();

        const workspace = await pool.query(
            `SELECT
                w.id,
                w.name,
                w.description,
                w.owner_id,
                w.created_at,
                wm.role
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

exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the user is a member of the workspace
        const memberCheck = await pool.query(
            `SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await ensureWorkspaceMemberRoleColumn();

        // Fetch all members of the workspace
        const members = await pool.query(
            `SELECT
                u.id,
                u.name,
                u.email,
                wm.role,
                u.id AS user_id
            FROM workspace_members wm
            JOIN users u ON u.id = wm.user_id
            WHERE wm.workspace_id = $1
            ORDER BY u.name ASC`,
            [id]
        );

        return res.status(200).json({
            success: true,
            members: members.rows
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.addWorkspaceMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const memberCheck = await pool.query(
            `SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await ensureWorkspaceMemberRoleColumn();

        const userResult = await pool.query(
            `SELECT id, name, email FROM users WHERE email = $1`,
            [email.trim()]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = userResult.rows[0];
        const existingMember = await pool.query(
            `SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
            [id, user.id]
        );

        if (existingMember.rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Member already exists",
                member: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: role || "Member"
                }
            });
        }

        await pool.query(
            `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)`,
            [id, user.id, role || "Member"]
        );

        return res.status(201).json({
            success: true,
            message: "Member added successfully",
            member: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role || "Member"
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

exports.getWorkspaceTasks = async (req, res) => {
    try {
        const { id } = req.params;

        await ensureWorkspaceMemberRoleColumn();

        const memberCheck = await pool.query(
            `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await ensureTaskPriorityColumn();

        const tasks = await pool.query(
            `SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.workspace_id,
                t.deadline,
                t.priority,
                t.assigned_to,
                u.name AS assigned_to_name
            FROM tasks t
            LEFT JOIN users u ON u.id = t.assigned_to
            WHERE t.workspace_id = $1
              AND ($3 = 'admin' OR t.assigned_to = $2)
            ORDER BY t.created_at DESC`,
            [id, req.user.id, memberCheck.rows[0].role.toLowerCase()]
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


exports.createWorkspaceTask = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            assigned_to,
            priority,
            status,
            deadline
        } = req.body;

        // 1. Validate authentication
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // 2. Validate task title
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        // 3. Check whether the logged-in user is an ADMIN
        // of this specific workspace
        await ensureWorkspaceMemberRoleColumn();

        const adminCheck = await pool.query(
            `SELECT 1
             FROM workspace_members
             WHERE workspace_id = $1
               AND user_id = $2
               AND LOWER(role) = 'admin'`,
            [id, req.user.id]
        );


        if (adminCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workspace admins can create and assign tasks"
            });
        }

        // 4. Ensure the priority column exists
        await ensureTaskPriorityColumn();

        // 5. If assigning a task, verify the assignee
        // belongs to this workspace
        if (assigned_to) {
            const assigneeCheck = await pool.query(
                `SELECT 1
                 FROM workspace_members
                 WHERE workspace_id = $1
                   AND user_id = $2`,
                [id, assigned_to]
            );

            if (assigneeCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Assignee must be a member of this workspace"
                });
            }
        }

        // 6. Create the task
        const taskResult = await pool.query(
            `INSERT INTO tasks
                (
                    title,
                    description,
                    status,
                    workspace_id,
                    deadline,
                    assigned_to,
                    priority,
                    created_by
                )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                title.trim(),
                description || null,
                status || "To Do",
                id,
                deadline || null,
                assigned_to || null,
                priority || "Medium",
                req.user.id
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: taskResult.rows[0]
        });

    } catch (error) {
        console.error("Create workspace task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
