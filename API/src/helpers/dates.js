const getFormattedDate = () => {
    const date = new Date(Date.now())
    const HH = (date.getHours()).padStart(2, '0')
    const mm = (date.getMinutes()).padStart(2, '0')
    const DD = (date.getDay()).padStart(2, '0')
    const MM = (date.getMonth() + 1).padStart(2, '0')
    const YYYY = date.getFullYear()

    return `${HH}-${mm}-${DD}-${MM}-${YYYY}`
}

export default getFormattedDate