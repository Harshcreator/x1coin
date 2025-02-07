# X1Coin Blockchain

## Overview
This repository contains the smart contracts and tests for X1Coin, an ERC-20 token powering the X1 ecosystem. The implementation includes:
1. **ERC-20 Token** (1 billion fixed supply)
2. **Token Distribution Mechanism** with vesting
3. **Staking Contract** with rewards
4. Comprehensive test suite

---

## Features

### 1. X1Coin (ERC-20 Token)
- Fixed supply of 1,000,000,000 tokens
- Compliant with ERC-20 standard
- Implements `transfer`, `approve`, `transferFrom`, and `balanceOf`
- Uses OpenZeppelin's audited contracts

### 2. Token Distribution
- Pre-defined allocation:
  - 50% Public Sale
  - 30% Team & Advisors (locked for 6 months)
  - 20% Community Development
- Uses OpenZeppelin's `VestingWallet` for team allocation
- Secure `transferFrom` mechanism for token distribution
- Multi-signature approval for distribution

### 3. Staking System
- Users can stake/unstake X1Coin
- 10% annual fixed reward rate
- 30-day minimum staking period
- Protected by `ReentrancyGuard`

---

## Setup

### Prerequisites
- Node.js (v18+)
- npm/yarn
- Hardhat

### Installation
1. Clone the repository:
   ```bash
    git clone https://github.com/Harshcreator/x1coin-assignment.git
    cd x1coin-assignment
   ```

2. Install dependencies:
   ```bash
    npm install
   ```

3. Compile contracts:
   ```bash
    npx hardhat compile
   ```

4. Run tests:
   ```bash
    npx hardhat test
   ```

5. Test Coverage:
   ```bash
    npx hardhat coverage
   ```

6. Deploy contracts:
   ```bash
    npx hardhat run scripts/deploy.ts
   ```
---

## Smart Contract Details

### Contracts

1. **X1Coin.sol** 
    - Path: `contracts/X1Coin.sol`
    - ERC-20 token with fixed supply of 1,000,000,000 tokens
    - Implements `transfer`, `approve`, `transferFrom`, and `balanceOf`
    - Uses OpenZeppelin's `ERC20` contract

2. **TokenDistributor.sol**
    - Path: `contracts/TokenDistributor.sol`
    - Distributes tokens to team, advisors, and community
    - Uses OpenZeppelin's `VestingWallet` for team allocation
    - Secure `transferFrom` mechanism for token distribution
    - Multi-signature approval for distribution
    - Requires explicit approval before distribution

3. **Staking.sol**
    - Path: `contracts/Staking.sol`
    - Allows users to stake/unstake X1Coin
    - 10% annual fixed reward rate
    - 30-day minimum staking period
    - Protected by `ReentrancyGuard`
    - Reward Formula: `(stakedAmount * 10% * timeStaked) / 365 days`

### Security

1. Users OpenZeppelin's audited contracts
2. Implemets:
    - `Ownable` for contract ownership
    - `ReentrancyGuard` to prevent reentrancy attacks
    - `SafeMath` for arithmetic operations
    - `Pausable` for emergency stop
    - `VestingWallet` for team allocation
    - Time-locked vesting for team allocation
    - Comprehensive unit tests (90%+ coverage)
    - ERC-20 transferFrom for secure token distribution

### Tokenomics

| Allocation       | Percentage | Vesting Period    | Tokens         |
|------------------|------------|-------------------|----------------|
| Public Sale      | 50%        | Immediate         | 500,000,000    |
| Team & Advisors  | 30%        | 6 months          | 300,000,000    |
| Community Dev    | 20%        | Immediate         | 200,000,000    |

### Testing

- Tests simulate time jumps for vesting and staking
- Staking contract is pre-funded with rewards

### Troubleshooting

1. Type Errors:
    - Make sure you have the correct version of Node.js installed
    - Run `npm install` to install dependencies
    - Run `npx hardhat compile` to compile contracts

2. Insuffecient Balance:
    - Ensure the `TokenDistributor` is approved to spend tokens
    - Verify `distribute()` is called after deployment

---