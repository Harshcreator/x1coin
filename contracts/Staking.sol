
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is ReentrancyGuard {
    IERC20 public token;
    uint256 public constant REWARD_RATE = 10; // 10% annually
    uint256 public constant LOCK_DURATION = 30 days;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Stake) public stakes;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    modifier hasSufficientBalance(uint256 _amount) {
        uint256 reward = (_amount * REWARD_RATE * LOCK_DURATION) / (365 days * 100);
        require(token.balanceOf(address(this)) >= _amount + reward, "Insufficient contract balance");
        _;
    }

    function fundContract(uint256 _amount) external {
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function stake(uint256 _amount) external {
        token.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender] = Stake({
            amount: _amount,
            timestamp: block.timestamp
        });
    }

    function unstake() external nonReentrant {
        Stake memory userStake = stakes[msg.sender];
        require(block.timestamp >= userStake.timestamp + LOCK_DURATION, "Tokens are locked");

        uint256 reward = (userStake.amount * REWARD_RATE * (block.timestamp - userStake.timestamp)) / (365 days * 100);
        uint256 total = userStake.amount + reward;

        delete stakes[msg.sender];
        token.transfer(msg.sender, total);
    }
}