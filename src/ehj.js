const puppeteer = require("puppeteer-extra");
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs");
const path = require("path");
const budgie = require("./budgie");
const util = require("./util");
const moment = require("moment");
const sharp = require("sharp");
const homedir = require("os").homedir();
const SMS = require("./sms");
const email = require("./email");
const totp = require("totp-generator");
const { default: axios } = require("axios");

let page;
let data;
let counter = 0;
const passports = [];

const config = [
  {
    name: "home",
    url: "https://ehaj.haj.gov.sa/",
    regex: "https://ehaj.haj.gov.sa/$",
  },
  {
    name: "index",
    regex: "https://ehaj.haj.gov.sa/EH/index.xhtml;jsessionid=",
  },
  {
    name: "login",
    regex: "https://ehaj.haj.gov.sa/EH/login.xhtml",
    details: [
      {
        selector: "#j_username",
        value: (row) => row.username,
      },
      {
        selector: "#j_password",
        value: (row) => row.password,
      },
    ],
  },
  {
    name: "otp",
    regex: "https://ehaj.haj.gov.sa/EH/mobileVerify.xhtml",
  },
  {
    name: "profile",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/home/ChangeRepMobile/gAuthSettings.xhtml",
  },
  {
    name: "profile-verification",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/home/ChangeRepMobile/verificationCode.xhtml",
  },
  {
    name: "dashboard",
    regex: "https://ehaj.haj.gov.sa/EH/pages/home/dashboard.xhtml",
  },
  {
    name: "list-pilgrims-mission",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajMission/lookup/hajData/List.xhtml",
  },
  {
    name: "list-pilgrims",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajCompany/lookup/hajData/List.xhtml",
  },
  {
    name: "add-mission-pilgrim",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajMission/lookup/hajData/AddMrz.xhtml",
    controller: {
      selector: "#passportImage > p",
      action: async () => {
        const selectedTraveler = await page.$eval(
          "#hajonsoft_select",
          (el) => el.value
        );
        if (selectedTraveler) {
          fs.writeFileSync("./selectedTraveller.txt", selectedTraveler);
          await sendPassenger(selectedTraveler);
        }
      },
    },
  },
  {
    name: "add-company-pilgrim",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajCompany/lookup/hajData/AddMrz.xhtml",

    controller: {
      selector: "#passportImage > p",
      action: async () => {
        const selectedTraveler = await page.$eval(
          "#hajonsoft_select",
          (el) => el.value
        );
        if (selectedTraveler) {
          fs.writeFileSync("./selectedTraveller.txt", selectedTraveler);
          const data = fs.readFileSync("./data.json", "utf-8");
          var passengersData = JSON.parse(data);
          await pasteCodeLine(selectedTraveler, passengersData);
        }
      },
    },
  },
  {
    name: "add-mission-pilgrim-3",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajMission/lookup/hajData/Add3.xhtml",
    details: [
      {
        selector: "#fatherNameEn",
        value: (row) => row.name.father,
      },
      {
        selector: "#grandFatherNameEn",
        value: (row) => row.name.grand,
      },
      {
        selector: "#placeofBirth",
        value: (row) => row.birthPlace,
      },
      {
        selector: "#address",
        value: (row) => budgie.get("ehaj_pilgrim_address", row.address),
      },
      {
        selector: "#passportIssueDate",
        value: (row) => row.passIssueDt.dmy,
      },
      {
        selector: "#idno",
        value: (row) => "0",
      },
    ],
  },
  {
    name: "add-pilgrim-3",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajCompany/lookup/hajData/Add3.xhtml",
    details: [
      {
        selector: "#fatherNameEn",
        value: (row) => row.name.father,
      },
      {
        selector: "#grandFatherNameEn",
        value: (row) => row.name.grand,
      },
      {
        selector: "#placeofBirth",
        value: (row) => row.birthPlace,
      },
      {
        selector: "#address",
        value: (row) => budgie.get("ehaj_pilgrim_address", row.address),
      },
      {
        selector: "#passportIssueDate",
        value: (row) => row.passIssueDt.dmy,
      },
      {
        selector: "#idno",
        value: (row) => "0",
      },
    ],
  },
  {
    name: "reserve",
    regex: "https://ehaj.haj.gov.sa/EPATH",
  },
  {
    name: "sms",
    regex: "https://ehaj.haj.gov.sa/EH/sms.xhtml",
  },
  {
    name: "sms-confirm",
    regex: "https://ehaj.haj.gov.sa/EH/sms-confirm.xhtml",
  },
  {
    name: "package-details",
    regex:
      "https://ehaj.haj.gov.sa/EH/pages/hajCompany/requests/packages/new/packageDetails.xhtml",
    details: [
      {
        selector: "#nameAr",
        value: () => "قافله رقم " + moment().valueOf().toString(),
      },
      {
        selector: "#nameEn",
        value: () => "Caravan #" + moment().valueOf().toString(),
      },
      {
        selector: "#pkgDescAr",
        value: () => "قافله رقم " + moment().valueOf().toString(),
      },
      {
        selector: "#pkgDescEn",
        value: () => "Caravan #" + moment().valueOf().toString(),
      },
    ],
  },
];

async function sendPassenger(selectedTraveler) {
  const data = fs.readFileSync("./data.json", "utf-8");
  var passengersData = JSON.parse(data);
  await pasteCodeLine(selectedTraveler, passengersData);
}

async function pasteCodeLine(selectedTraveler, passengersData) {
  await page.focus("#passportCaptureStatus");
  if (selectedTraveler == "-1") {
    const browser = await page.browser();
    browser.disconnect();
  }
  var passenger = passengersData.travellers[selectedTraveler];
  await page.keyboard.type(passenger.codeline);
}

async function send(sendData) {
  data = sendData;
  page = await util.initPage(config, onContentLoaded);
  await page.goto(config[0].url, { waitUntil: "domcontentloaded" });
}

async function onContentLoaded(res) {
  counter = util.useCounter(counter);
  if (counter >= data?.travellers?.length) {
    return;
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
    case "home":
    case "index":
      try {
        const anchors = await page.$$eval("a", (els) => {
          return els.map((el) => el.removeAttribute("target"));
        });
      } catch {}
      break;
    case "login":
      await util.commit(page, currentConfig.details, data.system);
      if (data.system.username && data.system.password) {
        const loginButton = await page.$x(
          "/html/body/div[2]/div[2]/div/div[2]/div/form/div[4]/div/input"
        );
        if (
          loginButton &&
          Array.isArray(loginButton) &&
          loginButton.length > 0
        ) {
          loginButton[0].click();
        }
      }
      break;
    case "otp":
      // if ((await page.$(".insecure-form")) !== null) {
      //   await page.click("#proceed-button");
      //   await page.waitForNavigation({ waitUntil: "networkidle0" });
      // }
      const messageSelector = "#mobileVerForm > h5";
      await page.waitForSelector(messageSelector);
      const message = await page.$eval(messageSelector, (el) => el.innerText);
      if (
        (message.includes("generated by Google Authenticator") ||
          message.includes("vérification généré par Google Authenticator") ||
          message.includes("ديك في تطبيق Google Authenticator")) &&
        data.system.ehajCode
      ) {
        const token = totp(data.system.ehajCode);
        await page.type("#code", token);
        const submitButton = await page.$x(
          "/html/body/div[1]/div[2]/div[1]/form/div[2]/div/div/input[1]"
        );
        if (
          submitButton &&
          Array.isArray(submitButton) &&
          submitButton.length > 0
        ) {
          submitButton[0].click();
        }
      }

      break;
    case "profile-verification":
      await page.waitForSelector("#code");
      // #j_idt3421 > div.modal-body > div > h5
      if (data.system.ehajCode) {
        const token = totp(data.system.ehajCode);
        await page.type("#code", token);
      }
      break;
    case "profile":
      // TODO: Check if this code is working fine
      const tokenValue = await page.$eval("#tokenValue", (el) => el.value);
      if (tokenValue) {
        return;
      }
      await page.waitForSelector("#secretKey");
      const secretCode = await page.$eval("#secretKey", (el) => el.value);
      const token = totp(secretCode);
      await page.type("#tokenValue", token);
      await page.click("#verifyGAuthToken > div > div.col-lg-4 > a");
      // Save to firebase
      const config = {
        headers: { Authorization: `Bearer ${data.info.accessToken}` },
      };
      let url = `${data.info.databaseURL}/${
        data.system.path || "protected/profile/"
      }.json`;
      try {
        await axios.patch(
          url,
          {
            ehajCode: secretCode,
          },
          config
        );
      } catch (err) {
        console.log(err);
      }

      break;
    case "dashboard":
      // await page.goto(
      //   "https://ehaj.haj.gov.sa/EH/pages/hajMission/lookup/hajData/AddMrz.xhtml"
      // );
      break;
    case "list-pilgrims":
    case "list-pilgrims-mission":
      const ehajNumbers = [];
      await util.commander(page, {
        controller: {
          // TODO: Replace with a more robust selector
          selector: "form > ul > li:nth-child(3)",
          title: "Import current view",
          arabicTitle: "استيراد الصفحه",
          name: "importEhajNumber",
          action: async () => {
            for (let i = 1; i <= 100; i++) {
              const isRowValid = await page.$(
                `tbody > tr:nth-child(${i}) > td:nth-child(1)`
              );
              if (!isRowValid) {
                break;
              }

              const ehajNumber = await page.$eval(
                `tbody > tr:nth-child(${i}) > td:nth-child(1)`,
                (el) => el.innerText
              );
              const mofaNumber = await page.$eval(
                `tbody > tr:nth-child(${i}) > td:nth-child(2)`,
                (el) => el.innerText
              );
              const passportNumber = await page.$eval(
                `tbody > tr:nth-child(${i}) > td:nth-child(4)`,
                (el) => el.innerText
              );
              if (!ehajNumber) {
                break;
              }

              const status = await page.$eval(
                `tbody > tr:nth-child(${i}) > td:nth-child(11) > span`,
                (el) => el.innerText
              );
              if (
                status.toLowerCase().includes("cancel") ||
                status.toLowerCase().includes("not") ||
                status.toLowerCase().includes("لغ") ||
                status.toLowerCase().includes("رفض") ||
                status.toLowerCase().includes("لم") ||
                status.toLowerCase().includes("reject")
              ) {
                continue;
              }
              ehajNumbers.push(ehajNumber);
              const config = {
                headers: { Authorization: `Bearer ${data.info.accessToken}` },
              };
              const passengerPath = data.travellers.find(
                (p) => p.passportNumber === passportNumber
              )?.path;
              if (passengerPath) {
                const url = `${data.info.databaseURL}/${passengerPath}/.json`;
                try {
                  await axios.patch(
                    url,
                    {
                      ehajNumber,
                      mofaNumber,
                    },
                    config
                  );
                } catch (err) {
                  console.log(err);
                }
              }
              fs.writeFileSync(
                passportNumber,
                JSON.stringify({
                  ehajNumber,
                  mofaNumber,
                  passportNumber,
                })
              );
            }
            await page.evaluate((ehajNumbers) => {
              const eagleButton = document.querySelector("#importEhajNumber");
              eagleButton.textContent = `Done... [${ehajNumbers[0]}-${
                ehajNumbers[ehajNumbers.length - 1]
              }]`;
            }, ehajNumbers);
          },
        },
      });
      break;
    case "add-mission-pilgrim":
    case "add-company-pilgrim":
      await page.emulateVisionDeficiency("none");
      await util.controller(page, currentConfig, data.travellers);
      if (
        fs.existsSync("./loop.txt") &&
        fs.existsSync("./selectedTraveller.txt")
      ) {
        const selectedPassenger = fs.readFileSync(
          "./selectedTraveller.txt",
          "utf8"
        );
        const data = fs.readFileSync("./data.json", "utf-8");
        var passengersData = JSON.parse(data);
        if (
          passengersData.travellers.length >
          parseInt(selectedPassenger) + 1
        ) {
          fs.writeFileSync(
            "selectedTraveller.txt",
            (parseInt(selectedPassenger) + 1).toString()
          );
          await sendPassenger(parseInt(selectedPassenger) + 1);
        }
      }
      await page.waitForSelector("#proceedButton > div > input", {
        visible: true,
        timeout: 0,
      });
      await page.waitForTimeout(2000);
      await page.click("#proceedButton > div > input");
      break;
    case "add-mission-pilgrim-3":
    case "add-pilgrim-3":
      const pageUrl = await page.url();
      await page.waitForSelector("#pass");
      await page.select("#vaccineType", "1");
      const visiblePassportNumber = await page.$eval("#pass", (el) => el.value);
      if (!visiblePassportNumber) {
        return;
      }
      await page.emulateVisionDeficiency("blurredVision");
      passports.push(passenger.passportNumber);
      await util.commander(page, {
        controller: {
          selector: pageUrl.includes("hajMission")
            ? "body > div.wrapper > div > div.page-content > div.row > ul > li:nth-child(3)"
            : "body > div.wrapper > div > div.page-content > div.row > ul > li:nth-child(3)",
          title: "Remember",
          arabicTitle: "تذكر",
          action: async () => {
            const address = await page.$eval("#address", (el) => el.value);
            budgie.save("ehaj_pilgrim_address", address);
            const vaccineType = await page.$eval(
              "#vaccineType",
              (el) => el.value
            );
            budgie.save("ehaj_pilgrim_vaccine_type", vaccineType);
            const firstDoseDate = await page.$eval(
              "#hdcviFirstDoseDate",
              (el) => el.value
            );
            budgie.save("ehaj_pilgrim_vaccine_1_date", firstDoseDate);

            const embassy = await page.$eval("#embassy", (el) => el.value);
            if (embassy) {
              budgie.save("ehaj_pilgrim_embassy", embassy);
            }
            const packageName = await page.$eval("#packge2", (el) => el.value);
            if (packageName) {
              budgie.save("ehaj_pilgrim_package", packageName);
            }
            const roomType = await page.$eval("#roomType", (el) => el.value);
            if (roomType) {
              budgie.save("ehaj_pilgrim_roomType", roomType);
            }
            const isSecondDoseRequired = await page.$("#hdcviSecondDoseDate");
            if (isSecondDoseRequired) {
              const secondDoseDate = await page.$eval(
                "#hdcviSecondDoseDate",
                (el) => el.value
              );
              budgie.save("ehaj_pilgrim_vaccine_2_date", secondDoseDate);
            }
          },
        },
      });
      await util.commit(page, currentConfig.details, passenger);
      await util.commit(
        page,
        [
          {
            selector: "#reference1",
            value: (row) =>
              row.caravan < 40
                ? row.caravan
                : row.caravan.substring(
                    row.caravan.length - 40,
                    row.caravan.length
                  ),
          },
        ],
        data.info
      );
      await page.select("#passportType", "1");
      const embassyVisible = await page.$("#embassy");
      if (embassyVisible) {
        await page.select("#embassy", budgie.get("ehaj_pilgrim_embassy", 214));
      }

      const packageVisible = await page.$("#packge2");
      if (packageVisible) {
        await page.select("#packge2", budgie.get("ehaj_pilgrim_package", ""));
      }

      const roomTypeVisible = await page.$("#roomType");
      if (roomTypeVisible) {
        await page.select("#roomType", budgie.get("ehaj_pilgrim_roomType", ""));
      }
      const isIqamaVisible = await page.$("#iqamaNo");
      if (isIqamaVisible) {
        await util.commit(
          page,
          [
            {
              selector: "#iqamaNo",
              value: (row) => row.idNumber || moment().valueOf(),
            },
            {
              selector: "#iqamaIssueDate",
              value: (row) => row.passIssueDt.dmy,
            },
            {
              selector: "#iqamaExpiryDate",
              value: (row) => row.passExpireDt.dmy,
            },
          ],
          passenger
        );
        const resizedId = await util.downloadAndResizeImage(
          passenger,
          350,
          500,
          "id"
        );

        await util.commitFile("#permit_attmnt_input", resizedId);
      }

      let resizedPhotoPath = await util.downloadAndResizeImage(
        passenger,
        200,
        200,
        "photo"
      );
      const resizedVaccinePath = await util.downloadAndResizeImage(
        passenger,
        100,
        100,
        "vaccine"
      );
      const resizedVaccinePath2 = await util.downloadAndResizeImage(
        passenger,
        100,
        100,
        "vaccine2"
      );

      await page.select(
        "#vaccineType",
        budgie.get("ehaj_pilgrim_vaccine_type", 1)
      );
      await page.waitForTimeout(100);
      const isFirstDoseRequired = await page.$("#hdcviFirstDoseDate");
      if (isFirstDoseRequired) {
        // await page.type(
        //   "#hdcviFirstDoseDate",
        //   moment().add(-60, "days").format("DD/MM/YYYY")
        //   );

        await page.$eval("#hdcviFirstDoseDate", (el) => {
          el.value = "01/01/2022";
        });
        const vaccine1Input = "#vaccine_attmnt_1_input";
        await page.waitForSelector(vaccine1Input);
        await page.click(vaccine1Input);
        await util.commitFile(vaccine1Input, resizedVaccinePath);
        await page.waitForTimeout(500);
      }

      const isSecondDoseRequired = await page.$("#hdcviSecondDoseDate");
      if (isSecondDoseRequired) {
        await page.type(
          "#hdcviSecondDoseDate",
          moment().add(-30, "days").format("DD/MM/YYYY")
        );
        await page.click("#vaccine_attmnt_2_input");
        await util.commitFile("#vaccine_attmnt_2_input", resizedVaccinePath2);
      }

      await page.waitForTimeout(500);
      await page.click("#attachment_input");
      await util.commitFile("#attachment_input", resizedPhotoPath);
      await page.emulateVisionDeficiency("none");
      await page.waitForTimeout(500);

      if (passports.filter((x) => x == passenger.passportNumber).length > 3) {
        // Stop
      } else {
        if (fs.existsSync("./loop.txt")) {
          const submitButtonSelector =
            "#actionPanel > div > div > input.btn.btn-primary";
          await page.click(submitButtonSelector);
        }
      }

      break;
    case "reserve":
      break;
    case "package-details":
      await util.commit(page, currentConfig.details, passenger);
      break;

    default:
      break;
  }
}

module.exports = { send };
