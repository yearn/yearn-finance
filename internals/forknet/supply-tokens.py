from brownie import *


def main():
    account0 = "0x0000ce2cc1fd87494432faa18e1878048a4c1b00"
    account1 = "0x0001281035131705eddb774276640d3116cb006a"
    account2 = "0x00022b7dd504ef143b48054b8a9cbcb8de200bc4"
    testAccounts = [account0, account1, account2]

    crvToken = Contract("0xd533a949740bb3306d119cc777fa900ba034cd52")
    crvWhale = accounts.at("0x4ce799e6ed8d64536b67dd428565d52a531b3640", force=True)

    for account in testAccounts:
        crvToken.transfer(account, 100*(10**18), {'from': crvWhale})
