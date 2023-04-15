// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

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
        uint price;
        address payable seller;
        bool isSold;
    }

    event Offered(
        uint itemId,
        address indexed nft,
        uint indexed tokenId,
        uint price,
        address indexed seller
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
        itemCounter++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        marketItems[itemCounter] = MarketItem(
            itemCounter,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        //emit Offered event
        emit Offered(itemCounter, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        MarketItem storage item = marketItems[_itemId];

        require(_itemId > 0 && _itemId <= itemCounter, "Item does not exist");
        require(
            msg.value >= _totalPrice,
            "not enough ether to cover item price and marketplace fee"
        );
        require(!item.isSold, "Item is already sold");
        //     // pay seller and fee account
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        //update item to sold
        item.isSold = false;
        //transfer NFT to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        //emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint _itemId) public view returns (uint) {
        return (marketItems[_itemId].price * (100 + feePercent)) / 100;
    }
}
