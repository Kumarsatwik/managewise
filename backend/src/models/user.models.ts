import mongoose, { Document, Schema } from "mongoose";
import { compareValues, hashValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    select: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  currentWorkspace: {
    type: mongoose.Types.ObjectId,
    ref: "Workspace",
  },
  isActive:{type:Boolean,default:true},
  lastLogin: {
    type: Date,
    default: null,
  },
},{timestamps:true});

userSchema.pre("save",async function(next){
  if(this.isModified("password")){
    if(this.password){
        this.password = await hashValue(this.password,10);
    }
  }
  next();
});

  /**
   * Omits the password property from the user object.
   * @returns An object with all user properties except the password.
   */
userSchema.methods.omitPassword = function(): Omit<UserDocument, "password"> {
  const user = this.toObject();
  delete user.password;
  return user;
}

userSchema.methods.comparePassword = async function(value: string): Promise<boolean> {
  return await compareValues(value, this.password);
}

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
