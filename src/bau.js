const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs");
const path = require("path");
const util = require("./util");
const { getPath } = require("./lib/getPath");
const moment = require("moment");
const sharp = require("sharp");
const os = require("os");
const { default: axios } = require("axios");
const kea = require("./lib/kea");

const SERVER_NUMBER = 1;
let page;
let data;
let configs = [];

const config = [
  {
    name: "login",
    url: `https://app${SERVER_NUMBER}.babalumra.com/Security/login.aspx`,
    details: [
      { selector: "#txtUserName", value: (system) => system.username },
      { selector: "#txtPassword", value: (system) => system.password },
    ],
    commit: true,
    success: {
      name: "main",
    },
  },
  {
    name: "impersonate",
    regex: `https://app${SERVER_NUMBER}.babalumra.com/Security/Impersonate.aspx`,
  },
  {
    name: "main",
    regex: `https?://app${SERVER_NUMBER}.babalumra.com/Security/MainPage.aspx`,
    redirect: `https://app${SERVER_NUMBER}.babalumra.com/Groups/AddNewGroup.aspx?gMode=1`,
  },
  {
    name: "search-group",
    regex: `https://app${SERVER_NUMBER}.babalumra.com/Groups/SearchGroups.aspx`,
  },
  {
    name: "create-group",
    regex: `https?://app${SERVER_NUMBER}.babalumra.com/Groups/AddNewGroup.aspx.gMode=1`,
    details: [
      {
        selector: "#ctl00_ContentHolder_TxtGroupName",
        value: (data) => util.suggestGroupName(data),
      },
      {
        selector: "#ctl00_ContentHolder_TxtExpectedArrivalDate_dateInput",
        value: () => moment().add(7, "days").format("DD/MM/YYYY"),
      },
    ],
  },
  {
    name: "create-mutamer",
    regex: `https?://app${SERVER_NUMBER}.babalumra.com/Groups/EditMutamerNew.aspx\\?GroupId=\\d+`,
    controller: {
      selector:
        "#aspnetForm > div.container-fluid.body-content > div.page-header",
      action: async () => {
        const selectedTraveller = await page.$eval(
          "#hajonsoft_select",
          (el) => el.value
        );

        if (selectedTraveller) {
          util.setSelectedTraveller(selectedTraveller);
          const passenger = data.travellers[selectedTraveller];
          await sendPassenger(passenger);
        }
      },
    },
  },
];

async function send(sendData) {
  data = sendData;
  page = await util.initPage(config, onContentLoaded);

  // Accept the confirmation dialog, to prevent script hanging
  page.on("dialog", async (dialog) => {
    console.log("dialog message: ", dialog.message());
    if (dialog.message().match(/Record has been saved Successfully/i)) {
      // Store status in kea
      const passenger = data.travellers[util.getSelectedTraveler()];
      util.infoMessage(page, `🧟 passenger ${passenger.slug} saved`);
      kea.updatePassenger(data.system.accountId, passenger.passportNumber, {
        "submissionData.bau.status": "Submitted",
      });
      util.incrementSelectedTraveler();
    }
    if (
      dialog.message().match(/Wrong passport number/i) ||
      dialog.message().match(/There is an error in MRZ reading/i)
    ) {
      // Store status in kea
      const passenger = data.travellers[util.getSelectedTraveler()];
      util.infoMessage(page, `🧟 passenger ${passenger.slug} saved`);
      kea.updatePassenger(data.system.accountId, passenger.passportNumber, {
        "submissionData.bau.status": "Rejected",
        "submissionData.bau.rejectionReason": dialog.message(),
      });
      util.incrementSelectedTraveler();
    }
    await dialog.accept();
  });

  // exit program if no login 2 mins
  setTimeout(() => {
    if (!configs.find((c) => c.name === "main")) {
      util.infoMessage(null, "Login timed out", 2, null, true);
      process.exit(1);
    }
  }, 1200000);
  await page.goto(config[0].url, { waitUntil: "domcontentloaded" });
}

async function commonTasks(currentConfig) {
  if (currentConfig.supportSelector) {
    await util.premiumSupportAlert(page, currentConfig.supportSelector, data);
    return;
  }
  if (currentConfig.controller) {
    await util.controller(page, currentConfig, data.travellers);
  }
}

async function onContentLoaded(res) {
  const currentConfig = util.findConfig(await page.url(), config);
  configs.push(currentConfig);
  try {
    await commonTasks(currentConfig);
    await runPageConfiguration(currentConfig);
  } catch (err) {
    console.log(err);
  }
}

async function runPageConfiguration(currentConfig) {
  switch (currentConfig.name) {
    case "login":
      await util.commit(page, currentConfig.details, data.system);
      await util.commitCaptchaTokenWithSelector(
        page,
        "#form1 > div:nth-child(14) > div > div > div > div:nth-child(4) > div > div:nth-child(2) > img",
        "#rdCap_CaptchaTextBox",
        5
      );
      if (currentConfig.name === "login") {
        await page.click("#lnkLogin");
      }

      break;
    case "main":
      if (global.submission.targetGroupId) {
        // If a group already created for this submission, go directly to that page
        await page.goto(
          `https://app${SERVER_NUMBER}.babalumra.com/Groups/EditMutamerNew.aspx?GroupId=${global.submission.targetGroupId}`
        );
      } else {
        await page.goto(
          `https://app${SERVER_NUMBER}.babalumra.com/Groups/AddNewGroup.aspx?gMode=1`
        );
      }
      break;
    case "impersonate":
      // TODO choose one value from the list
      // get available options
      const options = await page.$$eval(
        "#ctl00_ContentHolder_LstRoles > option",
        (els) => els.map((el) => el.value)
      );
      await page.select("#ctl00_ContentHolder_LstRoles", options[1]);
      await page.click("#ctl00_ContentHolder_BtnImpersonate");
      break;
    case "search-group":
      // remove target _blank from all links
      await page.evaluate(() => {
        const links = document.querySelectorAll("a");
        links.forEach((link) => {
          link.removeAttribute("target");
        });
      });
      break;
    case "create-group":
      const groupName = await page.$eval(
        "#ctl00_ContentHolder_TxtGroupName",
        (e) => e.value
      );
      if (groupName) {
        return;
      }

      await util.commit(page, currentConfig.details, data);
      util.infoMessage(
        page,
        `🏘 create group => ${groupName || util.suggestGroupName(data)}`
      );
      await page.evaluate(() => {
        const consulate = document.querySelector(
          "#ctl00_ContentHolder_LstConsulate"
        );
        const consulateOptions = consulate.querySelectorAll("option");
        consulateOptions[1].selected = true;
      });

      if (!data.info?.caravan.startsWith("CLOUD_")) {
        await page.waitFor(10000);
      }

      try {
        await page.waitForSelector("#ctl00_ContentHolder_LstConsulate", {
          timeout: 5000,
        });
        await page.click("#ctl00_ContentHolder_btnCreate");
      } catch {}
      break;
    case "create-mutamer":
      // Update the submission with current group id
      if (!global.submission.targetGroupId) {
        const groupId = page.url().match(/GroupId=(\d+)/)?.[1];
        if (groupId) {
          global.submission.targetGroupId = groupId;
          kea.updateSubmission({
            targetGroupId: groupId,
          });
        }
      }

      if (fs.existsSync(getPath("loop.txt"))) {
        // Pause to allow for confirmation dialog
        await page.waitFor(5000);

        let passenger = data.travellers[parseInt(util.getSelectedTraveler())];

        // Check for errors
        let errorMessage;
        try {
          errorMessage = await page.$eval(
            "#ctl00_ContentHolder_divErrorsList > div > ul > li",
            (el) => el.textContent || el.innerText
          );
        } catch {}

        if (errorMessage) {
          util.infoMessage(page, `🖐 🖐 🖐 🖐 🖐 Error: ${errorMessage}`);
          const isAlreadySubmitted = errorMessage.match(
            /Passport Number Exists/i
          );
          // Store status in kea
          kea.updatePassenger(data.system.accountId, passenger.passportNumber, {
            "submissionData.bau.rejectionReason": errorMessage,
            "submissionData.bau.status": isAlreadySubmitted
              ? "Submitted"
              : "Rejected",
          });

          // Proceed to next pax
          util.incrementSelectedTraveler();
          passenger = data.travellers[parseInt(util.getSelectedTraveler())];
          console.log("navigate to", page.url());
          await page.goto(page.url());
          break;
        }

        // Send next passenger
        sendPassenger(passenger);
      } else {
        if (!data.info.caravan.startsWith("CLOUD_")) {
          util.infoMessage(page, `pausing for 10 seconds`);
          await page.waitFor(10000);
        }
        fs.writeFileSync(getPath("loop.txt"), "loop");
        await page.reload();
      }
      break;
    default:
      break;
  }
}

async function sendPassenger(passenger) {
  util.infoMessage(page, `Sending passenger ${passenger.slug}`);
  const passportNumber = await page.$eval(
    "#ctl00_ContentHolder_TxtNumber",
    (e) => e.value
  );
  // Do not continue if the passport number field is not empty - This could be a manual page refresh
  if (passportNumber) {
    return;
  }
  await page.waitFor(3000);
  await page.waitForSelector("#btnclick");
  await page.evaluate(() => {
    const scanButton = document.querySelector("#btnclick");
    if (scanButton) {
      scanButton.click();
    }
  });

  const scanInputSelector = "#ctl00_ContentHolder_btngetValues";

  await page.waitForSelector(scanInputSelector);
  await page.type("#ctl00_ContentHolder_btngetValues", passenger.codeline, {
    delay: 0,
  });
  // Wait for the input field to receieve the value
  await page.waitFor(10000);
  await util.commit(
    page,
    [
      {
        selector: "#ctl00_ContentHolder_LstTitle",
        value: (row) => (row.gender === "Male" ? "1" : "3"),
      },
      {
        selector: "#ctl00_ContentHolder_txtMutamerOcc",
        value: (row) => decodeURI(row.profession),
      },
      { selector: "#ctl00_ContentHolder_LstSocialState", value: (row) => "99" },
      { selector: "#ctl00_ContentHolder_LstEducation", value: (row) => "99" },
      {
        selector: "#ctl00_ContentHolder_TxtBirthCity",
        value: (row) => decodeURI(row.birthPlace) || row.nationality.name,
      },
      {
        selector: "#ctl00_ContentHolder_TxtAddressCity",
        value: (row) => decodeURI(util.getIssuingCountry(row)?.name),
      },
      {
        selector: "#ctl00_ContentHolder_TxtAltFirstName",
        value: (row) => row.nameArabic.first,
      },
      {
        selector: "#ctl00_ContentHolder_TxtAltSecondName",
        value: (row) => row.nameArabic.father,
      },
      {
        selector: "#ctl00_ContentHolder_TxtAltGrandFatherName",
        value: (row) => row.nameArabic.grand,
      },
      {
        selector: "#ctl00_ContentHolder_TxtAltLastName",
        value: (row) => row.nameArabic.last,
      },
      {
        selector: "#ctl00_ContentHolder_TxtFirstName",
        value: (row) => row.name.first,
      },
      {
        selector: "#ctl00_ContentHolder_TxtSecondName",
        value: (row) => row.name.father,
      },
      {
        selector: "#ctl00_ContentHolder_TxtGrandFatherName",
        value: (row) => row.name.grand,
      },
      {
        selector: "#ctl00_ContentHolder_TxtLastName",
        value: (row) => row.name.last,
      },
      {
        selector: "#ctl00_ContentHolder_calPassIssue_dateInput",
        value: (row) => row.passIssueDt.dmy,
      },
      {
        selector: "#ctl00_ContentHolder_TxtCityIssuedAt",
        value: (row) => decodeURI(row.placeOfIssue),
      },
      {
        selector: "#ctl00_ContentHolder_LstType",
        value: (row) =>
          row.codeline?.replace(/\n/g, "")?.substring(2, 5) !=
          row.codeline?.replace(/\n/g, "")?.substring(54, 57)
            ? "3"
            : "1",
      },
      {
        selector: "#ctl00_ContentHolder_LstBirthCountry",
        value: (row) => row.nationality.telCode,
      },
      {
        selector: "#ctl00_ContentHolder_LstAddressCountry",
        value: (row) => util.getIssuingCountry(row)?.telCode,
      },
    ],
    passenger
  );
  // Try to get the current city of the passenger
  const currentLocation = await axios.get("https://ipapi.co/json/");
  if (currentLocation?.data?.city) {
    await util.commit(
      page,
      [
        {
          selector: "#ctl00_ContentHolder_TxtAddressCity",
          value: (row) => currentLocation?.data?.city,
        },
      ],
      passenger
    );
  }

  if (passenger.gender === "Female") {
    try {
      await page.waitForSelector("#ctl00_ContentHolder_LstSponsorRelationship");
      await page.select("#ctl00_ContentHolder_LstSponsorRelationship", "15");
    } catch {}
  }

  // commit "#ctl00_ContentHolder_LstAddressCountry" from system.country.telCode
  await util.commit(
    page,
    [
      {
        selector: "#ctl00_ContentHolder_LstAddressCountry",
        value: (row) => row.country?.telCode,
      },
    ],
    data.system
  );

  // paste 2 images
  let photoPath = path.join(
    util.photosFolder,
    `${passenger.passportNumber}.jpg`
  );
  await util.downloadImage(passenger.images.photo, photoPath);
  photoPath = util.getOverridePath(
    photoPath,
    path.join(__dirname, `../photos/${passenger.passportNumber}.jpg`)
  );
  await page.waitForSelector("#ctl00_ContentHolder_imgSelectedFile");
  let futureFileChooser = page.waitForFileChooser();
  await page.evaluate(() =>
    document.querySelector("#ctl00_ContentHolder_ImageUploaderControl").click()
  );
  let fileChooser = await futureFileChooser;
  const resizedPhotoPath = path.join(
    util.photosFolder,
    `${passenger.passportNumber}_200x200.jpg`
  );
  await sharp(photoPath)
    .resize(200, 200, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFile(resizedPhotoPath);
  await fileChooser.accept([resizedPhotoPath]);
  util.infoMessage(page, `🌇 portrait accepted ${resizedPhotoPath}`);

  const passportPath = path.join(
    util.passportsFolder,
    `${passenger.passportNumber}.jpg`
  );
  await util.downloadImage(passenger.images.passport, passportPath);
  if (fs.existsSync(passportPath)) {
    futureFileChooser = page.waitForFileChooser();
    await page.evaluate(() =>
      document
        .querySelector("#ctl00_ContentHolder_ImageUploaderControlPassport")
        .click()
    );
    fileChooser = await futureFileChooser;
    let resizedPassportFile = path.join(
      util.passportsFolder,
      `${passenger.passportNumber}_400x300.jpg`
    );
    await sharp(passportPath)
      .resize(400, 300, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFile(resizedPassportFile);
    await fileChooser.accept([resizedPassportFile]);
    util.infoMessage(page, `🛂 passport accepted ${resizedPassportFile}`);

    // upload resident permit.
    // upload input element is #ctl00_ContentHolder_ppupload
    // upload button is #ctl00_ContentHolder_btnpp
    // Image element is #ctl00_ContentHolder_img_aqama

    // Check if image element source === ../images/noimage.jpg then upload an image otherwise skip
    const residentPermitImageVisible = await page.$(
      "#ctl00_ContentHolder_img_aqama"
    );
    if (residentPermitImageVisible) {
      const residentPermitImage = await page.$eval(
        "#ctl00_ContentHolder_img_aqama",
        (el) => el.src
      );
      if (residentPermitImage?.includes("noimage.jpg")) {
        const residencyImagePath = await util.downloadAndResizeImage(
          passenger,
          null,
          null,
          "residency",
          100,
          175
        );
        if (fs.existsSync(residencyImagePath)) {
          futureFileChooser = page.waitForFileChooser();
          await page.evaluate(() =>
            document.querySelector("#ctl00_ContentHolder_ppupload").click()
          );
          fileChooser = await futureFileChooser;
          await fileChooser.accept([residencyImagePath]);
          // click upload button
          await page.click("#ctl00_ContentHolder_btnpp");
          // Wait for the input field to receieve the value
          await page.waitFor(10000);
          util.infoMessage(
            page,
            `🧟 passenger ${passenger.passportNumber} residence permit uploaded`
          );
        } else {
          // Store status in kea
          kea.updatePassenger(data.system.accountId, passenger.passportNumber, {
            "submissionData.bau.rejectionReason":
              "Residency image upload failed",
            "submissionData.bau.status": "Rejected",
          });

          // Proceed to next pax
          util.incrementSelectedTraveler();
        }
      }
    }
  }

  util.infoMessage(page, `🧟 passenger ${passenger.passportNumber} captcha`);
  await util.commitCaptchaToken(
    page,
    "ctl00_ContentHolder_rdCap_CaptchaImageUP",
    "#ctl00_ContentHolder_rdCap_CaptchaTextBox",
    5
  );
  util.infoMessage(
    page,
    `🧟 passenger ${passenger.slug} done, waiting to save`,
    2,
    false,
    true
  );
  await util.pauseForInteraction(page, 10);
  const saveBtn = await page.$("#ctl00_ContentHolder_BtnEdit");
  if (saveBtn) {
    await page.click("#ctl00_ContentHolder_BtnEdit");
    util.infoMessage(page, `Save button clicked`);
  } else {
    util.infoMessage(
      page,
      `Error 🖐 🖐 🖐 🖐 passenger ${passenger.slug} skipped. Save button unavailable`
    );
  }
}

module.exports = { send, config, SERVER_NUMBER };
