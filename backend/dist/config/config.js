import mongoose from "mongoose";
const connectToDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("MongoDB connected");
    }
    catch (err) {
        throw new Error("Something went error");
    }
};
export default connectToDB;
//# sourceMappingURL=config.js.map