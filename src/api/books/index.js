import express from "express"
import createHttpError from "http-errors"
import q2m from "query-to-mongo"
import BooksModel from "./model.js"

const booksRouter = express.Router()

booksRouter.post("/", async (req, res, next) => {
  try {
    const newBook = new BooksModel(req.body)
    const { _id } = await newBook.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/", async (req, res, next) => {
  try {
    console.log("req.query:", req.query)
    console.log("q2m:", q2m(req.query))
    const mongoQuery = q2m(req.query)
    //  price: '>10' should be converted somehow into price: {$gt: 10}
    const { books, total } = await BooksModel.findBooksWithAuthors(mongoQuery)
    res.send({
      links: mongoQuery.links("http://localhost:3001/books", total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      books,
    })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:bookId", async (req, res, next) => {
  try {
    const book = await BooksModel.findById(req.params.bookId).populate({ path: "authors", select: "firstName lastName" })
    if (book) {
      res.send(book)
    } else {
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.put("/:bookId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:bookId", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

export default booksRouter
