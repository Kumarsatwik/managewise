import { ErrorCodeEnum } from "../enums/errorcode.enum";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model"
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";

export const getMemberRoleInWorkspace= async(userId:string,workspaceId:string)=>{
    const workspace = await WorkspaceModel.findById(workspaceId);
    if(!workspace){
        throw new NotFoundException("Workspace not found");
    }
    const member = await MemberModel.findOne({userId,workspaceId}).populate("role");
    if(!member){
        throw new UnauthorizedException("Member not found",ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }
    const roleName = member.role?.name;
    return {role:roleName}

}

export const joinWorkspaceByInviteService = async(userId:string,inviteCode:string)=>{
    // find workspace by invite code
    const workspace = await WorkspaceModel.findOne({inviteCode});
    if(!workspace){
        throw new NotFoundException("Workspace not found");
    }
    // check if user is already a member of the workspace
    const existingMember = await MemberModel.findOne({userId,workspaceId:workspace._id});
    if(existingMember){
        throw new BadRequestException("You are already a member of this workspace");
    }
    // get the role of the member
    const role = await RoleModel.findOne({name:Roles.MEMBER})
    if(!role){
        throw new NotFoundException("Role does not exist");
    }
    // create a new member
    const newMember = new MemberModel({
        userId,
        workspaceId:workspace._id,
        role:role._id
    });
    await newMember.save();
    return {workspaceId:workspace._id,role:role.name}
}

