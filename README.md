# bitmovin-player-ad-analytics-demo

[![bitmovin](http://bitmovin-a.akamaihd.net/webpages/bitmovin-logo-github.png)](http://www.bitmovin.com)
[![codecov](https://codecov.io/gh/bitmovin/bitmovin-javascript/branch/develop/graph/badge.svg?token=XNzQalljOE)](https://codecov.io/gh/bitmovin/bitmovin-javascript)
[![npm version](https://badge.fury.io/js/bitmovin-javascript.svg)](https://badge.fury.io/js/bitmovin-javascript)
[![Build Status](https://travis-ci.org/bitmovin/bitmovin-javascript.svg?branch=develop)](https://travis-ci.org/bitmovin/bitmovin-javascript)

Overview
---------
This repo contains 3 demos created to cover the use case exercise

- Adverting Scheduling and Analytics with Bitmovin Player - index.html
- Multi-codec Streaming H.264/HEVC/VP9  with Bitmomovin Player - multi-codec.html
- A simple analytic query builder built using [JavaScript Client](https://github.com/bitmovin/bitmovin-javascript) which integrates with [Bitmovin API](https://bitmovin.com/video-infrastructure-service-bitmovin-api/)

Demo Set Up
------------
Have a think about where you want to clone this repo in, ideally you want this to be in the document root of the apache server running on the desire machine. If you have an IDE with browser plugin, you might not have to worry about this.

If you are like myself running on a MAC (which has pre-installed apache), then you can easily set up an apache instance and edit ```/etc/apache2/httpd.conf ```. Alternatively you can install apache2 via homebrew and you can start the service by ```brew services start httpd```, the document root would be set up on ```/usr/local/var/www```. 




To use this demo, you must posses an account with Bitmovin.[Sign up](https://dashboard.bitmovin.com/signup)for a trial account.
Once you have set up your account, find retrieve the 3 keys 

- [Bitmovin API Key ](https://dashboard.bitmovin.com/account)
- [Bitmovin Player Key](https://dashboard.bitmovin.com/player/licenses/)
- [Bitmovin Analytics key](https://dashboard.bitmovin.com/analytics/licenses)


You will need and replace them in these files.

- index.html
- multi-codec.html
- queryBuilder.js

```js
    // BITMOVING KEY(S)
    const BITMOVIN_API_KEY = '<-YOUR-API-KEY-HERE->';
    const BITMOVIN_PLAYER_KEY = '<-YOUR-PLAYER-KEY-HERE->';
    const BITMOVIN_ANALYTICS_KEY = '<-YOUR-ANALYTIC-KEY-HERE->';
```

By default 127.0.0.1 localhost should already be whitelisted but just in case double check the setup.
- [Bitmovin Analytic Guide](https://developer.bitmovin.com/hc/en-us/articles/115004395493-Getting-started-with-Bitmovin-Analytics) 
- [Bitmovin Player Guide](https://developer.bitmovin.com/hc/en-us/articles/115001503313-Get-Started-with-the-Bitmovin-Player)


Once you have all the above set up, open up a browser and hit 127.0.0.1:8080 


Full[Bitmovin API reference](https://bitmovin.com/encoding-documentation/bitmovin-api/) can be found on their website.


queryBuilder.js
--------------
This is a JS script example which queries using Bitmovin API for data analytic collected from the analytic JS client embedded in the player.

Once you have it set up, following the steps below you can query by running the following command.
```bash
babel-node querybuilder.js
Options:
  --interval, -i        choose a range from "MINUTE, HOUR, DAY, MONTH"
                                                                      [required]
  --daysToLookback, -d  day(s) to look include for impression lookup
                                                         [required] [default: 1]
  --metric, -m          choose a specific mertric "IMPRESSION_ID","USER_ID","
                        PLAYED"                                       [required]

```

The script expects 2 arugments to be passed
- interval
- daysToLookback
- metric
 
 ```bash
babel-node querybuilder.js --i "HOUR" --m "PLAYED"
HOUR 1 PLAYED
[ [ 1527120000000, 124 ],
  [ 1527181200000, 26 ],
  [ 1527105600000, 44 ],
  [ 1527123600000, 1 ],
  [ 1527109200000, 104 ],
  [ 1527102000000, 22 ] ]
```


JavaScript Client Installation - Prerequisites for queryBuilder.js  
-------------------------------

``` bash
npm install bitmovin-javascript
```
or with yarnpkg
``` bash
yarn add bitmovin-javascript
```

Initialization
----------

With Babel/ES6:
```es6
import Bitmovin from 'bitmovin-javascript';
const bitmovin = new Bitmovin({'apiKey': BITMOVIN_API_KEY, debug: false});
```

With NodeJS:

```js
const Bitmovin = require('bitmovin-javascript').default;
const bitmovin = new Bitmovin({'apiKey': BITMOVIN_API_KEY, debug: false});
```



Other API Usage
-----------

The Bitmovin-Javascript API Client is closely modeled after with Bitmovin API Reference [Bitmovin API](https://bitmovin.com/encoding-documentation/bitmovin-api/).
Each resource in the API Reference has a 1:1 mapping in API Client.

All methods return a `Promise` Object that will return the fetched result values from the API.

So for example the list all inputs call is defined as `GET v1/encoding/inputs` in our API-Reference and simply corresponds to:

```js
const limit = 100;
const offset = 0;
bitmovin.encoding.inputs.list(limit, offset).then((inputs) => {
  inputs.forEach((input) => {
    console.log(input.name);
  });
});
```

Examples
-----------

An sample DASH & HLS encoding sample can be found in [examples/encoding/01_simple_encoding_dash_manifest.js](https://github.com/bitmovin/bitmovin-javascript/blob/develop/examples/encoding/01_simple_encoding_dash_manifest.js)

For more examples visit this [example page](https://github.com/bitmovin/bitmovin-javascript/tree/develop/examples/encoding) or look at the [integration tests](https://github.com/bitmovin/bitmovin-javascript/tree/develop/tests_it)


