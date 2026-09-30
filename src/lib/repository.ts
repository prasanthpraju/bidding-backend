import { User } from "@/entities/user";
import dbConnect from "@/lib/database";

export const UserRepo = dbConnect.getRepository(User);