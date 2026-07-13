import path from "path"
import getFormattedDate from '../helpers/dates.js'
import express from 'express'

class fileMiddleware{
    setFilename = async (req, res, next) => {
        if(!req.file){
            return res.status(400).json({
                error: "No se recibió un archivo"
            })
        }

        const filename = `${getFormattedDate()}-${Math.random().toString(36).slice(2,8)}${path.extname(req.file.originalname)}`
        req.body.filename = filename
        next();
    }
}

export default fileMiddleware