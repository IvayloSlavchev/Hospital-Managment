//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract HospitalManagment is AccessControl{
    address public owner;
    uint private payday = block.timestamp + 30 days;
    bytes32 public treatmentHash;

    bytes32 public constant OWNER_ROLE = keccak256("OWNER");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR");
    bytes32[] diagnosticArray;
 
    constructor() {
        owner = msg.sender;
        _setupRole(OWNER_ROLE, msg.sender);
    }
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner have access");
        _;
    }

    struct Doctor {
        uint id;
        address doctor_address;
        uint servedPatients;
        uint tax;
        string education;
        bool hasTookHisSalary;
    }
    struct Patient {
        address patient_address;
        uint amountToPay;
        bytes32 diagnostic;
        bool hasGiveTip;
    }   
    struct RegisteredDiagnostics {
        bytes32[] regDiagnostic;
    } 
    mapping(address => Doctor) public doctor;
    mapping(address => Patient) public patient;
    RegisteredDiagnostics[] rDiagnostic;

    function setRole(address _newDoctor) public onlyOwner {
        _setupRole(DOCTOR_ROLE, _newDoctor);
    }
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != owner, "You are already the owner");

        _revokeRole(OWNER_ROLE, owner);
        _setupRole(OWNER_ROLE, _newOwner);
        owner = _newOwner;
    } 
    function _typeOfTreatment(string memory _treatment, address _patient) public onlyRole(DOCTOR_ROLE) returns(bytes32){
        bytes32 hashTreatment = bytes32(keccak256(abi.encodePacked(_treatment)));
        diagnosticArray.push(hashTreatment);
        RegisteredDiagnostics memory _registeredDiagnostic = RegisteredDiagnostics(diagnosticArray);
        rDiagnostic.push(_registeredDiagnostic);
        
        uint amount_to_pay = uint(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        ))) % 10;

        uint formula = amount_to_pay * bytes(_treatment).length;
        patient[_patient] = Patient(_patient, formula, hashTreatment, false);
        treatmentHash = hashTreatment;
        return hashTreatment;
    } 

    function payHospitalTaxes(bytes32 _diagnoticHash, address _patientAddress) public payable {
        require(msg.value > 0);
        require(_diagnoticHash != "", "Patient didn't provide a diagnostic hash");
        require(_patientAddress != address(0));

        uint tax = patient[_patientAddress].amountToPay + msg.value;  
        payable(address(this)).transfer(tax);
    }

    function isAccountHasARole(bytes32 _role, address _acc) public view returns(bool) {
        return hasRole(_role, _acc);
    }
    function getContractBalance() public view returns(uint){
        return address(this).balance;
    }

    receive() external payable {}
}