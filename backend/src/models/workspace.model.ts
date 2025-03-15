import mongoose, { Document, Schema } from "mongoose";
import { generateInviteCode } from "../utils/uuid";

export interface WorkspaceDocument extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  inviteCode:string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<WorkspaceDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true, 
    trim: true,
  },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true,
        default:generateInviteCode,
    },
},{timestamps:true});

workspaceSchema.pre("save", function (next) {
  if (this.isNew) {
    this.inviteCode = generateInviteCode();
  }
  next();
});

const WorkspaceModel = mongoose.model<WorkspaceDocument>("Workspace", workspaceSchema);
export default WorkspaceModel;