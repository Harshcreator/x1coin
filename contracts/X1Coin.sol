// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract X1Coin is ERC20 {
    constructor() ERC20("X1Coin", "X1C") {
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals()); // 1B tokens to deployer
    }
}
