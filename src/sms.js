const axios = require("axios");
const fs = require("fs");
const defaultSMSAPIKeyMustOverride = "88fd2e1A3f4d327740A9408c12872A39";

async function runGetSMSNumber(country) {
  // Must read api key from data.json
  let api_key = defaultSMSAPIKeyMustOverride;

  const balance = await getSMSBalance(api_key);
  if (balance < 0.75) {
    return {
      error: "No SMS balance",
    };
  }
  let numberCountry;
  let numberService;
  if (country) {
    numberCountry = country;
  } else {
    const lowestPrice = await getLowestPrice(api_key);
    numberCountry = lowestPrice?.country;
    numberService = lowestPrice?.service;
  }
  // const existingActivation = getExistingActivation(api_key)
  // if (existingActivation){
  //     await cancelActivation(api_key, existingActivation.split(":")[1]);
  // }
  // TODO: check status proceed only if status is 0
  const result = await getSMSNumber(api_key, country, numberService);
  // if (result.error) {
  //   return {
  //     error: result.error,
  //   };
  // }
  // return result;
}

async function getSMSNumber(api_key, country = "0", service) {
  const numberInquiry = await axios.get(
    `https://api.sms-activate.org/stubs/handler_api.php?api_key=${api_key}&action=getNumber&service=${service}&country=${country}`
  );

  if (numberInquiry.status === 200) {
    return numberInquiry.data?.split(":")?.[1];
  }
  return { error: numberInquiry.data };
}

async function getSMSBalance(api_key) {
  const balanceInquiry = await axios.get(
    `https://api.sms-activate.org/stubs/handler_api.php?api_key=${api_key}&action=getBalance`
  );
  if (balanceInquiry.status === 200) {
    return balanceInquiry?.data?.split(":")?.[1];
  }
}

async function getLowestPrice(api_key) {
  const prices = await getPrices(api_key);
  const pricesArray = [];
  for (const [key, value] of Object.entries(prices)) {
    for (const [serviceKey, serviceValue] of Object.entries(value)) {
      const price = {
        country: key,
        service: serviceKey,
        cost: serviceValue.cost,
        count: serviceValue.count,
      };
      if (price.count > 0) {
        pricesArray.push(price);
      }
    }
  }
  pricesArray.sort((a, b) => a.cost - b.cost);
  return pricesArray[0];
}

async function getPrices(api_key) {
  const pricesInquiry = await axios.get(
    `https://api.sms-activate.org/stubs/handler_api.php?api_key=${api_key}&action=getPrices`
  );

  if (pricesInquiry.status === 200) {
    return pricesInquiry.data;
  }
}

async function cancelActivation(api_key, id) {
  const cancelInquiry = await axios.get(
    `https://api.sms-activate.org/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=8&id=${id}`
  );
  if (cancelInquiry.status === 200) {
    console.log(cancelInquiry.data);
  }
}

async function getActivationSMSCode(api_key, id) {
  const codeInquiry = await axios.get(
    `https://api.sms-activate.org/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=1&id=${id}`
  );
  if (codeInquiry.status === 200) {
    console.log(codeInquiry.data);
    return codeInquiry.data;
  }
}

async function completeActivationSMSCode(api_key, id, code) {
  const completeInquiry = await axios.get(
    `https://api.sms-activate.org/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=6&id=${id}&code=${code}`
  );
  if (completeInquiry.status === 200) {
    console.log(completeInquiry.data);
  }
}

async function abandoned() {}
async function getNewNumber() {}
async function abandoned() {}
async function abandoned() {}

module.exports = { runGetSMSNumber, abandoned };
