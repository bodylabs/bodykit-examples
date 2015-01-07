var crypto = require('crypto');

var generateAuthHeader = function (accessKey, apiSecret, expiresAfterSeconds, actions) {
    var expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expiresAfterSeconds); 

    var policy = {
            expires: expirationDate.toISOString(),
            actions: actions
    };
    policy = JSON.stringify(policy);

    //hashing to generate signature
    signature = crypto.createHash('md5').update(apiSecret + policy).digest('hex'); 
    
    //construct header
    header = 'ACL accesskey=' + accessKey + ',signature=' + signature + ',policy=' + policy;

    return {Authorization: header};
};

module.exports = generateAuthHeader;