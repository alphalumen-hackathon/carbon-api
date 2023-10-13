import { PrismaClient } from "@prisma/client"
import { compare, hash } from "bcrypt"
import { config } from "dotenv"
import express from "express"
import session from "express-session"
import { z } from "zod"

config({ path: ".env" })

const prisma = new PrismaClient()
const app = express()
const store = new session.MemoryStore()

app.use(express.json())

if (!process.env.SESSION_SECRET) {
  console.error("No SESSION_SECRET environment variable provided")
  process.exit(1)
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
    resave: false,
    saveUninitialized: false,
    store,
  }),
)

declare module "express-session" {
  interface SessionData {
    authenticated: boolean
    user: { username: string }
  }
}

app.post("/signup", async (req, res) => {
  const result = z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  try {
    const { username, password: unsafePassword } = result.data

    const existingUser = await prisma.user.findUnique({ where: { username } })

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await hash(unsafePassword, 12)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })

    if (user) {
      req.session.authenticated = true
      req.session.user = { username }
      return res.status(201).json(req.session)
    }
  } catch (error) {
    console.error(error)
  }

  return res.status(500).json({ error: "Error creating user" })
})

app.post("/signin", async (req, res) => {
  const result = z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  try {
    const { username, password } = result.data

    const user = await prisma.user.findFirst({
      where: { username },
      select: { password: true },
    })

    if (user && await compare(password, user.password)) {
      req.session.authenticated = true
      req.session.user = { username }
      return res.json(req.session)
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error authenticating the user" })
  }

  return res.status(403).json({ error: "Bad credentials" })
})

app.get("/feed", async (req, res) => {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: req.session?.user?.username },
      select: {
        id: true,
        following: { select: { id: true } },
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const userIds = [user.id, ...user.following.map(({ id }) => id)]

    const feed = await prisma.creditLog.findMany({
      where: { userId: { in: userIds } },
      select: {
        amount: true,
        createdAt: true,
        endLat: true,
        endLng: true,
        startLat: true,
        startLng: true,
        type: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 128,
    })

    return res.json(feed)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error fetching user feed" })
  }
})

app.get("/global_feed", async (req, res) => {
  // User doesn't have to be authenticated in this route.

  try {
    const feed = await prisma.creditLog.findMany({
      select: {
        amount: true,
        createdAt: true,
        endLat: true,
        endLng: true,
        startLat: true,
        startLng: true,
        type: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 128,
    })

    return res.json(feed)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error fetching the feed" })
  }
})

app.get("/follow/:username", async (req, res) => {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  const result = z.object({ username: z.string() }).safeParse(req.params)

  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  const { username } = result.data

  if (req.session?.user?.username === username) {
    return res.status(400).json({ error: "Users cannot follow themselves" })
  }

  try {
    await prisma.user.update({
      where: { username: req.session?.user?.username },
      data: {
        following: { connect: { username } },
      },
    })

    return res.status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error following user" })
  }
})

app.get("/unfollow/:username", async (req, res) => {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  const result = z.object({ username: z.string() }).safeParse(req.params)

  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  const { username } = result.data

  try {
    await prisma.user.update({
      where: { username: req.session?.user?.username },
      data: {
        following: { disconnect: { username } },
      },
    })

    return res.status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error unfollowing user" })
  }
})

app.get("/credit/list", async (req, res) => {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: req.session?.user?.username },
      select: {
        creditLogs: {
          select: {
            amount: true,
            createdAt: true,
            endLat: true,
            endLng: true,
            startLat: true,
            startLng: true,
            type: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.json(user.creditLogs)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error listing credit logs" })
  }
})

app.post("/credit/log", async (req, res) => {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: "User not authenticated" })
  }

  const creditLogSchema = z.object({
    amount: z.number(),
    type: z.string(),
    startLng: z.number(),
    startLat: z.number(),
    endLng: z.number(),
    endLat: z.number(),
  })

  const result = creditLogSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  try {
    const creditLog = await prisma.creditLog.create({
      data: {
        ...result.data,
        user: { connect: { username: `${req.session?.user?.username}` } },
      },
    })

    if (!creditLog) {
      return res.status(500).json({ error: "Error creating credit log" })
    }

    return res.status(201).json({ ...result.data, createdAt: creditLog.createdAt })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Error creating credit log" })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
