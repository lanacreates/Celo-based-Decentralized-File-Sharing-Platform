// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string ipfsHash;
        address owner;
        bool isPublic;
        mapping(address => bool) authorizedUsers;
    }

    mapping(bytes32 => File) private files;
    mapping(address => string[]) private sharedFileHashes;

    event FileAdded(bytes32 indexed fileId, string ipfsHash, address indexed owner, bool isPublic);
    event FileAccessGranted(bytes32 indexed fileId, address indexed user);
    event FileAccessRevoked(bytes32 indexed fileId, address indexed user);
    event FileShared(bytes32 indexed fileId, address indexed recipient);

    function addFile(string memory ipfsHash, bool isPublic) public {
        bytes32 fileId = keccak256(abi.encodePacked(ipfsHash));
        require(files[fileId].owner == address(0), "File already exists");

        files[fileId].ipfsHash = ipfsHash;
        files[fileId].owner = msg.sender;
        files[fileId].isPublic = isPublic;

        emit FileAdded(fileId, ipfsHash, msg.sender, isPublic);
    }

    function getFile(string memory ipfsHash) public view returns (string memory, bool) {
        bytes32 fileId = keccak256(abi.encodePacked(ipfsHash));
        File storage file = files[fileId];
        require(file.owner != address(0), "File does not exist");
        require(file.isPublic || file.owner == msg.sender || file.authorizedUsers[msg.sender], "Access denied");

        return (file.ipfsHash, file.isPublic);
    }

    function grantAccess(string memory ipfsHash, address user) public {
        bytes32 fileId = keccak256(abi.encodePacked(ipfsHash));
        File storage file = files[fileId];
        require(file.owner == msg.sender, "Only the file owner can grant access");

        file.authorizedUsers[user] = true;
        emit FileAccessGranted(fileId, user);
    }

    function revokeAccess(string memory ipfsHash, address user) public {
        bytes32 fileId = keccak256(abi.encodePacked(ipfsHash));
        File storage file = files[fileId];
        require(file.owner == msg.sender, "Only the file owner can revoke access");

        file.authorizedUsers[user] = false;
        emit FileAccessRevoked(fileId, user);
    }

    function shareFile(string memory ipfsHash, address recipient) public {
        bytes32 fileId = keccak256(abi.encodePacked(ipfsHash));
        File storage file = files[fileId];
        require(file.owner == msg.sender, "Only the file owner can share the file");

        file.authorizedUsers[recipient] = true;
        sharedFileHashes[recipient].push(ipfsHash);
        emit FileShared(fileId, recipient);
    }

    function getSharedFiles() public view returns (string[] memory) {
        return sharedFileHashes[msg.sender];
    }
}
