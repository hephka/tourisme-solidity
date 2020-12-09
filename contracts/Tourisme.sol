// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
import "./TourToken.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Tourisme is Ownable{
    TourToken private token;

    using SafeMath for uint256;

    using Counters for Counters.Counter;
    Counters.Counter private _clientIds;
    Counters.Counter private _offerIds;
    Counters.Counter private _reservationIds;

    address payable _agence;

    address _addrClient;
    address payable _addrAgence;

 
    mapping (address => Client) public clients;

    mapping (uint256 => Offer) public offers;

    mapping (address => mapping(uint256 => Reservation)) public reservationByUser;

    //mapping (address => uint256) public balances_client;

    //mapping (address => uint256) public balances_agence;

    constructor(address owner) public {
        transferOwnership(owner);
    }

    function setTourToken(address tourAddress) external onlyOwner {
        token = TourToken(tourAddress);
    }

    struct Client {
        string name;
        string email;
        uint256 dateRegistration;
    }

    struct Offer {
        string destination;
        uint256 priceTransport;
        uint256 priceTravel;
        uint256 priceRestauration;
        uint256 priceActivity;
        uint256 priceTours;
    }

    struct Reservation {
        bool isTransport;
        bool isTravel;
        bool isRestauration;
        bool isActivity;
        bool isTours;
        uint256 priceinTokens;
    }

    modifier onlyNonMembers() {
        require(clients[msg.sender].dateRegistration == 0, 'only nonClients can use this function');
        _;
    }

    modifier onlyMembers() {
        require(clients[msg.sender].dateRegistration != 0, 'only clients can use this function');
        _;
    }

    function register(string memory _name, string memory _email) public onlyNonMembers {
        _clientIds.increment();
        clients[msg.sender] = Client(_name, _email, block.timestamp);
    }

    function isRegistered(address _addr) public view returns (bool) {
        return clients[_addr].dateRegistration != 0;
    }

    function clientId() public view returns (uint256) {
        return _clientIds.current();
    }

    function getClient(address _addr) public onlyOwner view returns (Client memory) {
        return clients[_addr];
    }
 
    function addOffer(string memory _destination, uint256 _priceTransport, uint256 _priceTravel, uint256 _priceRestauration, uint256 _priceActivity, uint256 _priceTours) public onlyOwner {
        _offerIds.increment();
        offers[_offerIds.current()] = Offer(_destination, _priceTransport, _priceTravel, _priceRestauration, _priceActivity, _priceTours);
    }

    function offerId() public view returns (uint256) {
        return _offerIds.current();
    }

    function getOffer(uint256 _id) public view returns (Offer memory) {
        return offers[_id];
    } 

    function chooseOffer(uint256 _id, bool _isTransport, bool _isTravel, bool _isRestauration, bool _isActivities, bool _isTours) public onlyMembers {
        _reservationIds.increment();
        uint256 totalPrice;
        if (_isTransport == true) {
        totalPrice = totalPrice.add(offers[_id].priceTransport);
        }
        if (_isTravel == true) {
        totalPrice = totalPrice.add(offers[_id].priceTravel);
        }
        if (_isRestauration == true) {
        totalPrice = totalPrice.add(offers[_id].priceRestauration);
        }
        if (_isActivities == true) {
        totalPrice = totalPrice.add(offers[_id].priceActivity);
        }
        if (_isTours == true) {
        totalPrice = totalPrice.add(offers[_id].priceTours);
        }
        reservationByUser[msg.sender][_id] = Reservation(_isTransport, _isTravel, _isRestauration, _isActivities, _isTours, totalPrice);
    }

    function reservationId() public view returns (uint256) {
        return _reservationIds.current();
    }

    function getReservation(uint256 _id) public view returns (Reservation memory) {
        return reservationByUser[msg.sender][_id];
    }
 
    function reserveByClient(uint _id) public onlyMembers {
        token.operatorSend(msg.sender, _addrAgence, reservationByUser[msg.sender][_id].priceinTokens, "", "");
    }
}