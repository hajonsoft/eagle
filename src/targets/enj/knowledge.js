const util = require("../../util");
const { SELECTORS } = require("./selectors");

const defaultDomain = "https://services.ksavisa.sa";
const escapedDomain = defaultDomain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function approximateArabicFromEnglish(value = "") {
  let text = (value || "").toString().trim().toLowerCase();
  if (!text) {
    return "";
  }

  const digraphs = [
    ["sh", "ش"],
    ["kh", "خ"],
    ["th", "ث"],
    ["dh", "ذ"],
    ["gh", "غ"],
    ["ph", "ف"],
    ["ch", "تش"],
    ["aa", "ا"],
    ["ee", "ي"],
    ["oo", "و"],
    ["ou", "و"],
  ];

  for (const [latin, arabic] of digraphs) {
    text = text.replace(new RegExp(latin, "g"), arabic);
  }

  const charMap = {
    a: "ا",
    b: "ب",
    c: "ك",
    d: "د",
    e: "ي",
    f: "ف",
    g: "ج",
    h: "ه",
    i: "ي",
    j: "ج",
    k: "ك",
    l: "ل",
    m: "م",
    n: "ن",
    o: "و",
    p: "ب",
    q: "ق",
    r: "ر",
    s: "س",
    t: "ت",
    u: "و",
    v: "ف",
    w: "و",
    x: "كس",
    y: "ي",
    z: "ز",
    " ": " ",
    "-": "-",
  };

  return Array.from(text)
    .map((character) => charMap[character] || "")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveArabicName(arabicValue, englishValue) {
  const arabicText = (arabicValue || "").toString().trim();
  if (arabicText && !/[a-zA-Z]/.test(arabicText)) {
    return arabicText;
  }

  return approximateArabicFromEnglish(englishValue);
}

function getEmbassyText(system) {
  const embassy = system?.embassy;
  if (!embassy) {
    return "القاهره";
  }

  if (typeof embassy === "string") {
    return embassy;
  }

  return (
    embassy?.arabicName ||
    embassy?.name ||
    embassy?.city ||
    embassy?.value ||
    "القاهره"
  );
}

const config = [
  {
    name: "login",
    url: `${defaultDomain}/Account/Login/EnjazCompany`,
    regex: `${defaultDomain}/Account/Login/EnjazCompany`,
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
    comments: "login page, username and password are required",
  },
  {
    name: "main",
    url: `${defaultDomain}/Enjaz/Main`,
  },
  {
    name: "smart-form",
    url: `${defaultDomain}/SmartForm`,
    regex: `${escapedDomain}/SmartForm/?$`,
  },
  {
    name: "agreement",
    url: `${defaultDomain}/SmartForm/Agreement`,
    regex: `${escapedDomain}/SmartForm/Agreement/?$`,
  },
  {
    name: "electronic-agreement",
    url: `${defaultDomain}/SmartForm/ElectronicAgreement`,
    regex: `${escapedDomain}/SmartForm/ElectronicAgreement/?$`,
  },
  {
    name: "add-passenger",
    url: `${defaultDomain}/SmartForm/TraditionalApp`,
    regex: `${escapedDomain}/SmartForm/TraditionalApp/?$`,
    details: [
      {
        selector: SELECTORS.traditionalApp.visaType,
        value: (row) => "1",
      },
      {
        selector: SELECTORS.traditionalApp.firstNameAr,
        value: (row) =>
          resolveArabicName(row?.nameArabic?.first, row?.name?.first),
      },
      {
        selector: SELECTORS.traditionalApp.familyNameAr,
        value: (row) =>
          resolveArabicName(row?.nameArabic?.last, row?.name?.last),
      },
      {
        selector: SELECTORS.traditionalApp.thirdNameAr,
        value: (row) =>
          resolveArabicName(row?.nameArabic?.grand, row?.name?.grand),
      },
      {
        selector: SELECTORS.traditionalApp.secondNameAr,
        value: (row) =>
          resolveArabicName(row?.nameArabic?.father, row?.name?.father),
      },
      {
        selector: SELECTORS.traditionalApp.firstNameEn,
        value: (row) => row?.name?.first,
      },
      {
        selector: SELECTORS.traditionalApp.fatherNameEn,
        value: (row) => row?.name?.father,
      },
      {
        selector: SELECTORS.traditionalApp.grandFatherNameEn,
        value: (row) => row?.name?.grand,
      },
      {
        selector: SELECTORS.traditionalApp.familyNameEn,
        value: (row) => row?.name?.last,
      },
      {
        selector: SELECTORS.traditionalApp.passportNumber,
        value: (row) => row.passportNumber,
      },
      {
        selector: SELECTORS.traditionalApp.nationality,
        value: (row) => row.nationality.code,
      },
      {
        selector: SELECTORS.traditionalApp.embassy,
        value: () => "302", // TODO: Use the embassy code from the system if available, otherwise default to "302" (Cairo)
      },
      {
        selector: SELECTORS.traditionalApp.visaIssuedNumber,
        value: (row) => row.visaIssuedNumber,
      },
      {
        selector: SELECTORS.traditionalApp.sponsorPhone,
        value: (row) => "0",
      },
      {
        selector: SELECTORS.traditionalApp.sponsorName,
        value: (row) => row.sponsorFullName,
      },
      {
        selector: SELECTORS.traditionalApp.purpose,
        value: (row) => `العمل لدى ${row.sponsorFullName || "الكفيل"}`,
      },
      {
        selector: SELECTORS.traditionalApp.carNumber,
        value: (row) => "SV21",
      },
      {
        selector: SELECTORS.traditionalApp.birthPlace,
        value: (row) => row.birthPlace || row.nationality?.name,
      },
      {
        selector: SELECTORS.traditionalApp.passportIssuePlace,
        value: (row) => "مصر", // TODO: Use the passport issue place from the system if available, otherwise default to "302" (Cairo)
      },
      {
        selector: SELECTORS.traditionalApp.profession,
        value: (row) => decodeURI(row.profession),
        autocomplete: "profession",
      },
      {
        selector: SELECTORS.traditionalApp.email,
        value: (row) => row.email,
      },
      {
        selector: SELECTORS.traditionalApp.carrier,
        value: (row) => "2",
      },
      {
        selector: SELECTORS.traditionalApp.degree,
        value: () => "-",
      },
      {
        selector: SELECTORS.traditionalApp.degreeSource,
        value: () => "-",
      },
      {
        selector: SELECTORS.traditionalApp.addressHome,
        value: () => "الرياض",
      },
      {
        selector: SELECTORS.traditionalApp.sponsorAddress,
        value: () => "الرياض",
      },
      {
        selector: SELECTORS.traditionalApp.sponsorId,
        value: (row) => row.sponsorId,
      },
      {
        selector: SELECTORS.traditionalApp.passportType,
        value: () => "1",
      },
      {
        selector: SELECTORS.traditionalApp.religion,
        value: () => "1",
      },
      {
        selector: SELECTORS.traditionalApp.socialStatus,
        value: () => "1",
      },
      {
        selector: SELECTORS.traditionalApp.sex,
        value: (row) => (row.gender === "Male" ? "1" : "2"),
      },
      {
        selector: SELECTORS.traditionalApp.personId,
        value: (row) => row.passportNumber,
      },
    ],
  },
];

const visaInfoConfig = [
  {
    name: "get-visa-information",
    url: "https://visa.mofa.gov.sa/Enjaz/GetVisaInformation/Org",
    details: [
      {
        selector: "#VisaNumber",
        value: (row) => row.visaIssuedNumber,
      },
      {
        selector: "#SponserID",
        value: (row) => row.sponsorId,
      },
      {
        selector: "#Embassy",
        value: (row) => "302",
      },
    ],
  },
  {
    name: "logged-in",
    url: "https://visa.mofa.gov.sa/Enjaz/ViewVisaDetails/Org",
  },
];

module.exports = { defaultDomain, config, visaInfoConfig };
