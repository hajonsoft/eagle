const homeUrl =
  "https://smart.gdrfad.gov.ae/SmartChannels_Th/HomePage.aspx";
const landingUrl =
  "https://smart.gdrfad.gov.ae/SmartChannels_LandingPages/Establishments.aspx";

const config = [
  {
    name: "home",
    url: homeUrl,
    regex: "https://smart\\.gdrfad\\.gov\\.ae/smartchannels_th/homepage\\.aspx",
  },
  {
    name: "landing",
    url: landingUrl,
    regex:
      "https://smart\\.gdrfad\\.gov\\.ae/SmartChannels_LandingPages/Establishments\\.aspx",
  },
  {
    name: "tourism",
    regex:
      "^https://smart\\.gdrfad\\.gov\\.ae/smartchannels/entrypermit(?:_new)?tourism\\.aspx(?:\\?|$)",
  },
];

module.exports = { config, homeUrl, landingUrl };
