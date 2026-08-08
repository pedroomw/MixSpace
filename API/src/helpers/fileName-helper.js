import path from "path"
import getFormattedDate from './dates.js'
import express from 'express'

const setFileName = (originalName)=> {
        const filename = `${getFormattedDate()}-${Math.random().toString(36).slice(2,8)}${path.extname(req.file.originalname)}`
        return filename
    }

export default setFileName