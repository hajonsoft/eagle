const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const { logInWithRefreshToken } = require("./firebase");
const {
  updateDoc,
  getDocs,
  where,
  getDoc,
  onSnapshot,
} = require("firebase/firestore");
const db = require("./db");
const { toData } = require("./factory");
const { query } = require("firebase/database");

function chunkArray(array, perChunk) {
  return array.reduce((accumulator, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!accumulator[chunkIndex]) {
      accumulator[chunkIndex] = []; // start a new chunk
    }

    accumulator[chunkIndex].push(item);

    return accumulator;
  }, []);
}

const init = async () => {
  const { submissionId, runId, token, apiKey, passengerIds } = argv;
  console.log({argv})

  if (!token) {
    throw new Error("No token provided");
  }
  if (!apiKey) {
    throw new Error("No apiKey provided");
  }
  if (!runId) {
    throw new Error("No runId provided");
  }

  if (passengerIds) {
    global.passengerIds = passengerIds.split(",");
  }

  global.user = await logInWithRefreshToken(token, apiKey);

  await getSubmission(submissionId);
  await watchRun(submissionId, runId);
  await writeData();
};

const getSubmission = async (submissionId) => {
  const snap = await getDoc(db.submission(submissionId));
  const data = snap.data();
  if(!data) {
    throw new Error(`Submission not found [id: ${submissionId}]`)
  }
  global.submission = data;
  return data;
};

const watchRun = (submissionId, runId) => {
  return new Promise((resolve, reject) => {
    console.log(`KEA: Watching run [id: ${runId}]`);
    return onSnapshot(db.submissionRun(submissionId, runId), (snapshot) => {
      const data = snapshot.data();
      console.log("run snapshot:", {
        status: data?.status,
      });
      if(!data || data.status === "Killed") {
        console.log('Kill code received')
        // Run is marked as killed, so do not continue
        process.exit(2)
      }
      global.run = data;
      resolve(data);
    });
  });
};

const fetchPassengers = async (passengerIds) => {
  console.log(`KEA: Fetching ${passengerIds.length} passengers...`);
  const chunkSize = 10;
  const chunks = chunkArray(passengerIds, chunkSize);
  let data = [];
  for (const chunk of chunks) {
    /* eslint-disable no-await-in-loop */
    const results = await getDocs(
      query(db.passengers(), where("id", "in", chunk))
    );
    data = [...data, ...results.docs.map((doc) => doc.data())];
  }

  console.log(`KEA: Fetched ${data.length} passengers`);
  return data;
};

const getAccount = async (accountId) => {
  const snap = await getDoc(db.account(accountId));
  return snap.data();
};

// Get data and write to data.json
const writeData = async () => {
  const dataFilePath = path.join(os.tmpdir(), "hajonsoft-eagle", "data.json");
  // Generate specific passengers (if specified), or whole submission
  const passengers = await fetchPassengers(global.passengerIds ?? submission.passengerIds);
  const integration = submission.integration;
  const account = await getAccount(submission.accountId);

  // Write data.json file
  const jsonData = await toData(passengers, integration, account);
  fs.ensureFileSync(dataFilePath);
  fs.writeFileSync(dataFilePath, JSON.stringify(jsonData));
};

const updateSubmissionStatus = async (status) => {
  console.log(
    `KEA: Updating submission status to ${status} [id: ${global.submissionId}]`
  );
  return updateDoc(db.submission(global.submission.id), { status });
};

const updateSelectedTraveller = async (value) => {
  console.log(
    `KEA: Updating selectedTraveller to ${value} [id: ${global.run.id}]`
  );
  // optimistic update
  global.run.selectedTraveller = value;
  return updateDoc(db.submissionRun(global.submission.id, global.run.id), {
    selectedTraveller: value,
  });
};

module.exports = {
  init,
  updateSubmissionStatus,
  updateSelectedTraveller,
};
