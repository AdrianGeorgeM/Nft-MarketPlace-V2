// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    //State Variables
    address payable public immutable feeAccount; // the account that receives the fees
    uint public immutable feePercent; // the fee percentage
    uint public itemCounter; // the number of items in the marketplace

    struct MarketItem {
        // the struct that represents an item in the marketplace (NFT)
        uint itemId;
        IERC721 nft;
        uint tokenId;
        address payable seller;
        uint price;
        bool isSold;
    }

    event Offered(
        uint itemId,
        address indexed nft,
        uint indexed tokenId,
        address indexed seller,
        uint price
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );
    // itemId => MarketItem mapping
    mapping(uint => MarketItem) public marketItems;

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    // createMarketItem() function to create a new item in the marketplace
    function createMarketItem(
        IERC721 _nft,
        uint _tokenId,
        uint _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        itemCounter++;

        marketItems[itemCounter] = MarketItem(
            itemCounter,
            _nft,
            _tokenId,
            payable(msg.sender),
            _price,
            false
        );

        //emit Offered event
        emit Offered(itemCounter, address(_nft), _tokenId, msg.sender, _price);
    }

    function getTotalPrice(uint _itemId) public view returns (uint) {
        return (marketItems[_itemId].price * (100 + feePercent)) / 100;
    }
}
