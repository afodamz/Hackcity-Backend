require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const postsRouter = require('./routes/post.routes');
const categoriesRouter = require('./routes/categories.routes');
const usersRouter = require('./routes/users.routes');
const passwordRouter = require('./routes/password.routes');

const AppResponseDto = require('./dtos/responses/app_response.dto');

const app = express();

app.use(cors({
    methods: ['GET','POST','DELETE','PUT'],
    origin: ['http://localhost:3000',],
    // origin: "*",
    optionsSuccessStatus: 200,
    credentials: true,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// To check app health
app.get("/", (req, res) => {
    console.log("here done")
    return res.json({
        success: true,
        datatype: 'APP HEALTH',
        message: "App is working fine"
    })
});

app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/password', passwordRouter);
app.use('/api/v1/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // handle error response
    res.status(err.status || 500);
    res.json(AppResponseDto.buildWithErrorMessages(err));
});

module.exports = app;
