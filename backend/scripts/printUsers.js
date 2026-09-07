import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const uri = 'mongodb+srv://greatstack:13022004@cluster0.igpdgep.mongodb.net/daln';

const run = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    const users = await userModel.find({}).select('name email _id').lean();
    if (!users || users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users:');
      users.forEach(u => console.log(u));
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
