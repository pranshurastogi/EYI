// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title ProofOfHuman
 * @notice Registry of verified ENS-linked humans using Self Protocol
 * @dev Policy is passed into the constructor as args (e.g. age ≥ 13, OFAC check)
 */
contract ProofOfHuman is SelfVerificationRoot {
    // Registry
    mapping(address => bool) public isVerified;
    address[] public verifiedUsers;

    // Last proof snapshot
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    address public lastUserAddress;

    // Policy
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;

    // Events
    event HumanVerified(address indexed user);
    event PolicyRegistered(bytes32 indexed configId);

    /// @param hubV2      Address of Self IdentityVerificationHubV2
    /// @param scopeSeed  Your scope seed string (e.g. "ens-demos")
    /// @param cfg        Policy tuple: (olderThan, forbiddenCountries, ofacEnabled)
    constructor(
        address hubV2,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory cfg
    ) SelfVerificationRoot(hubV2, scopeSeed) {
        verificationConfig = SelfUtils.formatVerificationConfigV2(cfg);
        verificationConfigId = IIdentityVerificationHubV2(hubV2)
            .setVerificationConfigV2(verificationConfig);

        emit PolicyRegistered(verificationConfigId);
    }

    /// Hook called by the Hub when a proof succeeds
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        address user = address(uint160(output.userIdentifier));

        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = user;

        if (!isVerified[user]) {
            isVerified[user] = true;
            verifiedUsers.push(user);
        }

        emit HumanVerified(user);
    }

    /// Hub asks which config to enforce
    function getConfigId(
        bytes32,
        bytes32,
        bytes memory
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /// Helpers for frontend
    function getAllVerifiedUsers() external view returns (address[] memory) {
        return verifiedUsers;
    }

    function totalVerified() external view returns (uint256) {
        return verifiedUsers.length;
    }
}
