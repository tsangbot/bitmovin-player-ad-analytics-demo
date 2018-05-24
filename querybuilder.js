import Bitmovin from 'bitmovin-javascript';
import yargs from "yargs";

const argv  = yargs.option(
    'interval', {
        alias: 'i',
        describe: 'choose a range from "MINUTE, HOUR, DAY, MONTH"',
        choices: ['MINUTE', 'HOUR', 'DAY', 'MONTH'],
        demand: true
    }
).option(
    'daysToLookback',{
        alias: 'd',
        describe: 'day(s) to look include for impression lookup',
        default: 1,
        type: 'number',
        demand: true
    }
).option(
    'metric',{
        alias: 'm',
        describe: 'choose a specific mertric "IMPRESSION_ID","USER_ID","PLAYED"',
        choices: ['IMPRESSION_ID','USER_ID','PLAYED'],
        demand: true
    }
).argv;

// BITMOVING KEY(S)
const BITMOVIN_API_KEY = 'd8e098d1-85e3-4b49-aa13-f8ac8acb443c';


console.log(argv.interval, argv.daysToLookback, argv.metric);

const moment = require('moment');
const bitmovin = new Bitmovin({ apiKey: BITMOVIN_API_KEY });
const queryBuilder = bitmovin.analytics.queries.builder;

const query = queryBuilder.count(argv.metric)
  .between(moment().subtract(argv.daysToLookback, 'day').toDate(), moment().toDate())
  .interval(argv.interval)
  .query();// this returns a JavaScript Promise

query.then((results) => {
  // results.rows contains the result set
  // result.columnLabels contains a description of what the array rows represent
  console.log(results.rows);
});