// SPDX-License-Identifier: MIT LICENSE
pragma solidity 0.8.4;

import "openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCount;

    constructor() ERC721("Adrian NFT", "ANFT") {}

    function mint(string memory _tokenURI) external return (uint) {
        tokenCount++; 
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        return tokenCount;
    }
}
