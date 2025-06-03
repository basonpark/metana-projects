// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

/**
 * @title MyGovernor
 * @dev A basic DAO Governor contract setup using OpenZeppelin modules.
 * - GovernorSettings: Configures voting delay, period, proposal threshold.
 * - GovernorCountingSimple: Allows simple Yes/No/Abstain voting.
 * - GovernorVotes: Uses an ERC20Votes token for voting power.
 * - GovernorVotesQuorumFraction: Sets quorum as a percentage of total token supply.
 * - GovernorTimelockControl: Integrates with a TimelockController for execution delay.
 */
contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    /**
     * @dev Constructor: Initializes the Governor with core parameters and dependencies.
     * @param _token The address of the ERC20Votes governance token.
     * @param _timelock The address of the TimelockController contract.
     * @param _votingDelay The delay (in blocks) from proposal creation until voting starts.
     * @param _votingPeriod The duration (in blocks) for which voting is open.
     * @param _proposalThreshold The minimum number of votes required to create a proposal (set to 0 initially).
     * @param _quorumPercentage The percentage of total voting power required for a proposal to pass (e.g., 4 for 4%).
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,       // In blocks
        uint256 _votingPeriod,      // In blocks
        uint256 _proposalThreshold, // Typically 0 for initial setup
        uint256 _quorumPercentage   // e.g., 4 = 4% quorum
    )
        Governor("MyGovernorDAO") // Name of the Governor instance
        GovernorSettings(uint48(_votingDelay), uint32(_votingPeriod), _proposalThreshold)
        GovernorVotes(_token) // Links to the governance token
        GovernorVotesQuorumFraction(_quorumPercentage) // Sets the initial quorum
        GovernorTimelockControl(_timelock) // Links to the timelock
    {
        // GovernorCountingSimple does not have a constructor to call
    }

    // --- Function Overrides (Required by OpenZeppelin Governor modules) ---

    /**
     * @dev See {IGovernor-votingDelay}.
     */
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    /**
     * @dev See {IGovernor-votingPeriod}.
     */
    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    /**
     * @dev See {IGovernor-proposalThreshold}.
     */
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    /**
     * @dev See {IGovernor-quorum}.
     * Using GovernorVotesQuorumFraction extension.
     */
    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    /**
     * @dev See {IGovernor-getVotes}.
     * Using GovernorVotes extension.
     */
    function getVotes(address account, uint256 blockNumber) public view override(Governor) returns (uint256) {
        return super.getVotes(account, blockNumber);
    }

    /**
     * @dev See {IGovernor-state}.
     */
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    /**
     * @dev See {IGovernor-propose}.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256 proposalId) {
        // Note: Access control (e.g., checking proposalThreshold) is handled by the Governor contract.
        return super.propose(targets, values, calldatas, description);
    }

    /**
     * @dev See {Governor-proposalNeedsQueuing}.
     * Required because both Governor and GovernorTimelockControl might define it.
     */
    function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    /**
     * @dev See {Governor-_queueOperations}.
     * Required by GovernorTimelockControl.
     */
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev See {Governor-_executeOperations}.
     * Required by GovernorTimelockControl.
     */
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev See {Governor-_cancel}.
     * Incorporates Timelock cancellation logic.
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /**
     * @dev See {Governor-_executor}.
     * Returns the Timelock controller address.
     */
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view override(Governor) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 