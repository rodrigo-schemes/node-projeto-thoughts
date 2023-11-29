const express = require("express")
const exphbs = require("express-handlebars")
const session = require("express-session")
const FileStore = require("session-file-store")(session)
const flash = require("express-flash")

const app = express()
const conn = require("./db/conn")

// Models
const Thought = require("./models/Thought")
const User = require("./models/User")

// routes
const thoughtsRoutes = require("./routes/thoughtsRoutes")
const authRoutes = require("./routes/authRoutes")

// controllers
const ThoughtController = require("./controllers/ThoughtController")

// template engine
app.engine("handlebars", exphbs.engine())
app.set("view engine", "handlebars")

//session middleware
app.use(
  session({
    name: 'session',
    secret: 'nosso_secret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 3600000,
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    },
  }),
)

// flash messages
app.use(flash())

// Recupera sessão e coloca na response
app.use((req, res, next) => {

  if (req.session.userid) {
    res.locals.session = req.session;
  }

  next()
})

// configs express
app.use(express.json())

app.use(
  express.urlencoded({
    extended: true,
  })
)

app.use(express.static("public"))

// Routes
app.use('/thoughts', thoughtsRoutes)
app.use('/', authRoutes)
app.get('/', ThoughtController.showThoughts)

// sync sequelize
conn
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err))