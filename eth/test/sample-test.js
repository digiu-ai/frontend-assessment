const {expect} = require("chai");
var assert = require('chai').assert;
var exp = ethers.BigNumber.from("10").pow(18);
const initialDepositsBalance = ethers.BigNumber.from("30").mul(exp);
const reward = ethers.BigNumber.from("10").mul(exp);

const alice = ethers.Wallet[1];
const bob = ethers.Wallet[2];
const charlie = ethers.Wallet[3];
const dave = ethers.Wallet[4];
const deposit = ethers.BigNumber.from("2").mul(exp);


describe("TestBank", function () {
    it("Should deploy TestBank contract", async function () {
        const TestBank = await ethers.getContractFactory("TestBank");
        const bank = await TestBank.deploy({value: initialDepositsBalance});
        const supply = ethers.BigNumber.from("30").mul(exp);
        await bank.enroll({from: alice});
        const aliceBalance = await bank.balance({from: alice});
        console.log(aliceBalance)
        console.log(reward)
        expect(aliceBalance).to.equal(reward)
        await bank.enroll({from: bob});
        const bobBalance = await bank.balance({from: bob});
        expect(bobBalance).to.equal(reward, "initial balance is incorrect");

        await bank.enroll({from: charlie});
        const charlieBalance = await bank.balance({from: charlie});
        expect(charlieBalance).to.equal(reward, "initial balance is incorrect");

        await bank.enroll({from: dave});
        const daveBalance = await bank.balance({from: dave});
        expect(daveBalance, 0, "initial balance is incorrect");

        const depositsBalance = await bank.depositsBalance();
        expect(depositsBalance).to.equal(initialDepositsBalance, "initial balance is incorrect");
    });

    it("should deposit correct amount", async () => {
        const TestBank = await ethers.getContractFactory("TestBank");
        const bank = await TestBank.deploy({value: initialDepositsBalance});

        const deposit = ethers.BigNumber.from("2").mul(exp);
        const receipt = await bank.deposit({from: alice, value: deposit});

        const balance = await bank.balance({from: alice});
        expect(balance).to.equal(deposit,
            "deposit amount incorrect, check deposit method");
        const depositsBalance = await bank.depositsBalance();
        expect(depositsBalance).to.equal(ethers.BigNumber.from(deposit).add(initialDepositsBalance));

        const expectedEventResult = {accountAddress: alice, amount: deposit};
        console.log(receipt)
        expect(receipt.contractAddress).to.equal(expectedEventResult.accountAddress);
        expect(receipt.value).to.equal(expectedEventResult.amount);
    });
});


it("should withdraw correct amount", async () => {
    const TestBank = await ethers.getContractFactory("TestBank");
    const bank = await TestBank.deploy({value: initialDepositsBalance});

    await bank.deposit({from: alice, value: deposit});
    await bank.withdraw(deposit, {from: alice});

    const balance = await bank.balance({from: alice});
    assert.equal(balance,deposit - deposit, "withdraw amount incorrect");

});

it("should keep balance unchanged if withdraw greater than balance", async () => {
    const TestBank = await ethers.getContractFactory("TestBank");
    const bank = await TestBank.deploy({value: initialDepositsBalance});
    await bank.deposit({from: alice, value: deposit});
    await bank.withdraw(ethers.BigNumber.from(deposit).add(exp), {from: alice});
    const balance = await bank.balance({from: alice});
    console.log(balance)
    console.log(deposit)
    expect(balance).to.equal(deposit, "balance should be kept intact");
});


it("should revert ether sent to this contract through fallback", async () => {
    const TestBank = await ethers.getContractFactory("TestBank");
    const bank = await TestBank.deploy({value: initialDepositsBalance});

    try {
        await bank.send(deposit, {from: alice});
    } catch (e) {
        assert(e, "Error: VM Exception while processing transaction: revert");
    }

    const depositsBalance = await bank.depositsBalance();
    expect(depositsBalance, initialDepositsBalance, "balance should be kept intact");
});


