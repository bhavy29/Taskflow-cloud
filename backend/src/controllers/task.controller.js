const pool = require('../config/db');

const ensureWorkspaceMemberRoleColumn = async () => {
    await pool.query(
        `ALTER TABLE workspace_members
         ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'Member'`
    );
};

const emitTaskUpdate = (req, event, task) => {
    const io = req.app.get('io');

    if (!io) return;

    const payload = { event, task };

    if (task?.workspace_id !== undefined && task?.workspace_id !== null) {
        io.to(`workspace:${task.workspace_id}`).emit('task:update', payload);
    }

    io.emit('task:update', payload);
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, status, workspace_id, deadline, assigned_to, priority } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        if (workspace_id) {
            await ensureWorkspaceMemberRoleColumn();
            const adminCheck = await pool.query(
                `SELECT 1
                 FROM workspace_members
                 WHERE workspace_id = $1
                   AND user_id = $2
                   AND LOWER(role) = 'admin'`,
                [workspace_id, req.user.id]
            );

            if (adminCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Only workspace admins can create and assign tasks"
                });
            }

            if (assigned_to) {
                const assigneeCheck = await pool.query(
                    `SELECT 1
                     FROM workspace_members
                     WHERE workspace_id = $1
                       AND user_id = $2`,
                    [workspace_id, assigned_to]
                );
                if (assigneeCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Assignee must be a member of this workspace"
                    });
                }
            }
        }

        await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium'`);

        const taskResult = await pool.query(
            `INSERT INTO tasks
            (title, description, status, workspace_id, deadline, assigned_to, priority, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [title, description || null, status || 'To Do', workspace_id, deadline || null, assigned_to || null, priority || 'Medium', req.user.id]
        );

        const task = taskResult.rows[0];
        emitTaskUpdate(req, 'created', task);

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getWorkspaceTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        await ensureWorkspaceMemberRoleColumn();
        const memberResult = await pool.query(
            `SELECT LOWER(role) AS role
             FROM workspace_members
             WHERE workspace_id = $1
               AND user_id = $2`,
            [workspaceId, req.user.id]
        );

        const tasksResult = await pool.query(
            `SELECT *
             FROM tasks
             WHERE workspace_id = $1
               AND ($3 = 'admin' OR assigned_to = $2)
             ORDER BY created_at DESC`,
            [workspaceId, req.user.id, memberResult.rows[0].role]
        );

        return res.status(200).json({
            success: true,
            message: "Tasks retrieved successfully",
            tasks: tasksResult.rows
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;

        const tasksResult = await pool.query(
            `SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            tasks: tasksResult.rows
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const taskResult = await pool.query(
            `SELECT * FROM tasks WHERE id = $1`,
            [taskId]
        );

        if (!taskResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task retrieved successfully",
            task: taskResult.rows[0]
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        await ensureWorkspaceMemberRoleColumn();
        const taskAccess = await pool.query(
            `SELECT t.workspace_id, t.assigned_to, LOWER(wm.role) AS workspace_role
             FROM tasks t
             LEFT JOIN workspace_members wm
               ON wm.workspace_id = t.workspace_id
              AND wm.user_id = $2
             WHERE t.id = $1`,
            [taskId, req.user.id]
        );

        if (taskAccess.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const currentTask = taskAccess.rows[0];

        if (currentTask.workspace_id) {
            if (currentTask.workspace_role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only workspace admins can edit tasks"
                });
            }
        } else if (
            req.user.role === "member" &&
            currentTask.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update tasks assigned to you"
            });
        }

        const { title, description, status, deadline, assigned_to, priority } = req.body;

        if (currentTask.workspace_id && assigned_to) {
            const assigneeCheck = await pool.query(
                `SELECT 1
                 FROM workspace_members
                 WHERE workspace_id = $1
                   AND user_id = $2`,
                [currentTask.workspace_id, assigned_to]
            );
            if (assigneeCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Assignee must be a member of this workspace"
                });
            }
        }

        await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium'`);

        const taskResult = await pool.query(
            `UPDATE tasks SET title = $1, description = $2, status = $3, deadline = $4, assigned_to = $5, priority = $6 WHERE id = $7 RETURNING *`,
            [title, description, status, deadline, assigned_to, priority || 'Medium', taskId]
        );

        if (!taskResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        emitTaskUpdate(req, 'updated', taskResult.rows[0]);

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: taskResult.rows[0]
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        await ensureWorkspaceMemberRoleColumn();
        const taskAccess = await pool.query(
            `SELECT t.workspace_id, LOWER(wm.role) AS workspace_role
             FROM tasks t
             LEFT JOIN workspace_members wm
               ON wm.workspace_id = t.workspace_id
              AND wm.user_id = $2
             WHERE t.id = $1`,
            [taskId, req.user.id]
        );

        if (taskAccess.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (
            taskAccess.rows[0].workspace_id &&
            taskAccess.rows[0].workspace_role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Only workspace admins can delete tasks"
            });
        }

        const taskResult = await pool.query(
            `DELETE FROM tasks WHERE id = $1 RETURNING *`,
            [taskId]
        );

        if (!taskResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        emitTaskUpdate(req, 'deleted', taskResult.rows[0]);

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            task: taskResult.rows[0]
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['To Do', 'In Progress', 'Done'];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task status'
            });
        }

        const taskResult = await pool.query(
            `SELECT id, assigned_to
             FROM tasks
             WHERE id = $1`,
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const task = taskResult.rows[0];

        // Members can only update tasks assigned to themselves
        if (
            req.user.role === 'member' &&
            task.assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'You can only update tasks assigned to you'
            });
        }

        const result = await pool.query(
            `UPDATE tasks
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, taskId]
        );

        emitTaskUpdate(req, 'status-updated', result.rows[0]);

        return res.status(200).json({
            success: true,
            task: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};