import { Document, model, Schema, Types } from "mongoose";

interface IMessage extends Document {
  sender: Types.ObjectId;
  content: string;
}

const MessageSchema = new Schema<IMessage>(
  {
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
  },
  { timestamps: true },
);

const Message = model<IMessage>("Message", MessageSchema);
export { Message };
