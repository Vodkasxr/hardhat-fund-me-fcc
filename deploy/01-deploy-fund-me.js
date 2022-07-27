// function deployFunc() {
//     hre.getNamedAccounts()
//      hre.deployments
// }
// module.exports.default = deployFunc
//等于下面2行

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
//等于下面一行

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //if chainId is X use address Yif chainId is Z use address A
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // well what happens when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-------------------------------------------")
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
}
module.exports.tags = ["all", "fundme"]
