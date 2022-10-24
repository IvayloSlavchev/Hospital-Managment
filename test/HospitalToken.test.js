const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Hospital Token", () => {
    let HospitalToken, hospitalToken, owner, attacker;
    
    const increaseTokenEth = ethers.utils.parseEther('1');
    beforeEach(async () => {
        HospitalToken = await ethers.getContractFactory('HospitalToken');
        hospitalToken = await HospitalToken.deploy();
        await hospitalToken.deployed();

        [owner, attacker] = await ethers.getSigners();
    })

    it('Owner should be able to increase total supply', async () => {
        expect(await hospitalToken.owner()).to.be.equal('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
        expect(await hospitalToken.totalAmount()).to.be.equal(10000);

        await hospitalToken.increaseTokenSupply(2000, { value: increaseTokenEth });
        expect(await hospitalToken.totalAmount()).to.be.equal(12000);
    })
    it('Should not allow user to increase token supply and direcly send ether to contact', async () => {
        expect(hospitalToken.connect(attacker).increaseTokenSupply(3000, { value: increaseTokenEth })).to.be.revertedWith('Only owner have access');
        expect(await hospitalToken.totalAmount()).to.be.equal(10000);
    })
})