const State = require('../model/State');
const jsonData = require('../model/statesData.json'); 

const getAllstates = async (req, res) => {

    if(req?.query?.contig == 'true') {
        const jsonStates = jsonData.filter(state => state.admission_number < 49);
        return res.json(jsonStates);
    }

    if(req?.query?.contig == 'false') {
        const jsonStates = jsonData.filter(state => state.admission_number > 48);
        return res.json(jsonStates);
    }

    //store all data from MongoDB in a mongoData
    const mongoData = await State.find();

    jsonData.forEach((jsonState) => {
        const mongoState = mongoData.find((state) => state.stateCode == jsonState.code);
        if(mongoState){ //exists
            //store funfacts in an array
            const factArray = mongoState.funfacts;
            //check for an array that is not empty
            if(factArray.length !== 0){
                //append new property containing facts from array
                jsonState.funfacts = [...factArray];
            }
        }
    }); 
    
    
    if (!jsonData) return res.status(204).json({ 'message': 'No states found.' });
    res.json(jsonData);
}

const getState = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });

    const mongoState = await State.findOne({ stateCode: req.params.state }, { _id: 0} ).exec();
    
    const jsonState = jsonData.find((state) => state.code === req.params.state);

    if (mongoState){ //mongoState exists
        //store funfacts in an array
        const factArray = mongoState.funfacts;
        //check for an array that is not empty
        if(factArray.length !== 0){
            //append new property containing facts from array
            jsonState.funfacts = [...factArray];
        }
    }
    
    res.json(jsonState);
}

const getCapital = async (req, res) => {
    const state = jsonData.find((state) => state.code === req.params.state);
    res.json({
        state: state.state,
        capital: state.capital_city
    });
}

const getNickname = async (req, res) => {
    const state = jsonData.find((state) => state.code === req.params.state);
    res.json({
        state: state.state,
        nickname: state.nickname
    });
}

const getPopulation = async (req, res) => {
    const state = jsonData.find((state) => state.code === req.params.state);
    res.json({
        state: state.state,
        population: state.population.toLocaleString("en-US")
    });
}

const getAdmission = async (req, res) => {
    const state = jsonData.find((state) => state.code === req.params.state);
    res.json({
        state: state.state,
        admitted: state.admission_date
    });
}

const getFunFact = async (req, res) => {
    
    const mongoData = await State.find();

    const factArray = mongoData.find((state) => state.stateCode == req.params.state)?.funfacts;

    //get full name
    const stateName = jsonData.find(state => state.code === req.params.state).state;

    if (!factArray) {
        return res.status(404).json({ "message": `No Fun Facts found for ${stateName}`});
    }
    
    res.json({
        'funfact' : factArray[Math.floor(Math.random() * factArray.length)]
    });
}

const createFunFact = async (req, res) => {
    if (!req?.body?.funfacts) {
        return res.status(400).json({ 'message': 'State fun facts value must be an array' });
    }

    const mongoState = await State.findOne({stateCode: req.params.state}).exec();

    try {
        if(!mongoState){
            const result = await State.create({
                stateCode: req.params.state,
                funfacts: req.body.funfacts
            });

            res.status(201).json(result);
        }
        else{
            mongoState.funfacts.push(...req.body.funfacts);
            
            const result = await mongoState.save();
            res.status(201).json(result);
        }
    } catch (err) {
        console.error(err);
    }
}

const updateFunFact = async (req, res) => {
    if (!req?.body?.index) 
        return res.status(400).json({ 'message': 'State fun fact index value required' });

    if (!req?.body?.funfact) 
        return res.status(400).json({ 'message': 'State fun facts value required' });

    const mongoState = await State.findOne({stateCode: req.params.state}).exec();

    const factArray = mongoState.funfacts;

    if(!factArray) {
        return res.status(404).json({"message": `No Fun Facts found for ${req.params.state}`});
    }
    
    if(!factArray[parseInt(req.body.index) - 1]) {
        return res.status(404).json({"message": `No Fun Fact found at ${req.body.index} for ${req.params.state}`});
    }

    mongoState.funfacts[parseInt(req.body.index) - 1] = req.body.funfact;

    const result = await mongoState.save();
    res.json(result);

}

const deleteFunFact = async (req, res) => {

    if(!req.body.index) {
        return res.status(400).json({"message": "State fun fact index value required"});
    }

    const mongoState = await State.findOne({stateCode: req.params.state}).exec();

    //get full name 
    const stateName = jsonData.find(state => state.code === req.params.state).state;
    
    if(!mongoState?.funfacts) {
        return res.status(404).json({"message": `No Fun Facts found for ${stateName}`});
    }

    if(!mongoState?.funfacts[parseInt(req.body.index) - 1]) {
        return res.status(404).json({"message": `No Fun Fact found at ${req.body.index} for ${stateName}`});
    }

    mongoState?.funfacts.splice(parseInt(req.body.index) - 1, 1);

    const result = await mongoState.save();
    res.json(result);
}

module.exports = {
    getAllstates,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    getFunFact,
    createFunFact,
    updateFunFact,
    deleteFunFact
}