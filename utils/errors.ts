import { Prisma } from "@prisma/client"
import { Response } from "express"

export function handleErrors(err: unknown, res: Response) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res
        .status(403)
        .json({ cause: "database", message: "Duplicate username" })
    }
    return res.status(400).json({
      cause: "database",
      message: "Database error",
      dev: err.message,
    })
  }
  res.status(500).json({ message: "Something unexpected happened" })
}
