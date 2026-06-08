const getFormattedDate = () => {
    const date = new Date(Date.now())
    const HH = date.getHours().toString().padStart(2, "0")
    const mm = date.getMinutes().toString().padStart(2, "0")
    const DD = date.getDate().toString().padStart(2, "0")
    const MM = (date.getMonth() + 1).toString().padStart(2, "0")
    const YYYY = date.getFullYear()

    return `${DD}-${MM}-${YYYY}-${HH}-${mm}`
}

export default getFormattedDate