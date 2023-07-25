import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"

dotenv.config()

import { Prisma, PrismaClient } from "@prisma/client"
import { handleErrors } from "./utils/errors"
const prisma = new PrismaClient()

const app: Express = express()
const port = process.env.PORT

// const middleware = (req: Request, res: Response, next: NextFunction) => {
//   console.log("Hi I'm middleware")
//   next()
// }

app.use(express.json()) //for parsing application/json
// app.use(middleware)

app.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      posts: {
        select: {
          id: true,
          title: true,
          content: true,
        },
      },
    },
  })
  console.log(users)
  res.status(200).json(users)
})

app.post("/users", async (req: Request, res: Response) => {
  const body = req.body
  console.log("Creating user")
  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
      },
    })
    res.status(201).json(user)
  } catch (err) {
    handleErrors(err, res)
  }
})

app.get("/users/:username", async (req: Request, res: Response) => {
  const username = req.params.username
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      posts: true,
    },
  })
  res.status(200).json(user)
})

type PostBody = {
  title: string
  content: string
}

app.post("/posts/:author", async (req: Request, res: Response) => {
  const body: PostBody = req.body
  const authorName = req.params.author
  const post = await prisma.post.create({
    data: {
      content: body.content,
      title: body.title,
      author: {
        connect: {
          username: authorName,
        },
      },
    },
    include: {
      author: true,
    },
  })
  res.status(200).json(post)
})

app.delete("/posts/:id", async (req: Request, res: Response) => {
  const postId = req.params.id
  try {
    const post = await prisma.post.delete({
      where: {
        id: postId,
      },
    })
    res.status(202).json(post)
  } catch (err) {
    console.log(err)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025")
        res
          .status(404)
          .json({ cause: "database", message: "This Post doesn't exist" })
    }
  }
})

app.patch("/posts/:id", async (req: Request, res: Response) => {
  const postId = req.params.id
  const body: Partial<PostBody> = req.body

  const post = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      ...body,
    },
  })
  res.status(201).json(post)
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
