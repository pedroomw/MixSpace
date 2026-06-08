import getFormattedDate from './dates.js'

const setRandomFilename = (originalName) => {
    let filename = getFormattedDate() + '-' + Math.random().toString(36).slice(2,8) + path.extname(originalName)
    return filename
}

export default setRandomFilename