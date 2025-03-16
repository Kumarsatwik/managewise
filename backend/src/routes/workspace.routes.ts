import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  getAllUserWorkspacesController,
  getWorkspaceMemberController,
  getWorkspacesByAnalyticsController,
  getWorkspacesByIdController,
  updateWorkspaceByIdController,
} from "../controllers/workspace.controller";

const workspaceRoutes = Router();

// create a new workspace
workspaceRoutes.post("/create/new", createWorkspaceController);

// Update workspace by id
workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

// change role of a workspace member
workspaceRoutes.put(
  "/change/member/role/:id",
  changeWorkspaceMemberRoleController
);

// get all workspaces of a user
workspaceRoutes.get("/all", getAllUserWorkspacesController);

// get a workspace by id
workspaceRoutes.get("/:id", getWorkspacesByIdController);

// get workspaces by analytics
workspaceRoutes.get("/analytics/:id", getWorkspacesByAnalyticsController);

// get all members of a workspace
workspaceRoutes.get("/members/:id", getWorkspaceMemberController);

export default workspaceRoutes;
