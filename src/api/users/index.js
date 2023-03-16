import express from "express"
import createHttpError from "http-errors"
import UsersModel from "./model.js"
import BooksModel from "../books/model.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body)
    // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    // if it is ok the user is not saved yet
    const { _id } = await newUser.save()

    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      req.body, // HOW
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record pre-modification. If you want to get the newly updated one you shall use new: true
      // By default validation is off in the findByIdAndUpdate --> runValidators: true
    )

    // ********************************************** ALTERNATIVE METHOD **********************************
    // const user = await UsersModel.findById(req.params.userId)
    // // When you do a findById, findOne,... you get back a MONGOOSE DOCUMENT which is NOT a normal JS Object!
    // // It is an object with superpowers, for instance it has .save() method that could be very useful in some cases
    // user.age = 100

    // await user.save()

    // ****************************************************************************************************
    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// ********************************************** EMBEDDED CRUD **************************************************

usersRouter.post("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    // We could receive here a bookId in the req.body. Given that id, we would like to insert the corresponding book into the purchase history of the specified user

    // 1. Search in the books' collection for the book by id
    const purchasedBook = await BooksModel.findById(req.body.bookId, { _id: 0 })
    // here we are using projection ({_id: 0}) to omit the _id from the retrieved book. In this way Mongo will automagically create a unique _id for each and every item added to the array

    if (purchasedBook) {
      // 2. If the book is found --> let's add additional info like purchaseDate
      const bookToInsert = { ...purchasedBook.toObject(), purchaseDate: new Date() }
      // NOTE: purchasedBook and EVERYTHING comes from a .find(), .findById(),... is a MONGOOSE DOCUMENT not a normal object!!
      // Therefore if you want to spread it you should convert it into a plain js object
      console.log("BOOK TO INSERT:", bookToInsert)

      // 3. Update the specified user's recrod by adding that book to his/her purchaseHistory array
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { purchaseHistory: bookToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )
      if (updatedUser) {
        res.send(updatedUser)
      } else {
        next(createHttpError(404, `User with id ${req.params.userId} not found!`))
      }
    } else {
      // 4. In case of book not found  --> 404
      next(createHttpError(404, `Book with id ${req.body.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user.purchaseHistory)
    } else {
      next(createHttpError(404, `Book with id ${req.body.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory/:productId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      console.log("purchaseHistory:", user.purchaseHistory)
      const purchasedBook = user.purchaseHistory.find(book => book._id.toString() === req.params.productId)
      // YOU CANNOT COMPARE A STRING (req.params.productId) WITH AN OBJECTID (book._id)
      // Solution --> you have to either convert _id into a string or productId into ObjectId
      console.log("purchasedBook:", purchasedBook)
      if (purchasedBook) {
        res.send(purchasedBook)
      } else {
        next(createHttpError(404, `Book with id ${req.params.productId} not found!`))
      }
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId/purchaseHistory/:productId", async (req, res, next) => {
  try {
    // 1. Find user By Id (obtaining a MONGOOSE DOCUMENT!)
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      // 2. Update the right item in the array by using normal JS code

      // 2.1 Search for the index of the product into purchaseHistory array
      const index = user.purchaseHistory.findIndex(book => book._id.toString() === req.params.productId)

      if (index !== -1) {
        // 2.2 If the product is there --> modify that product with some new data coming from req.body
        user.purchaseHistory[index] = { ...user.purchaseHistory[index].toObject(), ...req.body }
        // 3. Since user is a MONGOOSE DOCUMENT I can use .save() method to update that record
        await user.save()
        res.send(user)
      } else {
        next(createHttpError(404, `Book with id ${req.params.productId} not found!`))
      }
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId/purchaseHistory/:productId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      { $pull: { purchaseHistory: { _id: req.params.productId } } }, // HOW
      { new: true, runValidators: true } // OPTIONS
    )
    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter
