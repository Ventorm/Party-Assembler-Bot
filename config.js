const dotenv = require("dotenv");
//import _ from 'lodash';

const result = dotenv.config();

//let envs;
const envs = result.parsed;
//if (!('error' in result)) {
//  envs = result.parsed;
//} 
//else {
//  envs = {};
//  _.each(process.env, (value, key) => envs[key] = value);
//}

module.exports = envs;