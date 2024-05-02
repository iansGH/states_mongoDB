//Import statesData.json file 
const statesData = require('../model/statesData.json'); 

//Get parameter from request (should be a state abbreviation) and set it to uppercase
const verifyStates = (req, res, next) => {
  stateCode = req?.params?.state?.toUpperCase();

  //Map() over the JSON data to create an array of only the state abbreviations.
  const stateCodeArray = statesData.map((state) => state.code);

  //Find() if the state abbreviation in the array of state codes.
  const validState = stateCodeArray.find(code => code === stateCode);

  // If invalid, return a bad request status with the required message.
  if (!validState) {
      return res.status(400).json({ message: 'State abbreviation required' });
    }
  // If valid, attach the verified code to the request object: req.code = stateCode and call next() to move on.
  req.params.state = stateCode;
  
  //Call next() to move from the middleware to what is next.
  next();
}

module.exports = verifyStates;
