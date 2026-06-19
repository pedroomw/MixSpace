import Version from "../entities/supabase.js";

function verifyVersion(version) {
  if (!(version instanceof Version)) {
    throw new TypeError("Parameter 'version' must be an instance of Version");
  }
  console.log(`Processing version ${version.projectId}: ${version.filename}`);
}

export default verifyVersion