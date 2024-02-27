const express = require('express')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const compression = require('compression')
const cors = require('cors')
const passport = require('passport')
const httpStatus = require('http-status')
const config = require('./config/config')
const morgan = require('./config/morgan')
const { jwtStrategy } = require('./config/passport')
const { authLimiter } = require('./middlewares/rateLimiter')
const multipartFormParser = require('express-fileupload')
const routes = require('./routes/v1')
const { errorConverter, errorHandler } = require('./middlewares/error')
const ApiError = require('./utils/ApiError')

// crons
require('./crons')

//file size limit in bytes
const maxFileSizeLimit = 20000000 // 20 mb

const app = express()

if (config.env !== 'test') {
  app.use(morgan.successHandler)
  app.use(morgan.errorHandler)
}

// set security HTTP headers
app.use(helmet())

// parse plain text request body
app.use(express.text())

// parse json request body
app.use(express.json())

// parse multipart form
app.use(
  multipartFormParser({
    limits: {
      fieldSize: maxFileSizeLimit
    },
    parseNested: true,
    defParamCharset: 'utf8'
  })
)

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }))

// sanitize request data
app.use(xss())
app.use(mongoSanitize())

// gzip compression
app.use(compression())

let allowedOrigins = []

if (process.env.NODE_ENV === 'development') {
  allowedOrigins = ['http://localhost:3000', 'http://localhost:3001']
} else {
  allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',')
}

const corsOptions = {
  origin: (origin, callback) =>
    allowedOrigins.includes(origin) || !origin
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS'))
}

// enable cors
app.use(cors(corsOptions))
app.options('*', cors())

// jwt authentication
app.use(passport.initialize())
passport.use('jwt', jwtStrategy)

// public files
app.use(express.static(`${__dirname}/../public`))

app.use('/user/self', express.static(`${__dirname}/../uploads/users/settings`))

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter)
}

// v1 api routes
app.use('/v1', routes)

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)

module.exports = app
