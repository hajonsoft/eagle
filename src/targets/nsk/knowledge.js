const util = require("../../util");
const { SELECTORS } = require("./selectors");

const defaultDomain = "https://masar.nusuk.sa";

const config = [
  {
    name: "login",
    url: `${defaultDomain}/pub/login`,
    regex: `${defaultDomain}/pub/login`,
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
    comments:
      "login page, username and password are required then click Sign In button then watch for OTP page",
  },
  {
    name: "contracts",
    url: `${defaultDomain}/umrah/reception/contracts`,
  },
  {
    name: "contracts-list",
    regex: `${defaultDomain}/umrah/contracts/contracts-list`,
  },
  {
    name: "services",
    regex: `${defaultDomain}/nProtected/services`,
  },
  {
    name: "contracts",
    url: `${defaultDomain}/umrah/reception/subeacontracts`,
  },
  {
    name: "groups",
    url: `${defaultDomain}/umrah/mutamer-group/group-list`,
  },
  {
    name: "mutamers",
    regex: `${defaultDomain}/umrah/mutamer/mutamer-list`,
  },
  {
    name: "add-mutamer",
    regex: `${defaultDomain}/umrah/mutamer/add-mutamer`,
  },
  {
    name: "groups",
    url: `${defaultDomain}/ExternalAgencies/Groups`,
  },
  {
    name: "groups",
    url: `${defaultDomain}/ExternalAgencies/Groups/`,
  },
  {
    name: "create-group",
    url: `${defaultDomain}/ExternalAgencies/Groups/CreateGroup`,
    details: [
      {
        selector: SELECTORS.createGroup.groupName,
        value: (row) => util.suggestGroupName(row),
      },
    ],
  },
  {
    name: "create-group",
    url: `${defaultDomain}/ExternalAgencies/ManageSubAgents/CreateGroup`,
    details: [
      {
        selector: SELECTORS.createGroup.groupName,
        value: (row) => util.suggestGroupName(row),
      },
    ],
  },
  {
    name: "passengers",
    //TODO: Check this regex. actual url is umrah/mutamer/add-mutamer
    regex: `${defaultDomain}/ExternalAgencies/(ManageSubAgents|Groups)/EditMuatamerList/`,
    details: [
      {
        selector: SELECTORS.passengers.firstNameAr,
        value: (row) =>
          row?.nameArabic?.first?.match(/[a-zA-Z]/)
            ? ""
            : row?.nameArabic?.first,
      },
      {
        selector: SELECTORS.passengers.thirdNameAr,
        value: (row) =>
          row?.nameArabic?.grand?.match(/[a-zA-Z]/)
            ? ""
            : row?.nameArabic?.grand,
      },
      {
        selector: SELECTORS.passengers.familyNameAr,
        value: (row) =>
          row?.nameArabic?.last?.match(/[a-zA-Z]/) ? "" : row?.nameArabic?.last,
      },
      {
        selector: SELECTORS.passengers.secondNameAr,
        value: (row) =>
          row?.nameArabic?.father?.match(/[a-zA-Z]/)
            ? ""
            : row?.nameArabic?.father,
      },
      {
        selector: SELECTORS.passengers.birthCity,
        value: (row) =>
          decodeURI(row.birthPlace?.replace(/,/, " ")) || row.nationality.name,
      },
      {
        selector: SELECTORS.passengers.maritalStatus,
        value: () => "99",
      },
      {
        selector: SELECTORS.passengers.birthCountry,
        value: (row) => util.getIssuingCountry(row)?.telCode,
      },
      {
        selector: SELECTORS.passengers.issueCountry,
        value: (row) => util.getIssuingCountry(row)?.telCode,
      },
      {
        selector: SELECTORS.passengers.job,
        value: (row) => decodeURI(row.profession) || "Employee",
      },
      {
        selector: SELECTORS.passengers.mobileCountryKey,
        value: (row) => row.nationality.telCode,
      },
      {
        selector: SELECTORS.passengers.mobileNo,
        value: (row) =>
          row.phone || new Date().valueOf().toString().substring(0, 10),
      },
    ],
  },
];

module.exports = { defaultDomain, config };
