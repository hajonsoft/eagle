const SELECTORS = {
  login: {
    password:
      "body > app-root > app-auth-layout > div > div.wave.w-50 > app-general-login > div > app-login > div.log-card.ng-star-inserted > form > div > div.col-sm-12.mb-8px > p-password > div > input",
    signInButton:
      "body > app-root > app-auth-layout > div.auth-main > div.wave.w-50 > app-general-login > div > app-login > div > form > div > button",
    username:
      "body > app-root > app-auth-layout > div > div.wave.w-50 > app-general-login > div > app-login > div.log-card.ng-star-inserted > form > div > div.col-sm-12.form-mb > g-input-text > div > div.input-text-wrapper-class > input",
  },
  otp: {
    commanderButton: "#otpCode",
    loginSubmit:
      "body > app-root > app-auth-layout > div.auth-main > div.wave.w-50 > app-general-login > div > app-login > div > form > div > button, app-general-login app-login form button[type='submit'], app-general-login app-login form div > button",
    loginSubmitFallbackSelectors: [
      "button.login-btn[type='submit']",
      "app-general-login app-login form button[type='submit']",
    ],
    loginSubmitGenericSelectors: [
      "button[type='submit']",
      "app-general-login app-login form button",
    ],
    loginCommanderHostFallbackSelectors: [
      "app-general-login app-login form",
      "app-login form",
    ],
    otpInput:
      "#OtpValue, input[name='OtpValue'], input[formcontrolname='OtpValue']",
    otpSplitInput:
      "input[id^='otp_'], input[maxlength='1'][inputmode='numeric'], input[maxlength='1'][type='text']",
    recaptchaResponse: "#g-recaptcha-response",
    recaptchaTokenFieldSelectors: [
      "#g-recaptcha-response",
      "textarea[name='g-recaptcha-response']",
      "input[name='g-recaptcha-response']",
      "input[name='recaptchaToken']",
      "textarea[name='recaptchaToken']",
      "input[name='captchaToken']",
      "textarea[name='captchaToken']",
    ],
  },
  createGroup: {
    embassy: "#EmbassyId",
    embassyError: "#EmbassyId-error",
    groupName: "#GroupNameEn",
    next: "#qa-next",
  },
  contracts: {
    cards: "app-ea-contracts-reception .contract-card",
    subExternalAgentValue: "#dropdownMenuLink > div > p",
    cardNumber:
      "app-ea-contracts-reception .contract-card .contract-card__number",
    cardNumberInCard: ".contract-card__number",
    cardStatusInCard: ".badge, .contract-card__status",
    cardClickableInCard: "a, button, [role='button'], .stretched-link",
  },
  mutamers: {
    addMutamerButton:
      "body > app-root > app-dynamic-layout > app-shared-layout > div > div > div > app-mutamer > app-mutamer-list > div > div > div > div.mutamer__header-actions.ng-star-inserted > button",
  },
  passengers: {
    proceedButton:
      "body > app-root > app-dynamic-layout > app-stepper-layout > app-mutamer > app-mutamer-add > app-passport-data-summary-popup > g-popup > div > div > div.popup-actions.d-flex.gap-3.justify-content-end > button",
    addMutamerButton:
      "#newfrm > div.kt-wizard-v2__content > div.kt-heading.kt-heading--md.d-flex > a",
    addMutamerHeader:
      "#stepper_parent > app-form-passport-info > app-haj-main-card > div > div.card-header.cursor-pointer:has(h3.title), #stepper_parent app-form-passport-info app-haj-main-card div.card-header.cursor-pointer:has(h3.title), #stepper_parent app-form-passport-info app-haj-main-card div.card-header.cursor-pointer",
    birthCity:
      "#stepper_parent app-form-step-three form app-haj-main-card:nth-child(1) div.body.collapse.show > div:nth-child(7) > div:nth-of-type(2) input",
    birthCountry:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(7) > div:nth-child(1) > p-dropdown",
    email:
      "#stepper_parent app-form-step-three form app-haj-main-card:nth-child(2) div.body.collapse.show > div:nth-child(1) input",
    firstNameAr:
      "#stepper_parent app-form-step-three form app-haj-main-card:nth-child(1) div.body.collapse.show > div:nth-child(2) > div:nth-of-type(1) input",
    firstNameEn:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(4) > div:nth-child(1) > input",
    secondNameAr:
      "#stepper_parent app-form-step-three form app-haj-main-card:nth-child(1) div.body.collapse.show > div:nth-child(2) > div:nth-of-type(2) input",
    secondNameEn:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(4) > div:nth-child(2) > input",
    thirdNameAr:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(3) > div:nth-of-type(1) > input",
    thirdNameEn:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(5) > div:nth-of-type(1) > input",
    familyNameAr:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(3) > div:nth-of-type(2) > input",
    familyNameEn:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(5) > div:nth-of-type(2) > input",
    iqamaId:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(9) > div:nth-child(1) > input",
    iqamaExpiryDate:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(9) > div:nth-child(2) > p-calendar > span > input",
    issueCity:
      "#stepper_parent > app-form-step-two > form > app-haj-main-card:nth-child(2) > div > div.body.collapse.show > div:nth-child(4) > div:nth-child(2) > input",
    job: "#stepper_parent app-form-step-three form app-haj-main-card:nth-child(1) div.body.collapse.show > div:nth-child(6) > div:nth-of-type(2) input",
    maritalStatus:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(8) > div:nth-child(1) > p-dropdown",
    mobileCountryKey:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(2) > div > div.body.collapse.show > div:nth-child(2) > div > app-phone-field > div > p-dropdown",
    mobileNo:
      "#stepper_parent app-form-step-three form app-haj-main-card:nth-child(2) div.body.collapse.show > div:nth-child(2) app-phone-field input",
    mutamerPassportUploader:
      "#stepper_parent > app-form-passport-info > app-haj-main-card > div > div.body.collapse.show > div > div.container__notes.col-9 > div.container__notes__upload.rounded-3.p-4 > div.container__notes__upload__button > input[type=file]",
    passportSectionTitle:
      "#stepper_parent > app-form-passport-info > app-haj-main-card > div > div.body.collapse.show > div > div.container__notes.col-9 > div.container__notes__upload.rounded-3.p-4 > div.container__notes__title > h4",
    passportExpiryDate: "#PassportExpiryDate",
    passportIssueDate:
      "#stepper_parent > app-form-step-two > form > app-haj-main-card:nth-child(2) > div > div.body.collapse.show > div:nth-child(3) > div:nth-child(1) > p-calendar > span > input",
    passportPictureUploader: "#PassportPictureUploader",
    passportType:
      "#stepper_parent > app-form-step-two > form > app-haj-main-card:nth-child(2) > div > div.body.collapse.show > div:nth-child(2) > div:nth-child(2) > p-dropdown",
    iqamaPictureUploader:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(10) > div:nth-child(2) > app-file-upload > div > p-fileupload > div > input[type=file]",
    saveButton:
      "#stepper_parent > action-btns > div > div > button.btn.btn-primary",
    saveButtonPersonalInfo:
      "#stepper_parent > action-btns > div > div > button.btn.btn-primary",
    saveButtonDisclosure:
      "#stepper_parent > action-btns > div > div > button.btn.btn-primary",
    saveButtonConfirmation:
      "#stepper_parent > action-btns > div > div > button.btn.btn-primary",
    companionRequiredMessage:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card > div > div.body.collapse.show > div.alert.alert-primary.d-flex.gap-2 > p",
    companionListButton:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card > div > div.body.collapse.show > div.row > button",
    companionRows: "#companionListTableId tbody > tr",
    companionRadio: "td:first-child .p-radiobutton-icon",
    companionAddButton:
      "#stepper_parent > app-form-step-three > app-companion-list-popup > p-dialog > div > div > div.p-dialog-footer > button",
    companionRelationship:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card.ng-star-inserted > div > div.body.collapse.show > div.row.ng-star-inserted > div.col-md-3.col-lg-3.col-xl-2.form-mb > p-dropdown",
    everImprisonedRadio: "#no_0",
    everBeenArrested:
      "#stepper_parent > app-review > div > div.mutamer-disclosureForm > app-haj-main-card > div > div > app-mutamer-disclosure > div > div > div:nth-child(16) > div.mutamer-disclosure__content > div",
    vaccinationPictureUploader:
      "#stepper_parent > app-form-step-three > form > app-haj-main-card:nth-child(1) > div > div.body.collapse.show > div:nth-child(10) > div:nth-child(3) > app-file-upload > div > p-fileupload > div > div.p-fileupload-buttonbar > span > input[type=file]",
    addAnotherPassengerButton:
      "body > app-root > app-dynamic-layout > app-stepper-layout > app-mutamer > app-mutamer-add > app-added-successfully-popup > g-popup > div > div > div.popup-actions.d-flex.gap-3 > button.btn.btn-primary",
    passportImageUploadError:
      "body > app-root > p-toast > div > p-toastitem > div > div > div > div.p-toast-detail",
  },
};

module.exports = { SELECTORS };
