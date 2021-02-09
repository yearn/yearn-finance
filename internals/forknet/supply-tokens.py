from brownie import *


def main():
    account0 = "0x0000ce2cc1fd87494432faa18e1878048a4c1b00"
    account1 = "0x0001281035131705eddb774276640d3116cb006a"
    account2 = "0x00022b7dd504ef143b48054b8a9cbcb8de200bc4"
    testAccounts = [account0, account1, account2]

    crvToken = Contract.from_explorer("0xD533a949740bb3306d119CC777fa900bA034cd52")
    yfiToken = Contract.from_explorer("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e")
    daiToken = Contract.from_explorer("0x6b175474e89094c44da98b954eedeac495271d0f")

    crvWhale = accounts.at("0x4ce799e6ed8d64536b67dd428565d52a531b3640", force=True)
    ethWhale = accounts.at("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", force=True)
    yfiWhale = accounts.at("0xfeb4acf3df3cdea7399794d0869ef76a6efaff52", force=True)
    daiWhale = accounts.at("0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f", force=True)

    for account in testAccounts:
        ethWhale.transfer(account, "100 ether")
        crvToken.transfer(account, "1000 ether", {'from': crvWhale})
        yfiToken.transfer(account, "1000 ether", {'from': yfiWhale})
        daiToken.transfer(account, "1000000 ether", {'from': daiWhale})
