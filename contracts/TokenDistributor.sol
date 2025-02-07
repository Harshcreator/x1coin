// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "./X1Coin.sol";

contract TokenDistributor {
    X1Coin public token;
    address public teamVestingWallet;
    address public owner;
    address public communityFund;
    address public publicSaleAddress;
    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public requiredSignatures;
    mapping(bytes32 => uint256) public approvals;

    constructor(
        address _tokenAddress, 
        address _communityFund,
        address _publicSaleAddress,
        address[] memory _signers,
        uint256 _requiredSignatures
    ) {
        require(_signers.length >= _requiredSignatures, "Not enough signers");
        token = X1Coin(_tokenAddress);
        owner = msg.sender;
        communityFund = _communityFund;
        publicSaleAddress = _publicSaleAddress;
        teamVestingWallet = address(new VestingWallet(
            msg.sender,                            
            uint64(block.timestamp),    
            180 days                               
        ));
        signers = _signers;
        requiredSignatures = _requiredSignatures;
        for (uint256 i = 0; i < _signers.length; i++) {
            isSigner[_signers[i]] = true;
        }
    }

    function distribute() public {
        require(isSigner[msg.sender], "Not a signer");
        bytes32 txHash = keccak256(abi.encodePacked("distribute"));
        approvals[txHash] += 1;
        if (approvals[txHash] >= requiredSignatures) {
            // Public Sale (50%)
            token.transferFrom(owner, publicSaleAddress, 500_000_000 * 10 ** token.decimals());
            // Team & Advisors (30%)
            token.transferFrom(owner, teamVestingWallet, 300_000_000 * 10 ** token.decimals());
            // Community Development (20%)
            token.transferFrom(owner, communityFund, 200_000_000 * 10 ** token.decimals());
            approvals[txHash] = 0; // Reset approvals
        }
    }
}