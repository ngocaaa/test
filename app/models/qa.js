var Joi = require('joi');

var qaList = {
    body: {
        question:Joi.string().min(10).required(),
        answer: Joi.string().min(1).required(),
    }
}

module.exports = qaList;