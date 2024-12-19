const { ethers, upgrades } = require("hardhat");

async function main() {
  const initialSupply = 1000000; // 1 миллион токенов
  const maxSupply = 10000000;    // 10 миллионов токенов

  const Token = await ethers.getContractFactory("ArtyomLovesOlya");
  
  console.log("Deploying ArtyomLovesOlya...");
  const token = await upgrades.deployProxy(Token, [initialSupply, maxSupply], {
    initializer: "initialize",
  });
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("ArtyomLovesOlya proxy deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 