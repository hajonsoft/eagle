const { SELECTORS } = require("./selectors");
const countryCodes = require("./data/country-codes.json");

const defaultDomain = "https://visa.visitsaudi.com";
const printVisaDomain = "https://visa.mofa.gov.sa";

const countryAliases = {
  "korea, south": "korea , south",
  "south korea": "korea , south",
  "republic of korea": "korea , south",
  "hong kong": "hong kong china",
  "macao": "macau china",
  "macao china": "macau china",
  usa: "united states",
  uk: "united kingdom",
};

function normalizeCountryName(country) {
  return String(country || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getCountryCode(country) {
  if (!country) {
    return undefined;
  }

  const normalizedCountry = normalizeCountryName(country);
  const lookupKey = countryAliases[normalizedCountry] || normalizedCountry;
  const countryCode = countryCodes[lookupKey];
  console.log(`Country: ${country}, Code: ${countryCode}`);
  return countryCode;
}

const config = [
  {
    name: "login",
    url: `${defaultDomain}/Login`,
    details: [
      { selector: SELECTORS.login.username, value: (system) => system.username },
      { selector: SELECTORS.login.password, value: (system) => system.password },
    ],
  },
  {
    name: "print-visa",
    url: `${printVisaDomain}/visaservices/searchvisa`,
  },
  {
    name: "otp",
    url: `${defaultDomain}/Login/OTPAuth`,
  },
  {
    name: "group",
    url: `${defaultDomain}/Visa/Index`,
  },
  {
    name: "personal",
    regex: `${defaultDomain}/Visa/PersonalInfo\\?(gName|gid)=`,
    url: `${defaultDomain}/Visa/PersonalInfo?gName`,
    details: [
      { selector: SELECTORS.personal.firstNameEnglish, value: (row) => row.name.first },
      { selector: SELECTORS.personal.lastNameEnglish, value: (row) => row.name.last },
      {
        selector: SELECTORS.personal.fatherNameEnglish,
        value: (row) => (row?.name?.father + row?.name?.grand)?.trim(),
      },
      {
        selector: SELECTORS.personal.gender,
        value: (row) => (row.gender === "Male" ? "1" : "2"),
      },
      { selector: SELECTORS.personal.socialStatus, value: () => "5" },
      {
        selector: SELECTORS.personal.nationality,
        value: (row) => getCountryCode(row.nationality.name),
      },
      {
        selector: SELECTORS.personal.countryOfBirth,
        value: (row) => getCountryCode(row.nationality.name),
      },
      {
        selector: SELECTORS.personal.country,
        value: (row) => getCountryCode(row.nationality.name),
      },
      {
        selector: SELECTORS.personal.cityOfBirth,
        value: (row) => row.birthPlace || row.nationality.name,
      },
      {
        selector: SELECTORS.personal.profession,
        value: (row) => row.profession || "unknown",
      },
      {
        selector: SELECTORS.personal.city,
        value: (row) => row.address || 'main',
      },
      {
        selector: SELECTORS.personal.postalCode,
        value: (row) => row.passportNumber.substring(0, 5),
      },
      {
        selector: SELECTORS.personal.address,
        value: (row) => row.address,
        autocomplete: "visaAddress",
        defaultValue: "123 main street",
      },
    ],
  },
  {
    name: "passport",
    url: `${defaultDomain}/Visa/PassportInfo`,
    regex: `${defaultDomain}/Visa/PassportInfo/[A-Za-z0-9-]+`,
    details: [
      { selector: SELECTORS.passport.passportNumber, value: (row) => row.passportNumber },
      { selector: SELECTORS.passport.passportIssuePlace, value: (row) => row.placeOfIssue },
      {
        selector: SELECTORS.passport.placeOfResidence,
        value: (row) => row?.extraData?.ksaResidence?.nameOfPerson,
        autocomplete: "PlaceOfResidence",
        defaultValue: "Mohamed Mohamed",
      },
      { selector: SELECTORS.passport.cityId, value: () => "33" },
      {
        selector: SELECTORS.passport.address1,
        value: () => "",
        autocomplete: "visaAddress1",
        defaultValue: "123 main street",
      },
    ],
  },
  {
    name: "insurance",
    url: `${defaultDomain}/Insurance/ChooseInsurance`,
    regex: `${defaultDomain}/Insurance/ChooseInsurance/[A-Za-z0-9-]+`,
  },
  {
    name: "terms",
    url: `${defaultDomain}/Visa/Terms`,
    regex: `${defaultDomain}/Visa/Terms/[A-Za-z0-9-]+`,
  },
  {
    name: "review",
    url: `${defaultDomain}/Visa/Review`,
    regex: `${defaultDomain}/Visa/Review/[A-Za-z0-9-]+`,
  },
  {
    name: "screenshot",
    url: `${printVisaDomain}/Home/PrintEventVisa`,
  },
];

module.exports = {
  defaultDomain,
  printVisaDomain,
  config,
  getCountryCode,
};
