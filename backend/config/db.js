import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://greatstack:13022004@cluster0.igpdgep.mongodb.net/daln').then(() => console.log("DB Connected"));
}

