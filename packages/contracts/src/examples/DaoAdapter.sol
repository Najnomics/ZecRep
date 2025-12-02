// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ZecRepRegistry } from "../ZecRepRegistry.sol";
import { ZecRepGuards } from "../ZecRepGuards.sol";

/**
 * @title DaoAdapter
 * @notice Example DAO adapter that uses ZecRep for weighted voting.
 *         Demonstrates governance vote multipliers based on reputation tier.
 * 
 * Based on README.md use cases:
 * - No NFT: 1x (base)
 * - Bronze: 1.25x
 * - Silver: 1.5x
 * - Gold: 2x
 * - Platinum: 3x
 */
contract DaoAdapter {
    using ZecRepGuards for ZecRepRegistry;

    ZecRepRegistry public immutable zecRep;

    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        bool support,
        uint256 voteWeight,
        uint256 multiplier
    );
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _zecRep) {
        require(_zecRep != address(0), "DaoAdapter: invalid registry");
        zecRep = ZecRepRegistry(_zecRep);
    }

    /**
     * @dev Create a new governance proposal.
     */
    function createProposal(string calldata description, uint256 votingPeriod) external returns (uint256) {
        uint256 proposalId = ++proposalCount;
        proposals[proposalId] = Proposal({
            description: description,
            forVotes: 0,
            againstVotes: 0,
            deadline: block.timestamp + votingPeriod,
            executed: false
        });
        
        emit ProposalCreated(proposalId, description, proposals[proposalId].deadline);
        return proposalId;
    }

    /**
     * @dev Vote on a proposal with tier-based vote weight.
     *      Requires minimum Bronze tier to vote.
     */
    function vote(uint256 proposalId, bool support) external {
        require(block.timestamp <= proposals[proposalId].deadline, "DaoAdapter: voting closed");
        require(!hasVoted[proposalId][msg.sender], "DaoAdapter: already voted");
        require(!proposals[proposalId].executed, "DaoAdapter: proposal executed");

        // Require minimum Bronze tier
        zecRep.requireTier(msg.sender, uint8(ZecRepRegistry.TierLevel.BRONZE));

        // Base vote weight (can be token holdings, etc.)
        uint256 baseWeight = 100; // Simplified - in practice, use token balance
        
        // Apply tier multiplier
        uint256 multiplier = zecRep.getVoteMultiplier(msg.sender);
        uint256 voteWeight = (baseWeight * multiplier) / 1e18;

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposals[proposalId].forVotes += voteWeight;
        } else {
            proposals[proposalId].againstVotes += voteWeight;
        }

        emit VoteCast(msg.sender, proposalId, support, voteWeight, multiplier);
    }

    /**
     * @dev Execute a proposal if it passed.
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.deadline, "DaoAdapter: voting still open");
        require(!proposal.executed, "DaoAdapter: already executed");
        require(proposal.forVotes > proposal.againstVotes, "DaoAdapter: proposal failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Get effective vote weight for an address.
     */
    function getVoteWeight(address voter, uint256 baseWeight) external view returns (uint256) {
        uint256 multiplier = zecRep.getVoteMultiplier(voter);
        return (baseWeight * multiplier) / 1e18;
    }
}

