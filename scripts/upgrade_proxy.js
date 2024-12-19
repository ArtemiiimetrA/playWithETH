const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "АДРЕС_ВАШЕГО_ПРОКСИ_КОНТРАКТА";
  
  const TokenV2 = await ethers.getContractFactory("ArtyomLovesOlyaV2");
  console.log("Upgrading ArtyomLovesOlya...");
  
  await upgrades.upgradeProxy(proxyAddress, TokenV2);
  console.log("ArtyomLovesOlya upgraded");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 