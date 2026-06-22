class VersionMetadata {
    constructor(filename, description, project_id)
    {
        this.filename = filename
        this.description = description
        this.project_id = project_id
    }
}

class VersionFile{
    constructor(filename, fileBuffer, mimetype){
        this.filename = filename
        this.fileBuffer = fileBuffer
        this.mimetype = mimetype
    }
}

export {VersionMetadata, VersionFile}