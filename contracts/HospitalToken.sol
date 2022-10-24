//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HospitalToken is ERC20 {
    uint256 public totalAmount;
    address public owner;

    constructor(uint _tokenAmount) ERC20("HospitalToken", "HT") {
        totalAmount += _tokenAmount;
        owner = msg.sender;
    }

    event IncreasedSupply(
        uint256 amount
    );
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner have access");
        _;
    }
    function increaseTokenSupply(uint _amount) public payable onlyOwner{
        require(_amount > 0);
        require(msg.value > 0);
        totalAmount += _amount;
        emit IncreasedSupply(_amount);
    }
    function transferOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    receive() external payable {
        revert("Contract cannot receive ether");
    }
}