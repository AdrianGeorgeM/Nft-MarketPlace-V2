pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    //State Variables
    address payable public immutable feeAccount; // the account that receives the fees
    uint public immutable feePercent; // the fee percentage
    uint public itemCounter; // the number of items in the marketplace

    // what is Struct ?

    // Struct is a user defined data type which is used to combine data items of different kinds.

    struct MarketItem {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool isSold;
    }

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }
}
