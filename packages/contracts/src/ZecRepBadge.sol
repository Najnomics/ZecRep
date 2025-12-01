// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ZecRepBadge
 * @notice Soulbound ERC-721 that captures a ZecRep tier and score per wallet.
 *         The attached metadata URI is derived from the tier definition so we only
 *         need to update it whenever the tier configuration changes.
 */
contract ZecRepBadge is ERC721, AccessControl {
    using Strings for uint256;

    error Soulbound();
    error InvalidTier();

    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");

    // tier => metadata uri
    mapping(uint8 tier => string) private _tierURIs;
    // tokenId => tier
    mapping(uint256 tokenId => uint8) private _tokenTier;
    // tokenId => score
    mapping(uint256 tokenId => uint16) private _tokenScore;

    string private _contractURI;

    event TierURISet(uint8 indexed tier, string uri);
    event ContractURISet(string newURI);
    event BadgeUpserted(address indexed account, uint8 tier, uint16 score);

    constructor(address admin, address registry) ERC721("ZecRep Reputation", "ZECREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(METADATA_ROLE, admin);
        if (registry != address(0)) {
            _grantRole(REGISTRY_ROLE, registry);
        }
    }

    /**
     * @dev Soulbound mint/update entrypoint reserved for the registry.
     */
    function mintOrUpdate(address account, uint8 tier, uint16 score)
        external
        onlyRole(REGISTRY_ROLE)
        returns (uint256)
    {
        if (tier == 0 || bytes(_tierURIs[tier]).length == 0) {
            revert InvalidTier();
        }
        uint256 tokenId = uint256(uint160(account));
        bool exists = _ownerOf(tokenId) != address(0);

        if (exists) {
            _tokenTier[tokenId] = tier;
            _tokenScore[tokenId] = score;
        } else {
            _safeMint(account, tokenId);
            _tokenTier[tokenId] = tier;
            _tokenScore[tokenId] = score;
        }

        emit BadgeUpserted(account, tier, score);
        return tokenId;
    }

    function setTierURI(uint8 tier, string calldata uri) external onlyRole(METADATA_ROLE) {
        if (tier == 0) revert InvalidTier();
        _tierURIs[tier] = uri;
        emit TierURISet(tier, uri);
    }

    function setContractURI(string calldata newURI) external onlyRole(METADATA_ROLE) {
        _contractURI = newURI;
        emit ContractURISet(newURI);
    }

    function tierURI(uint8 tier) external view returns (string memory) {
        return _tierURIs[tier];
    }

    function tokenTier(uint256 tokenId) external view returns (uint8) {
        _requireOwned(tokenId);
        return _tokenTier[tokenId];
    }

    function tokenScore(uint256 tokenId) external view returns (uint16) {
        _requireOwned(tokenId);
        return _tokenScore[tokenId];
    }

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    /**
     * @dev Override tokenURI to return the tier specific metadata.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory tierUri = _tierURIs[_tokenTier[tokenId]];
        return tierUri;
    }

    /**
     * @dev Prevent transfers between non-zero addresses to keep the token soulbound.
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert Soulbound();
        }
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

