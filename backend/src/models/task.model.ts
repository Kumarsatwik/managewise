import mongoose, { Document, mongo, Schema } from "mongoose";
import { TaskPriorityEnum, TaskPriorityEnumType, TaskStatusEnum, TaskStatusEnumType } from "../enums/task.enum";
import { generateTaskCode } from "../utils/uuid";

export interface TaskDocument extends Document {
    taskCode:string;
    title: string;
    description: string | null;
    project: mongoose.Types.ObjectId;
    workspace:mongoose.Types.ObjectId;
    status: TaskStatusEnumType;
    priority: TaskPriorityEnumType;  
    createdBy: mongoose.Types.ObjectId;
    assignee:mongoose.Types.ObjectId | null;
    dueDate:Date | null; 
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>({
    taskCode:{
        type:String,
        required:true,
        unique:true,
        default:generateTaskCode
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: null,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    workspace:{
        type:Schema.Types.ObjectId,
        ref:"Workspace",
        required:true,
    },
    status: {
        type: String,
        enum: Object.values(TaskStatusEnum),
        default: TaskStatusEnum.TODO,
    },
    priority: {
        type: String,
        enum: Object.values(TaskPriorityEnum),
        default: TaskPriorityEnum.MEDIUM,
    },
    assignee:{
        type:Schema.Types.ObjectId,
        ref:"User",
        default:null,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    dueDate:{
        type:Date,
        default:null,
    }
},{timestamps:true});

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);

export default TaskModel;