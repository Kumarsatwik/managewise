import { Router } from "express";
import {
  createProjectController,
  deleteProjectController,
  getAllProjectController,
  getProjectAnalyticsController,
  getProjectByIdAndWorkspaceIdController,
  updateProjectController,
} from "../controllers/project.controller";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", createProjectController);
projectRoutes.get("/workspace/:workspaceId/all", getAllProjectController);
projectRoutes.put(
  "/:id/workspace/:workspaceId/update",
  updateProjectController
);
projectRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteProjectController
);

projectRoutes.get(
  "/:id/workspace/:workspaceId/analytics",
  getProjectAnalyticsController
);

projectRoutes.get(
  "/:id/workspace/:workspaceId",
  getProjectByIdAndWorkspaceIdController
);

export default projectRoutes;
