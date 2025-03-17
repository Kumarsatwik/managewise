import mongoose, { mongo } from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import User from "../models/user.models";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";

// create a workspace
export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined;
  }
) => {
  const { name, description } = body;

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }
  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  if (!ownerRole) {
    throw new NotFoundException("Owner Role not found");
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });
  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });
  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return { workspace };
};

// get workspaces user is a member
export const getAllUserWorkspacesService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  const workspaces = memberships.map((membership) => membership.workspaceId);
  return { workspaces };
};

// get workspace by id
export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }
  const members = await MemberModel.find({ workspaceId })
    .populate("role")
    .exec();

  const workspaceMembers = {
    ...workspace.toObject(),
    members,
  };

  return { workspace: workspaceMembers };
};

// get all workspace members
export const getWorkspaceMembersService = async (
  workspaceId: string,
  userId: string
) => {
  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();
  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();
  const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });

  const overDueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  return { totalTasks, overDueTasks, completedTasks };
};

export const changeWorkspaceMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({ userId: memberId, workspaceId });

  if (!member) {
    throw new NotFoundException("Member not found in workspace");
  }
  member.role = role;
  await member.save();
  return { member };
};

export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();

  return { workspace };
};

export const deleteWorkspaceByIdService = async (
  workspaceId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await WorkspaceModel.findByIdAndDelete(workspaceId);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
    if (workspace.owner.toString() !== userId) {
      throw new BadRequestException("You are not the owner of this workspace");
    }
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await ProjectModel.deleteMany({ workspace: workspace._id }).session(
      session
    );
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(
      session
    );
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);

    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({
        userId: userId,
      }).session(session);

      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;
      await user.save();
    }
    await workspace.deleteOne({ session });

    await session.commitTransaction();

    session.endSession();

    return { currentWorkspace: user.currentWorkspace };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
