import {VersionMetadata, VersionFile} from "../entities/supabase.js";
import setRandomFilename from "./files.js";

function verifyVersionMetadata(metadata) {
  if (!(metadata instanceof VersionMetadata)) {
    throw new TypeError("Parameter 'metadata' must be an instance of VersionMetadata");
  }
  console.log(`Processing metadata ${metadata.project_id}: ${metadata.filename}`);
}

function verifyVersionFile(file) {
  console.log(`Processing file ${file.filename}`);
}

function setVersionObjects(body, uploadedFile){
  const filename = setRandomFilename(uploadedFile.originalname)
  const fileBuffer = uploadedFile.buffer
  const fileMimeType = uploadedFile.mimetype

  const metadata = new VersionMetadata(filename, body.description, body.project_id)
  const file = new VersionFile(filename, fileBuffer, fileMimeType)
  return{metadata, file}
}

export {verifyVersionMetadata, verifyVersionFile, setVersionObjects}