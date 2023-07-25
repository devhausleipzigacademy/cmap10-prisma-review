import { Request, Response } from "express"
import { PostBody } from ".."
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const updatePost = async (req: Request, res: Response) => {
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
}
