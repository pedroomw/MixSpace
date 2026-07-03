class VerifiersMiddleware{
    verifyVersion = async (req, res, next) => {
        try{
            const {project_id, description, filename} = req.body
            if(!project_id) {
                throw new Error("Project_ID is needed")
            }
            if(!description) {
                throw new Error("Description is needed")
            }
            if(!filename) {
                throw new Error("Filename is needed")
            }
            next()
        }
        catch(error){
            throw (error)
        }
    }
}

export default VerifiersMiddleware