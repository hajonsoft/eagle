const { SELECTORS } = require("./selectors");

const defaultDomain = "https://hajonsoft-kea.web.app";
const loginUrl = `${defaultDomain}/login`;

const config = [
  {
    name: "home",
    url: `${defaultDomain}`,
    regex: `^${defaultDomain.replace(/\./g, "\\.")}/?$`,
  },
  {
    name: "login",
    url: loginUrl,
    regex: `^${loginUrl.replace(/\./g, "\\.")}/?$`,
    details: [
      {
        selector: SELECTORS.login.username,
        value: (row) => row.username,
      },
      {
        selector: SELECTORS.login.password,
        value: (row) => row.password,
      },
    ],
  },
];

module.exports = { config, defaultDomain, loginUrl };
