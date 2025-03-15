import User from "../models/user.models";
import { BadRequestException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
  const currentUser = await User.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!currentUser) {
    throw new BadRequestException("User not found");
  }

  return { user: currentUser };
};
