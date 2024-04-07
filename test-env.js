import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
console.log(result.parsed); // This should log the object of parsed variables if successful.
