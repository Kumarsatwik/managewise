import mongoose from "mongoose";
import User from "../models/user.models";
import AccountModel from "../models/account.models";
import WorkspaceModel from "../models/workspace.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import RoleModel from "../models/roles-permission.model";
import MemberModel from "../models/member.model";
import { ProviderEnum } from "../enums/account.provider.enum";

/**
 * Logs in a user if they exist, or creates a new user and associates them with the given provider
 * @param data The data containing the provider, providerId, displayName, picture and email
 * @returns The user with their corresponding workspace and role
 */
export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { provider, providerId, displayName, picture, email } = data;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    let user = await User.findOne({ email }).session(session);
    if (!user) {
      user = new User({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      // Create an account for the user

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save({ session });

      // Create a workspace for the user
      const workspace = new WorkspaceModel({
        name: "My Workspace",
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      // Create a member for the user
      const ownerRole = await RoleModel.findOne({ name: "OWNER" }).session(
        session
      );
      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }
      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });
      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }
    await session.commitTransaction();
    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    console.log("Ending session");
    session.endSession();
  }
};

export const registerUserService = async (body: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const exisitingUser = await User.findOne({ email }).session(session);
    if (exisitingUser) {
      throw new BadRequestException("User already exists");
    }

    const user = new User({ email, name, password });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    // Create a workspace for the user
    const workspace = new WorkspaceModel({
      name: "My Workspace",
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    // Create a member for the user
    const ownerRole = await RoleModel.findOne({ name: "OWNER" }).session(
      session
    );
    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });
    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save({ session });

    await session.commitTransaction();
    return { userId: user._id, workspaceId: workspace._id };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  } finally {
    session.endSession();
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ providerId: email, provider });
  if (!account) {
    throw new NotFoundException("User not found");
  }
  const user = await User.findById(account.userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password ");
  }
  return user.omitPassword();
};

export const findUserByIdService = async (userId: string) => {
  const user = await User.findById(userId, {
    password: false,
  });
  return user || null;
};
