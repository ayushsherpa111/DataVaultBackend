const { workerData, parentPort } = require("worker_threads");
const { pbkdf2 } = require("crypto");
function hashUserPass(pass, salt) {
  pbkdf2(pass, salt, parseInt(process.env.HASH_ROUNDS), 32, "whirlpool", (err, key) => {
    if (!err) parentPort.postMessage(key);
  });
}

hashUserPass(workerData.pass, workerData.salt);