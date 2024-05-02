const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*The Schema will have a stateCode property which is:
    a string
    required
    Unique
The Schema will also have a funfacts property which is: 
    an array that contains string data
*/

const stateSchema = new Schema({
    stateCode: {
      type: String,
      required: true,
      unique: true
    },
    funfacts: {
      type: [String],
    }
  });

//Shared by Dave Gray on Discord
module.exports = mongoose.model('State', stateSchema);