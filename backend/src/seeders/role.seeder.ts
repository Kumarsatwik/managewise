import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/roles-permission";

const seedRoles = async()=>{
    console.log("Seeding roles into database");
    try {
        await connectDatabase()
        const session = await mongoose.startSession();
        session.startTransaction();

        await RoleModel.deleteMany({},{session});
        for(const roleName in RolePermissions){
            const role = roleName as keyof typeof RolePermissions;
            const permissions = RolePermissions[role];
            // check if role already exists
            const existingRole = await RoleModel.findOne({name:role}).session(session);
            if(existingRole){
                console.log(`Role ${role} already exists`);
            }else{
                await RoleModel.create([{name:role,permissions}],{session});
            }
        }
        await session.commitTransaction();
        session.endSession();
        console.log("Roles seeded successfully");

    } catch (error) {
        console.log("Error seeding roles",error);   
        
    }
}

seedRoles().then(()=>{
    mongoose.connection.close();
}).catch((error)=>{
    mongoose.connection.close();
    console.log("Error seeding roles",error);
})
