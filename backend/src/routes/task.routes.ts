import { Router } from "express";
import { createTaskController, deleteTasksController, getAllTasksController, updateTasksController } from "../controllers/task.controller";
const taskRoutes = Router();

taskRoutes.post("/projects/:projectId/workspace/:workspaceId/tasks/create", createTaskController);

taskRoutes.put("/:id/projects/:projectId/workspace/:workspaceId/update", updateTasksController);

taskRoutes.delete("/projects/:projectId/workspace/:workspaceId/tasks/:taskId/delete", deleteTasksController);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);
taskRoutes

export default taskRoutes;
