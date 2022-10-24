const { expect } = require('chai');
const { ethers } = require('hardhat');
const { TASK_COMPILE_SOLIDITY_LOG_RUN_COMPILER_START } = require('hardhat/builtin-tasks/task-names');

describe.only("HospitalManagmentSystem", () => {
    let contract, Contract, owner, doctor, user;

    beforeEach(async () => {
        Contract = await ethers.getContractFactory('HospitalManagment');
        contract = await Contract.deploy();
        await contract.deployed();

        [owner, doctor, user] = await ethers.getSigners();
    })

    it("Should show the owner", async () => {
        const boss = await contract.owner();
        expect(boss).to.be.equal('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    })
    it('Should allow the admin to set a role, render owner\'s role and doctor\'s role', async () => {
        const isOwner = await contract.isAccountHasARole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER')), owner.address);
        expect(isOwner).to.be.equal(true);

        //Owner should set role to the doctors
        const setRole = await contract.setRole(doctor.address);
        const isDoctor = await contract.isAccountHasARole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('DOCTOR')), doctor.address);
        expect(isDoctor).to.be.equal(true);
    })
    it('Should transfer ownership from owner to user || and should fail if user tries to call it', async () => {
        const oldOwner = await contract.owner();
        console.log(`Old owner is: ${oldOwner}`);
        await contract.transferOwnership(user.address);
        const isOwner = await contract.isAccountHasARole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER')), user.address);
        expect(isOwner).to.be.equal(true);
        const newOwner = await contract.owner();
        console.log(`New owner: ${newOwner}`);
    })
    it('Should fail if user tries to call function that is only avaiable for owner or doctors', async () => {
        //User tries to transfer the ownership
        expect(contract.connect(user.address).transferOwnership(doctor.address)).to.be.reverted;
        const isAdminChanged = await contract.isAccountHasARole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER')), user.address);
        const isOwnerChanged = await contract.owner();
        console.log(`Owner: ${isOwnerChanged}`)
        expect(isAdminChanged).to.be.equal(false);
    })
    it("Patient should be able to transfer money to the contract and balance of the contract should increase", async () => {

    })
    describe('Serving patients', () => {
        let contract, Contract, owner, doctor, user;


        beforeEach(async () => {
            Contract = await ethers.getContractFactory('HospitalManagment');
            contract = await Contract.deploy();
            await contract.deployed();

            [owner, doctor, user] = await ethers.getSigners();
        })

        it('Should admin to make doctor with doctor role || allow the doctor to add diagnostic || patient to pay', async () => {
            await contract.setRole(doctor.address);
            const isDoctor = await contract.isAccountHasARole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('DOCTOR')), doctor.address);
            expect(isDoctor).to.be.equal(true);

            await contract.connect(doctor)._typeOfTreatment("Flu", user.address);
            const hash = await contract.treatmentHash();
            console.log(hash)
            expect(hash).to.be.equal('0x2e1b95ad7f7cdbe61fd3f492b23ab7fe16341ae3f52527d4ce6a68cf0ee796b3')

            const amount2Pay = await contract.patient(user.address);
            console.log(amount2Pay.amountToPay)
            const patientCallsPayFunction = await contract.connect(hash, user.address, { value: amount2Pay.amountToPay });
            expect(patientCallsPayFunction).to.not.be.reverted;
        })
    })
    describe('Doctors functions', () => {
        let contract, Contract, owner, doctor, user;
        let tokenContract, TokenContract;
        const sendEther = ethers.utils.parseEther('1')

        beforeEach(async () => {
            Contract = await ethers.getContractFactory('HospitalManagment');
            contract = await Contract.deploy();
            await contract.deployed();

            TokenContract = await ethers.getContractFactory('HospitalToken');
            tokenContract = await TokenContract.deploy(100000);
            await tokenContract.deployed();

            [owner, doctor, user] = await ethers.getSigners();

            await contract.setRole(doctor.address);
        })
        it("Should allow the owner to transfer tokens to the doctors and allow them to withdraw", async () => {
            await contract.salary(contract.address, 10000, { value: sendEther });
            const contractBalance = await contract.getContractBalance();
            expect(contractBalance).to.be.equal("1000000000000000000");

            await contract.connect(doctor).withdrawBalance(5000);
            const doctorsBalance = await ethers.provider.getBalance(doctor.address);
            console.log(doctorsBalance);

            //User tries to withdraw
            expect(contract.connect(user).withdrawBalance(3000)).to.be.reverted;
        });
    })
})