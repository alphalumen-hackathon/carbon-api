import { PrismaClient } from "@prisma/client"
import { compare, hash } from "bcrypt"
import { config } from "dotenv"
import express from "express"
import session from "express-session"

config({ path: ".env" })

const prisma = new PrismaClient()
const app = express()
const store = new session.MemoryStore()

app.use(express.json())

app.use(
  session({
    secret: "your-secret-key",
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
  const { username, password: unsafePassword } = req.body

  try {
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

  res.status(500).send("Error creating user")
})

app.post("/signin", async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await prisma.user.findFirst({
      where: { username },
    })

    if (user) {
      if (await compare(password, user.password)) {
        req.session.authenticated = true
        req.session.user = { username }
        return res.json(req.session)
      }
    }

  } catch (error) {
    console.error(error)
    return res.status(500).send("Error authenticating the user")
  }

  res.status(403).send("Bad credentials")
})

app.get("/feed", async (req, res) => {
  if (!req.session.authenticated) {
    res.status(401).send("User not authenticated")
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: req.session.user.username },
      select: { id: true, following: { select: { id: true } } },
    })

    if (!user) {
      return res.status(404).send("User not found")
    }

    const feed = await prisma.creditLog.findMany({
      where: { userId: { in: [user.id, ...user.following.map(({ id }) => id)] } },
      select: {
        amount: true,
        createdAt: true,
        endAddr: true,
        endLat: true,
        endLng: true,
        startAddr: true,
        startLat: true,
        startLng: true,
        type: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 128,
    })

    res.json(feed)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error fetching user feed")
  }
})

app.get("/follow/:username", async (req, res) => {
  if (!req.session.authenticated) {
    res.status(401).send("User not authenticated")
  }

  const { username } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.session.user.username,
      },
    })

    if (!user) {
      return res.status(404).send("User not found")
    }

    const targetUser = await prisma.user.findUnique({ where: { username } })

    if (!targetUser) {
      return res.status(404).send("Target user not found")
    }

    if (targetUser.id == user.id) {
      return res.status(400).send("Users cannot follow themselves")
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        following: { connect: { id: targetUser.id } },
      },
    })

    res.status(200).send("User followed successfully")
  } catch (error) {
    console.error(error)
    res.status(500).send("Error following user")
  }
})

app.get("/credit/list", async (req, res) => {
  if (!req.session.authenticated) {
    res.status(401).send("User not authenticated")
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.session.user.username,
      },
      include: {
        creditLogs: true,
      },
    })

    if (!user) {
      return res.status(404).send("User not found")
    }

    res.json(user.creditLogs)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error listing credit logs")
  }
})

app.post("/credit/log", async (req, res) => {
  if (!req.session.authenticated) {
    res.status(401).send("User not authenticated")
  }

  const { amount, type, startLng, startLat, startAddr, endLng, endLat, endAddr }
    = req.body

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.session.user.username,
      },
    })

    if (!user) {
      return res.status(404).send("User not found")
    }

    const creditLog = await prisma.creditLog.create({
      data: {
        amount,
        type,
        startLng,
        startLat,
        startAddr,
        endLng,
        endLat,
        endAddr,
        userId: user.id,
      },
    })

    res.status(201).json(creditLog)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error creating credit log")
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
