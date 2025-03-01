const MemoryLogger = require("../MemoryLogger");
const CommandRunner = require("../commandRunner");
const path = require("path");
const assert = require("assert");
const Server = require("../server");
const Reporter = require("../reporter");
const sandbox = require("../sandbox");

describe("migrate (empty)", function () {
  let config;
  const project = path.join(
    __dirname,
    "../../sources/migrations/deferred-chain"
  );
  const logger = new MemoryLogger();

  before(async function () {
    await Server.start();
  });
  after(async function () {
    await Server.stop();
  });

  before(async function () {
    this.timeout(10000);
    config = await sandbox.create(project);
    config.network = "development";
    config.logger = logger;
    config.mocha = {
      reporter: new Reporter(logger)
    };
  });

  it("Correctly handles control flow on rejection in deployment", async function () {
    this.timeout(70000);

    try {
      //the migration fails due to
      //https://github.com/trufflesuite/truffle/issues/5225
      //so we have to put it in a try
      await CommandRunner.run("migrate", config);
    } catch {
      //do nothing
    }
    const output = logger.contents();

    console.log(output);
    assert(output.includes("Error in migration:"));
    assert(!output.includes("succeeded"));
  });
});
