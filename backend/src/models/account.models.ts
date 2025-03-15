import mongoose, { Document, Schema } from "mongoose";
import { ProviderEnum, ProviderEnumType } from "../enums/account.provider.enum";

export interface AccountDocument extends Document {
    provider:ProviderEnumType;
    providerId:string;
    userId:mongoose.Types.ObjectId;
    refreshToken:string | null;
    tokenExpiry:Date | null;
    createdAt:Date;
}

const accountSchema = new Schema<AccountDocument>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    provider:{
        type:String,
        required:true,
        enum:Object.values(ProviderEnum),
    },
    providerId:{
        type:String,
        required:true,
        unique:true,
    },
    refreshToken:{
        type:String,
        default:null,
    },
    tokenExpiry:{
        type:Date,
        default:null,
    },
},{timestamps:true,toJSON:{
    /**
     * A transform function that deletes the refreshToken from the response.
     * This is to prevent the refreshToken from being exposed in the response.
     */
    transform:(doc,ret)=>{
        delete ret.refreshToken
    }
}});   

const AccountModel = mongoose.model<AccountDocument>("Account",accountSchema);

export default AccountModel
