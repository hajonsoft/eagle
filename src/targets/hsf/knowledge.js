const path = require("path");
const { homedir } = require("os");
const { hsf_nationalities } = require("../../data/nationalities");
const { SELECTORS } = require("./selectors");

const defaultDomain = "https://visa.mofa.gov.sa";
const downloadsFolder = path.join(homedir(), "Downloads");

function getNationalityCode(name) {
  return hsf_nationalities.find((nationality) => nationality.name === name)
    ?.value;
}

const config = [
  {
    name: "print-visa",
    url: `${defaultDomain}/visaservices/searchvisa`,
    controller: {
      name: "searchVisa",
      selector: SELECTORS.printVisa.controllerMount,
      visaPath: `Downloading to: ${downloadsFolder}`,
    },
  },
  {
    name: "login",
    url: `${defaultDomain}/Account/HajSmartForm`,
    details: [
      {
        selector: SELECTORS.login.mofaNumber,
        value: (row) => row.mofaNumber,
      },
      {
        selector: SELECTORS.login.passportNumber,
        value: (row) => row.passportNumber,
      },
      {
        selector: SELECTORS.login.nationality,
        value: (row) => row.nationality.code,
      },
    ],
  },
  {
    name: "print-haj-visa",
    url: `${defaultDomain}/Home/PrintHajVisa`,
  },
  {
    name: "print-event-visa",
    url: `${defaultDomain}/Home/PrintEventVisa`,
  },
  {
    name: "print-tour-visa",
    url: `${defaultDomain}/Home/PrintTourVisit`,
  },
  {
    name: "agreement",
    url: `${defaultDomain}/HajSmartForm/ElectronicAgreement`,
  },
  {
    name: "step1",
    regex: `${defaultDomain}/HajSmartForm/Step1`,
  },
  {
    name: "step2",
    regex: `${defaultDomain}/HajSmartForm/Step2/\\d+`,
    details: [
      {
        selector: "#AddressContactInfoModel_Address",
        value: (row) => row.address,
      },
      {
        selector: "#AddressContactInfoModel_HomePhone",
        value: (row) => row.phone,
      },
      {
        selector: "#AddressContactInfoModel_Mobile",
        value: (row) => row.phone,
      },
      {
        selector: "#AddressContactInfoModel_ZipCode",
        value: (row) => row.postalcode,
      },
      {
        selector: "#AddressContactInfoModel_POBox",
        value: (row) => row.pobox,
      },
      {
        selector: "#JobModel_Profession",
        value: (row) => row.profession || "unknown",
      },
      {
        selector: "#JobModel_CurrentJob",
        value: (row) => row.profession,
      },
      {
        selector: "#SOCIAL_STATUS",
        value: () => "5",
      },
      {
        selector: "#FlightDataModel_TransportModeID",
        value: () => "2",
      },
    ],
  },
  {
    name: "step3",
    regex: `${defaultDomain}/HajSmartForm/Step3/\\d+`,
  },
  {
    name: "step4",
    regex: `${defaultDomain}/HajSmartForm/Step4/\\d+`,
  },
  {
    name: "add",
    regex: `${defaultDomain}/HajSmartForm/Add`,
    details: [
      {
        selector: SELECTORS.add.arabicFirstName,
        value: (row) => row.nameArabic.first,
      },
      {
        selector: SELECTORS.add.arabicFamilyName,
        value: (row) => row.nameArabic.last,
      },
      {
        selector: SELECTORS.add.arabicGrandName,
        value: (row) => row.nameArabic.grand,
      },
      {
        selector: SELECTORS.add.arabicFatherName,
        value: (row) => row.nameArabic.father,
      },
      {
        selector: SELECTORS.add.englishFirstName,
        value: (row) => row.name.first,
      },
      {
        selector: SELECTORS.add.englishFatherName,
        value: (row) => row.name.father,
      },
      {
        selector: SELECTORS.add.englishGrandName,
        value: (row) => row.name.grand,
      },
      {
        selector: SELECTORS.add.englishFamilyName,
        value: (row) => row.name.last,
      },
      {
        selector: SELECTORS.add.passportNumber,
        value: (row) => row.passportNumber,
      },
      {
        selector: SELECTORS.add.birthPlace,
        value: (row) => decodeURI(row.birthPlace),
        autocomplete: "birthPlace",
      },
      {
        selector: SELECTORS.add.passportIssuePlace,
        value: (row) => decodeURI(row.placeOfIssue),
        autocomplete: "passportIssuePlace",
      },
      {
        selector: SELECTORS.add.profession,
        value: (row) => decodeURI(row.profession),
        autocomplete: "profession",
      },
      {
        selector: SELECTORS.add.degree,
        value: () => "",
        autocomplete: "degree",
      },
      {
        selector: SELECTORS.add.degreeSource,
        value: () => "",
        autocomplete: "degreeSource",
      },
      {
        selector: SELECTORS.add.homeAddress,
        value: () => "",
        autocomplete: "homeAddress",
      },
      { selector: SELECTORS.add.passportType, value: () => "680" },
      {
        selector: SELECTORS.add.nationality,
        value: (row) => getNationalityCode(row.nationality.name),
      },
      {
        selector: SELECTORS.add.firstNationality,
        value: (row) => getNationalityCode(row.nationality.name),
      },
      { selector: SELECTORS.add.religion, value: () => "1" },
      { selector: SELECTORS.add.socialStatus, value: () => "5" },
      {
        selector: SELECTORS.add.gender,
        value: (row) => (row.gender === "Male" ? "1" : "2"),
      },
      {
        selector: SELECTORS.add.personId,
        value: (row) => row.passportNumber,
      },
    ],
  },
];

module.exports = { config, defaultDomain };