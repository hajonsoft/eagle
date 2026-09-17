const { SELECTORS } = require("./selectors.js");

const defaultDomain = "https://masar.nusuk.sa";

const config = [
  {
    name: "home",
    url: `${defaultDomain}/`,
  },
  {
    name: "login",
    url: `${defaultDomain}/pub/login`,
    regex: `${defaultDomain}/pub/login(?:\\?.*)?$`,
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
  {
    name: "dashboard",
    regex: `${defaultDomain}/protected/hm/dashboard/requestsDashboard/?$`,
  },
  {
    name: "user-journey",
    regex: `${defaultDomain}/protected/hm/user-journey/?(?:\\?.*)?$`,
  },
  {
    name: "data-entry-method",
    regex: `${defaultDomain}/protected-applicant-st/add/data-entry-method/?$`,
  },
  {
    name: "edit-identity-residence",
    regex: `${defaultDomain}/protected-applicant-st/add/Identity-and-residence\\?id=.+$`,
    details: [
      {
        selector: SELECTORS.identityAndResidence.placeOfIssue,
        value: (row) => row.placeOfIssue,
      },
    ],
  },
  {
    name: "identity-residence",
    regex: `${defaultDomain}/protected-applicant-st/add/Identity-and-residence/?$`,
    details: [
      {
        selector: SELECTORS.identityAndResidence.placeOfIssue,
        value: (row) => row.placeOfIssue,
      },
      {
        selector: SELECTORS.identityAndResidence.placeOfBirth,
        value: (row) => row.birthPlace || row.nationality.name,
      },
    ],
  },
  {
    name: "basic-data",
    regex: `${defaultDomain}/protected-applicant-st/add/basic-data(?:\\?id=.+)?$`,
    details: [
      {
        selector: SELECTORS.basicData.email,
        value: (row) => row.email,
      },
      {
        selector: SELECTORS.basicData.phoneNumber,
        value: () => "9495221000",
      },
      {
        selector: SELECTORS.basicData.zipCode,
        value: () => "12345",
      },
      {
        selector: SELECTORS.basicData.mailBox,
        value: () => "12345",
      },
    ],
  },
  {
    name: "additional-data",
    regex: `${defaultDomain}/protected-applicant-st/add/additinal-data/?$`,
    details: [
      {
        selector: SELECTORS.additionalData.expectedLength,
        value: () => "20",
      },
    ],
  },
  {
    name: "questionnaire",
    regex: `${defaultDomain}/protected-applicant-st/add/Questionnaire/?$`,
  },
  {
    name: "review-application",
    regex: `${defaultDomain}/protected-applicant-st/add/Review-application/?$`,
  },
  {
    name: "applicants-list",
    regex: `${defaultDomain}/protected/applicants-groups/applicants/list/?$`,
  },
  {
    name: "groups",
    regex: `${defaultDomain}/umrah/mutamer-group/group-list/?$`,
  },
  {
    name: "create-group",
    regex: `${defaultDomain}/umrah/mutamer-group/add-group/create-group/?$`,
    details: [
      {
        selector: SELECTORS.createGroup.groupNameInput,
        value: (row) => row.groupName,
      },
    ],
  },
  {
    name: "mutamers",
    regex: `${defaultDomain}/umrah/mutamer/mutamer-list/?$`,
  },
  {
    name: "add-mutamer",
    regex: `${defaultDomain}/umrah/mutamer/add-mutamer/?$`,
  },
];

module.exports = { config, defaultDomain };
