import mongoose from "mongoose"

const { Schema, model } = mongoose

const usersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, required: true },
    address: {
      street: { type: String },
      number: { type: Number },
    },
    professions: [String],
    purchaseHistory: [
      {
        title: { type: String, required: true },
        category: String,
        asin: { type: String, required: true },
        price: Number,
        purchaseDate: Date,
      },
    ],
  },
  {
    timestamps: true, // this option automatically handles the createdAt and updatedAt fields
  }
)

export default model("User", usersSchema) // this model is now automagically linked to the "users" collection, if the collection does not exist it will be created
