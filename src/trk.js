const puppeteer = require("puppeteer-extra");
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs");
const path = require("path");
const util = require("./util");
const { getPath } = util;
const sharp = require("sharp");
const totp = require("totp-generator");

let page;
let data;
let counter = 0;

function getLogFile() {
  const logFolder = path.join(getPath("log"), data.info.munazim);
  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder, { recursive: true });
  }
  const logFile = path.join(logFolder, data.info.caravan + "_ehj.txt");
  return logFile;
}

let startTime;

const config = [
  {
    name: "result_print_renewal",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris/UzatmaBasvuru",
    regex:
      "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris/UzatmaBasvuru",
    // details: [
    //   // {
    //   //   selector: "#basvuruNo",
    //   //   value: () => "application No",
    //   // },
    //   // {
    //   //   selector: "#cepTelefon",
    //   //   value: () => "cell phone",
    //   // },
    //   // {
    //   //   selector: "#ePosta",
    //   //   value: (row) => row.email,
    //   // },
    //   // {
    //   //   selector: "#yabanciKimlikNo",
    //   //   value: () => "Foreign Number ID",
    //   // },
    //   // {
    //   //   selector: "#pasaportBelgeNo",
    //   //   value: (row) => row.passportNumber,
    //   // },
    // ],
  },
  {
    name: "continue_application_renewal",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris/UzatmaBasvuru",
    regex:
      "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris/UzatmaBasvuru",
    details: [
      {
        selector: "#basvuruNo",
        value: () => "application No",
      },
      {
        selector: "#cepTelefon",
        value: () => "cell phone",
      },
      {
        selector: "#ePosta",
        value: () => "Email Address",
      },
      {
        selector: "#yabanciKimlikNo",
        value: () => "Foreign Number ID",
      },
      {
        selector: "#pasaportBelgeNo",
        value: () => "passport number",
      },
    ],
  },
  {
    name: "apply_renewal",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/UzatmaGecisGiris/UzatmaBasvuru",
    regex: "https://e-ikamet.goc.gov.tr/Ikamet/UzatmaGecisGiris/UzatmaBasvuru",
    details: [
      {
        selector:
          "#body > div > div > section > div > div.content--box--detail > div > div > div.form-horizontal.col-lg-12 > div > div.col-lg-8.controls > span > span > span.k-input",
        value: () => "",
      },
      {
        selector: "#ad",
        value: () => "AB",
      },
      {
        selector: "#soyad",
        value: () => "AC",
      },
      {
        selector: "#yabanciKimlikNo",
        value: () => "8493934",
      },
      {
        selector: "#belgeSeri",
        value: () => "Residence Permit card serial No.",
      },
      {
        selector: "#belgeNo",
        value: () => "Residence Permit Card No.",
      },
      {
        selector:
          "#body > div > div > section > div > div.content--box--detail > div > div > div:nth-child(5) > div:nth-child(3) > div.col-lg-8.controls > span > span > span.k-input",
        value: () => "Country of Nationality",
      },
      {
        selector:
          "#body > div > div > section > div > div.content--box--detail > div > div > div:nth-child(10) > div.form-horizontal.col-md-6.col-centered > div > div.col-lg-8.controls > span > span > span.k-input",
        value: () => "Communication Preference",
      },
      {
        selector: "#iletisim_eMail",
        value: () => "Email Address",
      },
      {
        selector: "#iletisim_cepTelefon",
        value: () => "Cell Phone",
      },
      {
        selector: "#uzatmaGecisOkudumAnladim",
        value: () => "Read and Understood",
      },
    ],
  },
  {
    name: "apply",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/OnKayit",
    regex: "https://e-ikamet.goc.gov.tr/Ikamet/OnKayit",
    details: [
      {
        selector: "#ad",
        // value: (row) => row.name.first,
        value: (row) => row.name.first,
      },
      // {
      //   selector: '#soyad',
      //   // value: (row) => row.name.last,
      //   value: (row) => row.name.last,
      // },
      // {
      //   selector: '#DogumTarih',
      //   value: (row) => row.dob.dmy,
      // },
      // {
      //   selector: '#babaAd',
      //   value: (row) => row.name.father,
      // },
      // {
      //   selector: '#anneAd',
      //   value: (row) => row.name.grand,
      // },
      // {
      //   selector: '#uyrukKimlikNo',
      //   // value: (row) => row.passportNumber,
      //   value: (row) => '2342387423',
      // },
      // {
      //   selector: '#eposta',
      //   value: (row) => 'no@email.com',
      // },
      // {
      //   selector: '#cepTelefon',
      //   value: (row) => '5484739847',
      // },
      // {
      //   selector:
      //     '#body > div > div > section > div > div.content--box--detail > div > div > table > tbody > tr > td > div > div.col-lg-12.controls > table > tbody > tr > td:nth-child(1) > input[type=hidden]:nth-child(2)',
      //   value: (row) => true,
      // },
    ],
  },
  {
    name: "apply_for_transfer",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/UzatmaGecisGiris/GecisBasvuru",
    regex: "https://e-ikamet.goc.gov.tr/Ikamet/UzatmaGecisGiris/GecisBasvuru",
    details: [
      {
        selector:
          "#body > div > div > section > div > div.content--box--detail > div > div > div.form-horizontal.col-lg-12 > div > div.col-lg-8.controls > span > span > span.k-input",
        value: () => "",
      },
      {
        selector: "#ad",
        value: () => "AB",
      },
      {
        selector: "#soyad",
        value: () => "AC",
      },
      {
        selector: "#yabanciKimlikNo",
        value: () => "8493934",
      },
      {
        selector: "#belgeSeri",
        value: () => "Residence Permit card serial No.",
      },
      {
        selector: "#belgeNo",
        value: () => "Residence Permit Card No.",
      },
      {
        selector:
          "#body > div > div > section > div > div.content--box--detail > div > div > div:nth-child(5) > div:nth-child(3) > div.col-lg-8.controls > span > span > span.k-input",
        value: () => "Country of Nationality",
      },
      {
        selector:
          "#body > div > div > section > div > div.content--box--detail > div > div > div:nth-child(10) > div.form-horizontal.col-md-6.col-centered > div > div.col-lg-8.controls > span > span > span.k-input",
        value: () => "Communication Preference",
      },
      {
        selector: "#iletisim_eMail",
        value: () => "Email Address",
      },
      {
        selector: "#iletisim_cepTelefon",
        value: () => "Cell Phone",
      },
      {
        selector: "#uzatmaGecisOkudumAnladim",
        value: () => "Read and Understood",
      },
    ],
  },
  {
    name: "apply_for_transfer_in_progress",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris/GecisBasvuru",
    regex:
      "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris/GecisBasvuru",
    details: [
      {
        selector: "#basvuruNo",
        value: () => "Application No",
      },
      {
        selector: "#cepTelefon",
        value: () => "Cell Phone",
      },
      {
        selector: "#ePosta",
        value: () => "Email Address",
      },
      {
        selector: "#yabanciKimlikNo",
        value: () => "Foreign ID Number",
      },
      {
        selector: "#pasaportBelgeNo",
        value: () => "#pasaportBelgeNo",
      },
    ],
  },
  {
    name: "apply_for_transfer_in_progress_result",
    url: "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris",
    regex: "https://e-ikamet.goc.gov.tr/Ikamet/DevamEdenBasvuruGiris",
    details: [
      {
        selector: "#basvuruNo",
        value: () => "Application No",
      },
      {
        selector: "#cepTelefon",
        value: () => "Cell Phone",
      },
      {
        selector: "#ePosta",
        value: () => "Email Address",
      },
      {
        selector: "#yabanciKimlikNo",
        value: () => "Foreign ID Number",
      },
      {
        selector: "#pasaportBelgeNo",
        value: () => "#pasaportBelgeNo",
      },
    ],
  },
];

async function send(sendData) {
  data = sendData;
  page = await util.initPage(config, onContentLoaded);
  await page.goto(config[0].url, { waitUntil: "domcontentloaded" });
}

async function onContentLoaded(res) {
  counter = util.useCounter(counter);
  if (counter >= data?.travellers?.length) {
    util.setCounter(0);
    if (fs.existsSync(getPath("loop.txt"))) {
      fs.unlinkSync(getPath("loop.txt"));
    }
  }
  const currentConfig = util.findConfig(await page.url(), config);
  try {
    await pageContentHandler(currentConfig);
  } catch (err) {
    console.log(err);
  }
}

async function pageContentHandler(currentConfig) {
  const passenger = data.travellers[counter];
  switch (currentConfig.name) {
    case "apply":
      await util.commit(page, currentConfig.details, passenger);
      // await util.commitCaptchaTokenWithSelector(
      //   page,
      //   '#CaptchaImage',
      //   '#CaptchaInputText',
      //   8
      // );
      // await page.click('#btnOnKayitKaydet');
      break;
    // case 'apply_renewal':
    //   await util.commit(page, currentConfig.details, data.system);
    //   await util.commitCaptchaTokenWithSelector(
    //     page,
    //     '#CaptchaImage',
    //     '#CaptchaInputText',
    //     8
    //   );
    //   await page.click('#uzatmaGecisGirisBtn');
    // case 'continue_application_renewal':
    //   await util.commit(page, currentConfig.details, data.system);
    //   await util.commitCaptchaTokenWithSelector(
    //     page,
    //     '#CaptchaImage',
    //     '#CaptchaInputText',
    //     8
    //   );
    //   await page.click(
    //     '#body > div > div > section > div > div.content--box--detail > div > div.login-alt > div:nth-child(2) > div > button'
    //   );
    //   break;
    case "result_print_renewal":
      // await util.commit(page, currentConfig.details, passenger);
      await page.focus("#basvuruNo");
      await page.click("#basvuruNo");
      await page.type("#basvuruNo", "3213-21-3123123", { delay: 100 });

      // const token = await util.commitCaptchaTokenWithSelector(
      //   page,
      //   '#CaptchaImage',
      //   '#CaptchaInputText',
      //   8
      // );

      // await page.click(
      //   '#body > div > div > section > div > div.content--box--detail > div > div.login-alt > div:nth-child(2) > div > button'
      // );
      break;
    // case 'apply_for_transfer':
    //   await util.commit(page, currentConfig.details, data.system);
    //   await util.commitCaptchaTokenWithSelector(
    //     page,
    //     '#CaptchaImage',
    //     '#CaptchaInputText',
    //     8
    //   );
    //   await page.click('#uzatmaGecisGirisBtn');
    //   break;
    // case 'apply_for_transfer_in_progress':
    //   await util.commit(page, currentConfig.details, data.system);
    //   await util.commitCaptchaTokenWithSelector(
    //     page,
    //     '#CaptchaImage',
    //     '#CaptchaInputText',
    //     8
    //   );
    //   await page.click(
    //     '#body > div > div > section > div > div.content--box--detail > div > div.login-alt > div:nth-child(2) > div > button'
    //   );
    //   break;
    // case 'apply_for_transfer_in_progress_result':
    //   await util.commit(page, currentConfig.details, data.system);
    //   await util.commitCaptchaTokenWithSelector(
    //     page,
    //     '#CaptchaImage',
    //     '#CaptchaInputText',
    //     8
    //   );
    //   await page.click(
    //     '#body > div > div > section > div > div.content--box--detail > div > div.login-alt > div:nth-child(2) > div > button'
    //   );
    //   break;

    default:
      break;
  }
}

module.exports = { send };
