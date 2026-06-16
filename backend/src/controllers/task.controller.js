const pool = require('../config/db');

exports.createTask = async (req, res) => {
    try{
        const { title, description, status, workspace_id, deadline, assigned_to } = req.body;

        if(!title || !title.trim()){
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        const taskResult = await pool.query(
            `INSERT INTO tasks
            (title, description, status, workspace_id, deadline, assigned_to, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [title, description || null, status || 'To Do', workspace_id, deadline || null, assigned_to || null, req.user.id]
        );

        const task = taskResult.rows[0];

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getWorkspaceTasks = async (req, res) => {
    try{
        const { workspaceId } = req.params;

        const tasksResult = await pool.query(
            `SELECT * FROM tasks WHERE workspace_id = $1`,
            [workspaceId]
        );

        return res.status(200).json({
            success: true,
            message: "Tasks retrieved successfully",
            tasks: tasksResult.rows
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getTaskById = async (req, res) => {
    try{
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
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateTask = async (req, res) => {
    try{
        const { taskId } = req.params;
        const { title, description, status, deadline, assigned_to } = req.body;

        const taskResult = await pool.query(
            `UPDATE tasks SET title = $1, description = $2, status = $3, deadline = $4, assigned_to = $5 WHERE id = $6 RETURNING *`,
            [title, description, status, deadline, assigned_to, taskId]
        );

        if (!taskResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: taskResult.rows[0]
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteTask = async (req, res) => {
    try{
        const { taskId } = req.params;

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

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            task: taskResult.rows[0]
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};