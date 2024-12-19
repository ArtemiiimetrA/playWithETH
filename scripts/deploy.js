const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const initialSupply = ethers.parseEther("1000000"); // 1 миллион токенов
  const maxSupply = ethers.parseEther("100000000000");    // 10 миллионов токенов

  const MyToken = await hre.ethers.getContractFactory("ArtyomLovesOlya");
  const myToken = await MyToken.deploy(initialSupply, maxSupply);

  await myToken.waitForDeployment();

  console.log("MyToken deployed to:", await myToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 