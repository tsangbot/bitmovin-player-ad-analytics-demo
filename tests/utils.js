const settings = {
  apiKey: 'test-api-key',
  tenantOrgId: 'test-org-id'
};

const getConfiguration = () => {
  return {
    apiBaseUrl : 'https://api.bitmovin.com/v1/',
    httpHeaders: {
      'Content-Type'        : 'application/json',
      'X-Api-Key'           : settings.apiKey,
      'X-Tenant-Org-Id'     : settings.tenantOrgId,
      'X-Api-Client'        : 'bitmovin-javascript',
      'X-Api-Client-Version': '1.1.20'
    },
    eMail: settings.eMail,
    password: settings.password
  };

};

module.exports = {
  getConfiguration
};
