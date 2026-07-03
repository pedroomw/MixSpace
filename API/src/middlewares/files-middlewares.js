import path from "path"
import getFormattedDate from '../helpers/dates.js'
import express from 'express'

class fileMiddleware{
    setFilename = async (req, res, next) => {
        const filename = `${getFormattedDate()}-${Math.random().toString(36).slice(2,8)}${path.extname(req.file.originalname)}`
        req.body.filename = filename
        next();
    }
}

export default fileMiddleware