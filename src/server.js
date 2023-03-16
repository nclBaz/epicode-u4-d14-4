import Express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import usersRouter from "./api/users/index.js"
import booksRouter from "./api/books/index.js"
import authorsRouter from "./api/authors/index.js"
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"

const server = Express()
const port = process.env.PORT || 3001

// **************************************** MIDDLEWARES *****************************************
server.use(cors())
server.use(Express.json())

// ****************************************** ENDPOINTS *****************************************
server.use("/users", usersRouter)
server.use("/books", booksRouter)
server.use("/authors", authorsRouter)

// **************************************** ERROR HANDLERS **************************************
server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected", () => {
  console.log("✅ Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`✅ Server is running on port ${port}`)
  })
})
