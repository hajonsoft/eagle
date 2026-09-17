const SELECTORS = {
  common: {
    travellerSelect: "#hajonsoft_select",
  },
  printVisa: {
    controllerMount: "#content > div > div.page-head > div",
    firstValue: "#ddlFirstValue",
    secondValue: "#ddlSecondValue",
    firstInput: "#tbFirstValue",
    secondInput: "#tbSecondValue",
    nationality: "#NationalityId",
    captchaImage: "#imgCaptcha",
    captchaImageId: "imgCaptcha",
    captchaInput: "#Captcha",
    submitButton: "#btnSubmit",
    errorMessage: "#dlgMessageContent > div > p",
    errorDialogButton:
      "#dlgMessage > div.modal-dialog > div > div.modal-footer > button",
  },
  login: {
    mofaNumber: "#Id",
    passportNumber: "#PassportNumber",
    nationality: "#NationalityIsoCode",
    pageHeader: ".page-header",
    cookiesButton: "button.acceptcookies",
    captchaImageId: "imgCaptcha",
    captchaInput: "#Captcha",
    submitButton: "#btnSubmit",
    errorDialogButton:
      "#dlgMessage > div.modal-dialog > div > div.modal-footer > button",
    errorMessage: "#dlgMessage #dlgMessageContent .note",
  },
  agreement: {
    continueButton:
      "#content > div > div.page-content-inner > div.row > div > div > div.portlet-body.form > div > div.form-actions.fluid.right > div > div > a.btn.green",
  },
  step1: {
    nextButton:
      "#myform > div.form-actions.fluid.right > div > div > button:nth-child(2)",
  },
  step2: {
    travelledToOtherCountriesNo: "#HaveTraveledToOtherCountriesNo",
    flightNumber: "#CarNumber",
    email: "#AddressContactInfoModel\\.Email",
    stayDuration: "#FlightDataModel\\.ExpectedStayDuration",
    nextButton:
      "#myform > div.form-actions.fluid.right > div > div > button:nth-child(3)",
  },
  step3: {
    rejectedApplicationNo: "#HaveRejectedAppNo",
    relativesInKsaNo: "#HaveReleativesCurrentlyResidentKsaNo",
    question1No: "#QuestionModelList_1__AnswerNo",
    question3Yes: "#QuestionModelList_3__AnswerYes",
    question3Note: "#QuestionModelList_3__Note",
    question4No: "#QuestionModelList_4__AnswerNo",
    question5No: "#QuestionModelList_5__AnswerNo",
    question6No: "#QuestionModelList_6__AnswerNo",
    question7No: "#QuestionModelList_7__AnswerNo",
    question8No: "#QuestionModelList_8__AnswerNo",
    question9No: "#QuestionModelList_9__AnswerNo",
    question10No: "#QuestionModelList_10__AnswerNo",
    question11No: "#QuestionModelList_11__AnswerNo",
    question12No: "#QuestionModelList_12__AnswerNo",
    eNumber:
      "#myform > div.form-body.form-horizontal > div:nth-child(2) > div",
    passportImageRequired: "PassportImageFile",
    passportImageInput: "#PassportImageFile",
    vaccineImageRequired: "VaccinationImageFile",
    vaccineImageInput: "#VaccinationImageFile",
    mahramRelationInput: "#MahramRelationFile",
    passportPreview:
      "#myform > div.form-body.form-horizontal > div.table-scrollable.table-scrollable-borderless.table-fileupload > table > tbody > tr:nth-child(1) > td:nth-child(3)",
    vaccinePreview:
      "#myform > div.form-body.form-horizontal > div.table-scrollable.table-scrollable-borderless.table-fileupload > table > tbody > tr.warning > td:nth-child(3)",
    mahramPreview:
      "#myform > div.form-body.form-horizontal > div.table-scrollable.table-scrollable-borderless.table-fileupload > table > tbody > tr:nth-child(3) > td:nth-child(3)",
    saveButton:
      "#myform > div.form-actions.fluid.right > div > div > button:nth-child(3)",
  },
  step4: {
    commanderMount: "#tab_wizard",
    mofaNumber:
      "#myform > div.form-body.form-horizontal > div > div:nth-child(1) > div:nth-child(2)",
    eNumber:
      "#myform > div.form-body.form-horizontal > div > div:nth-child(2) > div",
    sendToEmbassyButton:
      "#myform > div.form-actions.fluid.right > div > div > button",
    visaStatus:
      "#myform > div.form-body.form-horizontal > div.alert.alert-warning.text-center > h3",
    printButton:
      "#myform > div.form-actions.fluid.right > div > div > a.btn.btn-default.green",
    printedVisaReady:
      "body > form > page > div > div > div > div.evisa-header > div > div.evisa-col-12",
    printedVisa: "body > form > page > div",
    previousButton: "#btnPrevious",
  },
  add: {
    controllerMount:
      "#myform > div.form-body.form-horizontal > h3:nth-child(1)",
    arabicFirstName: "#AFIRSTNAME",
    arabicFamilyName: "#AFAMILY",
    arabicGrandName: "#AGRAND",
    arabicFatherName: "#AFATHER",
    englishFirstName: "#EFIRSTNAME",
    englishFatherName: "#EFATHER",
    englishGrandName: "#EGRAND",
    englishFamilyName: "#EFAMILY",
    passportNumber: "#PASSPORTnumber",
    birthPlace: "#BIRTH_PLACE",
    passportIssuePlace: "#PASSPORT_ISSUE_PLACE",
    profession: "#JOB_OR_RELATION",
    degree: "#DEGREE",
    degreeSource: "#DEGREE_SOURCE",
    homeAddress: "#ADDRESS_HOME",
    passportType: "#PASSPORType",
    nationality: "#NATIONALITY",
    firstNationality: "#NATIONALITY_FIRST",
    religion: "#RELIGION",
    socialStatus: "#SOCIAL_STATUS",
    gender: "#Sex",
    personId: "#PersonId",
    organization: "#OrganizationId",
    submitButton:
      "#myform > div.form-actions.fluid.right > div > div > button",
    mahramType: "#MahramType",
    personalImage: "#PersonalImage",
    portrait: "#image",
    passportIssueDate: "#PASSPORT_ISSUE_DATE",
    passportExpiryDate: "#PASSPORT_EXPIRY_DATe",
    birthDate: "#BIRTH_DATE",
    captchaImage: "#imgCaptcha",
    captchaInput: "#Captcha",
  },
  print: {
    visaPage: "body > form > page",
    pageBody: "body",
  },
  datePicker: {
    year:
      "body > div.calendars-popup > div > div.calendars-month-row > div > div > select.floatleft.calendars-month-year",
    month:
      "body > div.calendars-popup > div > div.calendars-month-row > div > div > select:nth-child(1)",
    days: "td",
  },
};

module.exports = { SELECTORS };