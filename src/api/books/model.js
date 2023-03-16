import mongoose from "mongoose"

const { Schema, model } = mongoose

const booksSchema = new Schema(
  {
    asin: { type: String, required: true },
    title: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ["history", "romance", "horror", "fantasy"] },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  { timestamps: true }
)

// *************************** MODEL CUSTOM METHOD **********************

booksSchema.static("findBooksWithAuthors", async function (query) {
  console.log("THIS: ", this)
  const books = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({ path: "authors", select: "firstName lastName" })
  const total = await this.countDocuments(query.criteria)
  // no matter the order of usage of these methods, Mongo will ALWAYS apply SORT then SKIP then LIMIT
  return { books, total }
})

export default model("Book", booksSchema)
