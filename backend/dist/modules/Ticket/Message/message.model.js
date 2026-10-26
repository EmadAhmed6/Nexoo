import { model, Schema, Types } from "mongoose";
const MessageSchema = new Schema({
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });
const Message = model("Message", MessageSchema);
export { Message };
//# sourceMappingURL=message.model.js.map