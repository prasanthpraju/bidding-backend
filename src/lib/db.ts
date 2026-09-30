import dbConnect from "@/lib/database";

export async function connectDB() {
  if (!dbConnect.isInitialized) {
    await dbConnect.initialize();
    console.log("Database connected successfully");
  }

  return dbConnect;
}