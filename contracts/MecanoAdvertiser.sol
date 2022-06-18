// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;


contract MecanoAdvertiser {
	uint256 totalAdvertisers;
	uint256 campaignPrice;

	address payable public owner;
	mapping(address => uint) public balances;

    event Deposit(address sender, uint amount);
    event Withdrawal(address receiver, uint amount);

	event NewAdvertiser(
		address indexed from,
		uint256 timestamp,
		string productDescription,
		string productName
	);
	address internal cUsdTokenAddress = 0x7Dff0c0715838CC01FDD673d3aF5631869560844;

	modifier isOwner() {
		require(msg.sender == owner, "Only the owner can call this function, pal");
		_;
	}

	constructor (uint _campaignPrice) payable {
		owner = payable(msg.sender);
		campaignPrice = _campaignPrice * (10**18);
	}

	struct Ads {
		address campaigner; // address of the person who wants to run ads.
		string productDescription; // brief description of a product.
		string productName; // Name of product to advertise.
		uint timestamp; // when the advertiser starts the campaign.
	}
	// declare a variable ads the store an array of all Ads campaign.
	Ads[] ads;
	function fundCampaign() public payable {
		require(msg.value >= campaignPrice, "The minimum funding is 1 cUsd");
        emit Deposit(msg.sender, msg.value);
        balances[owner] += msg.value;
		if (msg.sender != owner)
		{
			balances[msg.sender] += msg.value;
		}
    }
	function withdrawAccountFunds(uint amount) public payable isOwner{
        require(balances[owner] >= amount, "Insufficient funds");
        emit Withdrawal(msg.sender, amount);
        balances[owner] -= amount;
		payable(msg.sender).transfer(amount);
    }
	function AccountFunds() public view returns (uint) {
		return balances[owner];
	}

	/* a function to return all Ads.
	   Necessary to return all available ads to our website
	*/
	function getAllads() public view returns (Ads[] memory) {
		return ads;
	}

	function getTotalCampaigners () public view returns (uint) {
		return totalAdvertisers;
	}

	function getCampaignPrice () public view returns (uint) {
		return campaignPrice;
	}

	function updateCampaignPrice(uint _updatePrice) public isOwner {
		require (_updatePrice > 0, "please enter a valid amount");
		campaignPrice = _updatePrice * (10**18);
	}

	function launchCampaign(
		string memory _productDescription,
		string memory _productName
	) public payable {
		require(balances[msg.sender] >= campaignPrice, "Please fund campaign first");
        totalAdvertisers += 1;

        // Store the Ads data in the Ads array.
        ads.push(Ads(msg.sender, _productDescription, _productName, block.timestamp));
        emit NewAdvertiser(msg.sender, block.timestamp, _productDescription, _productName);
	}
	receive() external payable {}

    function destroyContract() public isOwner {
		selfdestruct(payable(cUsdTokenAddress));
	}
}