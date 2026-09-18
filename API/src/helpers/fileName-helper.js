import path from "path"
import getFormattedDate from './dates.js'

const setFileName = (originalName) => {
    const filename = `${getFormattedDate()}-${Math.random().toString(36).slice(2,8)}${path.extname(originalName)}`
    return filename
}

export default setFileName