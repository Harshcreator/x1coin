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

    constructor(
        address _tokenAddress, 
        address _communityFund,
        address _publicSaleAddress
    ) {
        token = X1Coin(_tokenAddress);
        owner = msg.sender;
        communityFund = _communityFund;
        publicSaleAddress = _publicSaleAddress;
        teamVestingWallet = address(new VestingWallet(
            msg.sender,                            
            uint64(block.timestamp),    
            180 days                               
        )); 
    }

    function distribute() external {
        require(msg.sender == owner, "Only owner can distribute");

        // Public Sale (50%)
        token.transferFrom(owner, publicSaleAddress, 500_000_000 * 10 ** token.decimals());
        // Team & Advisors (30%)
        token.transferFrom(owner, teamVestingWallet, 300_000_000 * 10 ** token.decimals());
        // Community Development (20%)
        token.transferFrom(owner, communityFund, 200_000_000 * 10 ** token.decimals());
    }
}   