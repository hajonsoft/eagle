const SELECTORS = {
  common: {
    travellerSelect: "#hajonsoft_select",
  },
  login: {
    username: "#EmailId",
    password: "#Password",
    captchaInput: "#CaptchaCode",
    captchaImageId: "imgCaptcha",
    signInButton: "#btnSignIn",
    commanderMount: "#app > div > nav",
  },
  printVisa: {
    controllerMount: "#content > div > div.page-head > div",
    firstValue: "#ddlFirstValue",
    secondValue: "#ddlSecondValue",
    firstInput: "#tbFirstValue",
    secondInput: "#tbSecondValue",
    nationality: "#NationalityId",
    captchaImageId: "imgCaptcha",
    captchaInput: "#Captcha",
    submitButton: "#btnSubmit",
    errorModalDismissButton:
      "#dlgMessage > div.modal-dialog > div > div.modal-footer > button",
  },
  otp: {
    heading: "#formOTPAuth > div.form-fields > div.w-100 > div > div > h3",
    resendButton: "#resendOtp",
    otpInput: "#Otp",
    submitButton: "#btnSubmit",
  },
  group: {
    applyGroupButton: "#btnApplyGroupVisa",
    groupName: "#txtGroupName",
    createGroupButton: "#btnCreateGroup",
  },
  personal: {
    firstNameEnglish: "#FirstNameEnglish",
    lastNameEnglish: "#LastNameEnglish",
    fatherNameEnglish: "#FatherNameEnglish",
    gender: "#Gender",
    socialStatus: "#SocialStatus",
    nationality: "#Nationality",
    countryOfBirth: "#CountryOfBirth",
    country: "#Country",
    cityOfBirth: "#CityOfBirth",
    profession: "#Profession",
    city: "#City",
    postalCode: "#PostalCode",
    address: "#Address",
    applyingVisaForSomeoneElseYes: "#ApplyingVisaForSomeoneElseYes",
    dateOfBirth: "#DateOfBirth",
    attachmentPersonalPicture: "#AttachmentPersonalPicture",
    cropUploadResultButton:
      "#divPhotoCroper > div > div > div.modal-footer > button.rounded-button.upload-result",
    nextButton: "#btnNext",
    guardianList: "#GuardianList",
    guardianSecondOption: "#GuardianList option:nth-child(2)",
    guardianRelation: "#GuardianRelation",
    guardianRelationSecondOption: "#GuardianRelation option:nth-child(2)",
    controllerMount:
      "#formPersonalInfo > div.form-fields > div.bg-label-gray.d-flex.justify-content-between > div",
  },
  passport: {
    passportNumber: "#PassportNumber",
    passportIssuePlace: "#PassportIssuePlace",
    placeOfResidence: "#PlaceOfResidence",
    cityId: "#CityId",
    address1: "#Address1",
    termsCheckbox: "#chk_4",
    passportIssueDate: "#PassportIssueDate",
    passportExpiryDate: "#PassportExpiryDate",
    expectedDateOfEntry: "#ExpectedDateOfEntry",
    expectedDateOfLeave: "#ExpectedDateOfLeave",
    selectAllCheckbox: "#chkSelectDeselectAll",
    nextButton: "#btnNext",
    skipCommanderMount:
      "#app > div:nth-child(1) > div:nth-child(2) > section > div > div > div.col-md-4.steps-column > div > div > h4",
  },
  insurance: {
    checkbox: "#chkInsurance",
    nextButton: "#btnNext",
  },
  terms: {
    selectAllCheckbox: "#chkSelectDeselectAll",
    nextButton: "#btnNext",
  },
  review: {
    payCheckbox: "#chkPay",
    addMoreToGroupButton: "#btnAddMoreToGroup",
    saveButton: "#aSave",
    screenshotAnchor:
      "#app > div:nth-child(1) > div:nth-child(2) > section > div > div > div.col-md-8 > div.review-form.muban-form > div:nth-child(3) > a > span:nth-child(1)",
  },
  screenshot: {
    visaElement: "body > form > page",
  },
};

module.exports = { SELECTORS };
