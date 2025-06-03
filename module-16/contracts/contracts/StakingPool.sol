// contracts/contracts/StakingPool.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // If using ERC20 rewards
// import "./interfaces/ILuminaCoin.sol"; // Uncomment if using LMC as rewards

/**
 * @title StakingPool
 * @author Cascade (Generated)
 * @notice Allows users to stake ETH and earn rewards (defaulting to ETH rewards).
 * @dev Implements a basic reward distribution mechanism based on time staked.
 */
contract StakingPool is Ownable, ReentrancyGuard {

    // === State ===
    mapping(address => uint256) public stakedBalances; // User => Staked ETH amount
    uint256 public totalStaked;
    address public immutable rewardToken; // Address of reward token (0 for ETH), set at deploy time

    // --- Reward Calculation State ---
    uint256 public rewardRate; // Rewards per second (scaled to 18 decimals)
    uint256 public lastUpdateTime; // Timestamp of the last global reward calculation update
    uint256 public rewardPerTokenStored; // Accumulated rewards per staked token unit (scaled by PRECISION)
    mapping(address => uint256) public userRewardPerTokenPaid; // Tracks how much reward-per-token user has already accounted for
    mapping(address => uint256) public rewards; // User => Earned but unclaimed reward amount (scaled to 18 decimals)

    uint256 constant PRECISION = 1 ether; // 1e18

    // === Events ===
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateSet(uint256 newRate);
    // event RewardTokenSet(address indexed tokenAddress); // Removed as rewardToken is immutable

    // === Errors ===
    error AmountMustBeGreaterThanZero();
    error InsufficientStakedBalance();
    error TransferFailed();
    error NothingToClaim();
    error InvalidRewardRate();
    error InvalidAddress();

    /**
     * @notice Constructor
     * @param _initialOwner The initial owner address.
     * @param _initialRewardRate Initial rewards per second (scaled by 1e18).
     * @param _rewardTokenAddress Address of the ERC20 reward token, or address(0) for ETH rewards.
     */
    constructor(address _initialOwner, uint256 _initialRewardRate, address _rewardTokenAddress) Ownable(_initialOwner) {
        if (_initialRewardRate == 0) revert InvalidRewardRate(); // Must have some reward rate initially
        rewardRate = _initialRewardRate;
        lastUpdateTime = block.timestamp;
        rewardToken = _rewardTokenAddress; // Set once at deployment
        emit RewardRateSet(_initialRewardRate);
    }

    // === Modifiers ===
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    // === External Functions ===

    /**
     * @notice Stakes ETH into the pool.
     * @dev User must send ETH with the transaction. Applies reward update for the user.
     */
    function stake() external payable nonReentrant updateReward(msg.sender) {
        if (msg.value == 0) revert AmountMustBeGreaterThanZero();

        stakedBalances[msg.sender] += msg.value;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    /**
     * @notice Unstakes ETH from the pool and claims pending rewards.
     * @param _amount The amount of ETH to unstake.
     * @dev Applies reward update for the user before unstaking.
     */
    function unstake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        if (_amount == 0) revert AmountMustBeGreaterThanZero();
        uint256 userStake = stakedBalances[msg.sender];
        if (_amount > userStake) revert InsufficientStakedBalance();

        // Update balances before external calls
        stakedBalances[msg.sender] = userStake - _amount;
        totalStaked -= _amount;

        // Claim pending rewards first
        uint256 rewardAmount = rewards[msg.sender];
        if (rewardAmount > 0) {
            rewards[msg.sender] = 0; // Clear pending rewards before payment
            _payReward(msg.sender, rewardAmount);
        }

        // Transfer staked ETH back to user
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        if (!success) revert TransferFailed(); // Note: Reverting here might leave rewards paid but stake not returned. Consider edge cases.

        emit Unstaked(msg.sender, _amount);
    }

    /**
     * @notice Claims pending rewards for the caller.
     * @dev Applies reward update for the user before claiming.
     */
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 rewardAmount = rewards[msg.sender];
        if (rewardAmount == 0) revert NothingToClaim();

        rewards[msg.sender] = 0; // Clear pending reward before payment
        _payReward(msg.sender, rewardAmount);
    }

    // === Public View Functions ===

    /**
     * @notice Calculates the current accumulated rewards per staked token unit since the contract's inception or last update.
     * @return The amount of rewards accumulated per token unit (scaled by PRECISION).
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored; // No change if no stake
        }
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        // Calculate additional rewards generated per token unit since last update
        // rewardPerToken = (rewardRate * timeElapsed * PRECISION) / totalStaked
        uint256 additionalRewardPerToken = (rewardRate * timeElapsed * PRECISION) / totalStaked;
        return rewardPerTokenStored + additionalRewardPerToken;
    }

    /**
     * @notice Calculates the amount of rewards earned by a user but not yet claimed.
     * @param _account The address of the user.
     * @return The amount of rewards earned (scaled by PRECISION).
     * @dev Based on the reward rate, time elapsed, and staked balance.
     */
    function earned(address _account) public view returns (uint256) {
        uint256 currentRewardPerToken = rewardPerToken();
        uint256 userStake = stakedBalances[_account];
        uint256 userPaidOut = userRewardPerTokenPaid[_account];
        uint256 userPending = rewards[_account]; // Rewards calculated but not yet paid

        // Formula: earned = (balance * (currentRewardPerToken - userRewardPerTokenPaid) / PRECISION) + userPendingRewards
        return (userStake * (currentRewardPerToken - userPaidOut) / PRECISION) + userPending;
    }

    /**
     * @notice Calculates the approximate APY based on the current reward rate and total staked amount.
     * @dev This is a point-in-time estimate and assumes constant conditions.
     *      Returns APY as a percentage scaled by 100 (e.g., 500 means 5.00%).
     */
    function getApy() public view returns (uint256) {
        if (totalStaked == 0 || rewardRate == 0) {
            return 0;
        }

        uint256 secondsInYear = 365 days;
        // Rewards generated per year = rewardRate * secondsInYear (scaled by 1e18)
        uint256 yearlyRewards = rewardRate * secondsInYear;

        // APY = (Yearly Rewards / Total Staked) * 100
        // (yearlyRewards * 100 * PRECISION) / totalStaked / PRECISION
        uint256 apyScaled = (yearlyRewards * 100 * PRECISION) / totalStaked; // Result scaled by PRECISION

        // Return as percentage * 100 (e.g., 500 for 5.00%)
        return apyScaled / (PRECISION / 100);
     }

    // === Admin Functions ===

    /**
     * @notice Updates the reward rate. Can only be called by the owner.
     * @param _newRate The new reward rate per second (scaled by PRECISION).
     * @dev Updates the global reward state before changing the rate.
     */
    function setRewardRate(uint256 _newRate) external onlyOwner updateReward(address(0)) { // Update global state before changing rate
        if (_newRate == 0) revert InvalidRewardRate(); // Cannot set rate to zero
        rewardRate = _newRate;
        emit RewardRateSet(_newRate);
    }

    /**
     * @notice Allows owner to deposit ETH rewards into the contract. Only needed if using ETH rewards.
     * @dev This function is payable.
     */
    function depositRewardEth() external payable onlyOwner {
        // No specific logic needed other than accepting ETH
    }

     /**
     * @notice Allows owner to withdraw surplus ETH from the contract (e.g., excess reward deposits). Only for ETH rewards.
     * @param _amount Amount of ETH to withdraw.
     * @param _to Address to send the ETH to.
     */
    function withdrawSurplusEth(uint256 _amount, address payable _to) external onlyOwner {
         if (rewardToken != address(0)) revert("StakingPool: Not applicable for ERC20 rewards");
         if (_to == address(0)) revert InvalidAddress();
         if (_amount == 0) revert AmountMustBeGreaterThanZero();
         // Basic check: ensure withdrawal doesn't exceed non-staked balance
         // A more robust check would track reward deposits vs payouts.
         if (_amount > address(this).balance - totalStaked) revert("StakingPool: Insufficient surplus ETH");

         (bool success, ) = _to.call{value: _amount}("");
         if (!success) revert TransferFailed();
    }

    // === Internal Functions ===

    /**
     * @notice Internal function to handle the actual reward payment (ETH or ERC20).
     * @param _user The address receiving the reward.
     * @param _amount The amount of reward token to pay.
     * @dev Internal function called by claimReward. Requires sufficient reward token balance in the contract.
     */
    function _payReward(address _user, uint256 _amount) internal {
        if (_amount == 0) return; // Nothing to pay

        if (rewardToken == address(0)) {
            // Pay ETH reward
            if (address(this).balance >= _amount) { // Ensure contract has enough ETH
                 (bool success, ) = payable(_user).call{value: _amount}("");
                 if (!success) {
                     // Revert or log? If it fails, the user's 'rewards' were already reset.
                     // This could lead to lost rewards if the transfer fails consistently.
                     // For now, we revert, which means the entire claim/unstake tx fails.
                     revert TransferFailed();
                 }
            } else {
                // Not enough ETH in contract to pay reward
                revert("StakingPool: Insufficient ETH balance for reward payment");
            }
        } else {
            // Pay ERC20 reward
            // Ensure contract holds enough rewardToken
            if (IERC20(rewardToken).balanceOf(address(this)) >= _amount) {
                bool success = IERC20(rewardToken).transfer(_user, _amount);
                if (!success) {
                     // Similar issue: revert if transfer fails.
                     revert TransferFailed();
                 }
            } else {
                 revert("StakingPool: Insufficient reward token balance for payment");
            }
        }
        emit RewardPaid(_user, _amount);
    }

    receive() external payable {} //allows funding the contract directly with ETH for rewards
}