import { Router } from "express";
import { createTaskController, deleteTasksController, getAllTasksController, getTaskByIdController, updateTasksController } from "../controllers/task.controller";
const taskRoutes = Router();

taskRoutes.post("/projects/:projectId/workspace/:workspaceId/tasks/create", createTaskController);

taskRoutes.put("/:id/projects/:projectId/workspace/:workspaceId/update", updateTasksController);

taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTasksController);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);
taskRoutes.get("/:id/project/:projectId/workspace/:workspaceId", getTaskByIdController);


export default taskRoutes;
