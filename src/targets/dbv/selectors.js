const loginPrefix =
  "#EmaratechSG_Theme_wtLayoutBlock_block_wtMainContent_wtLoginBlock_WebPatterns_wtNavigationTabs_block_wtContent2_wtEstablishmentLogin_";
const passportPrefix =
  "#EmaratechSG_Theme_wtLayoutTourismFormNew_block_wtFormContent_SmartChannels_Application_CW_wtwbPDApplicationSimpleSection_block_WebPatterns_wtcntAppSimpleSecExpandable_block_wtContent_wtContent_";
const additionalPrefix = passportPrefix.replace("wtwbPD", "wtwbAD");
const contactPrefix = passportPrefix.replace("wtwbPD", "wtwbCD");
const visitPrefix = passportPrefix.replace("wtwbPD", "wtwbVD");

const SELECTORS = {
  login: {
    username: `${loginPrefix}wtinpUsername`,
    password: `${loginPrefix}wtinpPassword`,
    submit: `${loginPrefix}wt22`,
    captchaResponse: "#g-recaptcha-response",
    otp: `${loginPrefix}wtOTP_Value`,
    verifyOtp: `${loginPrefix}wt30`,
  },
  landing: {
    skip: "#WebPatterns_wt2_block_wtMainContent_wt3_EmaratechSG_Patterns_wt8_block_wtMainContent_wt10",
    newApplication:
      "#EmaratechSG_Theme_wtwbLayoutEmaratech_block_wtMainContent_wtwbDashboard_wtCntNewApp",
  },
  existingApplication: {
    iframe:
      "body > div.os-internal-ui-dialog.os-internal-ui-widget.os-internal-ui-widget-content.os-internal-ui-corner-all.os-internal-Popup.os-internal-ui-draggable > div.os-internal-ui-dialog-content.os-internal-ui-widget-content > iframe",
    close: "#EmaratechSG_Patterns_wt13_block_wtMainContent_wtbtnClose",
    continue: "#EmaratechSG_Patterns_wt13_block_wtMainContent_wt4",
  },
  tourism: {
    header:
      "#EmaratechSG_Theme_wtLayoutTourismFormNew_block_wtHeader_SmartChannels_Th_wtwbNewTourismHeader_block_wtwbThHeaderGdrfa_wtcntHeaderLogo",
    controller: "#hajonsoft-dbv-passport-controller",
    passenger: "#hajonsoft_select",
  },
  passport: {
    nationality: `${passportPrefix}wtcmbApplicantNationality`,
    previousNationality: `${passportPrefix}wtcmbApplicantPreviousNationality`,
    issuingCountry: `${passportPrefix}wtcmbPassportIssueCountryId`,
    gender: `${passportPrefix}wtcmbApplicantGender`,
    type: `${passportPrefix}wtcmbPassportTypeId`,
    number: `${passportPrefix}wtinpPassportNo`,
    firstName: `${passportPrefix}wtinpFirsttNameEn`,
    middleName: `${passportPrefix}wtinpMiddleNameEn`,
    lastName: `${passportPrefix}wtinpLastNameEn`,
    firstNameArabic: `${passportPrefix}wtinpFirstNameAr`,
    middleNameArabic: `${passportPrefix}wtinpMiddleNameAr`,
    lastNameArabic: `${passportPrefix}wtinpLastNameAr`,
    birthDate: `${passportPrefix}wtinpDateOfBirth`,
    birthPlace: `${passportPrefix}wtinpApplicantBirthPlaceEn`,
    birthCountry: `${passportPrefix}wtcmbApplicantBirthCountry`,
    issueDate: `${passportPrefix}wtinpPassportIssueDate`,
    expiryDate: `${passportPrefix}wtinpPassportExpiryDate`,
    issuePlace: `${passportPrefix}wtinpPassportPlaceIssueEn`,
    searchData: `${passportPrefix}wtbtnSearchData`,
  },
  additional: {
    motherName: `${additionalPrefix}wtinpMotherNameEn`,
    motherNameArabic: `${additionalPrefix}wtinpMotherNameAr`,
    maritalStatus: `${additionalPrefix}wtcmbApplicantMaritalStatus`,
    religion: `${additionalPrefix}wtcmbApplicantReligion`,
    faith: `${additionalPrefix}wtcmbApplicantFaith`,
    education: `${additionalPrefix}wtcmbApplicantEducation`,
    language: `${additionalPrefix}wtcmbApplicantLanguage1`,
    profession: `${additionalPrefix}SmartChannels_CW_wtProfessionWB_block_wtProfessionSerch`,
    comingFromCountry: `${additionalPrefix}wtcmbComingFromCountry`,
    email: `${contactPrefix}wtinpEmail`,
    mobile: `${contactPrefix}wtinpMobileNumber`,
    smsLanguage: `${contactPrefix}wtcmbPreferredLanguage`,
    emirate: `${contactPrefix}wtcmbAddressInsideEmiratesId`,
    city: `${contactPrefix}wtcmbAddressInsideCityId`,
    area: `${contactPrefix}wtcmbAddressInsideAreaId`,
    street: `${contactPrefix}wtinpAddressInsideStreet2`,
    building: `${contactPrefix}wtinpAddressInsideBuilding`,
    floor: `${contactPrefix}wtinpFloorNo`,
    flat: `${contactPrefix}wtinpFlatNo`,
    outsideCountry: `${contactPrefix}wtcmbApplicantOutsideCountry`,
    outsideCity: `${contactPrefix}wtinpAddressOutsideCity`,
    outsideAddress: `${contactPrefix}wtinpAddressOutsideAddress1`,
    outsideMobile: `${contactPrefix}wtinpAddressOutsideMobileNumber`,
    visitPurpose: `${visitPrefix}wtcmbVisitPurpose`,
    visitReason: `${visitPrefix}wtcmbVisitReason`,
    visitDuration: `${visitPrefix}wtcmbVisitDuration`,
  },
};

module.exports = { SELECTORS };
