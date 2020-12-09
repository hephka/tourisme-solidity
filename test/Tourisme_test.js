/* eslint-disable no-unused-expressions */
const { contract, accounts } = require('@openzeppelin/test-environment');
const { BN, singletons } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Tourisme = contract.fromArtifact('Tourisme');
const TourToken = contract.fromArtifact('TourToken');
const isSameClient = (_client, client) => {
  return  _client[0] === client.name && _client[1] === client.email;
};
const isSameOffer = (_offer, offer) => {
  return  (
    _offer[0] === offer.destination &&
    _offer[1] === offer.priceTransport &&
    _offer[2] === offer.priceTravel &&
    _offer[3] === offer.priceRestauration &&
    _offer[4] === offer.priceActivity &&
    _offer[5] === offer.priceTours
  )};
const isSameReservation = (_reservation, reservation) => {
  return  (
    _reservation[0] === reservation.isTransport &&
    _reservation[1] === reservation.isTravel &&
    _reservation[2] === reservation.isRestauration &&
    _reservation[3] === reservation.isActivity &&
    _reservation[4] === reservation.isTours
    )};
describe('Tourisme', function () {
  this.timeout(0);
  const NAME = 'Tour';
  const SYMBOL = 'TRM';
  const DECIMALS = 18;
  const INITIAL_SUPPLY = new BN('1000000' + '0'.repeat(DECIMALS));
  // const PRICE = new BN('500' + '0'.repeat(DECIMALS));
  const USER1 = {
    name: 'Alice',
    email: 'alice@mail.com',
  };
  const USER2 = {
    name: 'Bob',
    email: 'bob@mail.com',
  };
  const DEST1 = {
    destination: 'NewYork',
    priceTransport: '50',
    priceTravel: '100',
    priceRestauration: '50',
    priceActivity: '50',
    priceTours: '50',
  };
  const DEST2 = {
    destination: 'Maldives',
    priceTransport: '30',
    priceTravel: '150',
    priceRestauration: '50',
    priceActivity: '40',
    priceTours: '30',
  };
  const RESERV1 = {
    isTransport: true,
    isTravel: true,
    isRestauration: false,
    isActivity: false,
    isTours: false,
  };
  const RESERV2 = {
    isTransport: true,
    isTravel: true,
    isRestauration: true,
    isActivity: true,
    isTours: false,
  };
  const [owner, dev, user1, user2, registryFunder] = accounts;

  before(async function () {
    this.erc1820 = await singletons.ERC1820Registry(registryFunder);
  });

  beforeEach(async function () {
    this.app = await Tourisme.new(owner, { from: dev });
    this.tour = await TourToken.new([this.app.address], { from: dev });
    await this.app.setTourToken(this.tour.address, { from: owner });
  });

  it('increments _clientIds by calling register()', async function () {
    await this.app.register(USER1.name, USER1.email, { from: user1 });
    expect(await this.app.clientId()).to.be.a.bignumber.equal(new BN(1));
  });

  it('add and get client data', async function () {
    await this.app.register(USER1.name, USER1.email, { from: user1 });
    await this.app.register(USER2.name, USER2.email, { from: user2 });
    const _client1 = await this.app.getClient(user1, { from: owner });
    const _client2 = await this.app.getClient(user2, { from: owner });
    expect(isSameClient(_client1, USER1)).to.be.true;
    expect(isSameClient(_client2, USER2)).to.be.true;
  });

  it('add offer data', async function () {
    await this.app.addOffer(
      DEST1.destination, 
      DEST1.priceTransport, 
      DEST1.priceTravel, 
      DEST1.priceRestauration, 
      DEST1.priceActivity, 
      DEST1.priceTours, 
      { from: owner }
      );
    await this.app.addOffer(
      DEST2.destination, 
      DEST2.priceTransport, 
      DEST2.priceTravel, 
      DEST2.priceRestauration, 
      DEST2.priceActivity, 
      DEST2.priceTours, 
      { from: owner }
      );
    const _dest1 = await this.app.getOffer(new BN(1));
    const _dest2 = await this.app.getOffer(new BN(2));
    expect(isSameOffer(_dest1, DEST1)).to.be.true;
    expect(isSameOffer(_dest2, DEST2)).to.be.true;
  });

  it('get reservation data', async function () {
    await this.app.register(USER1.name, USER1.email, { from: user1 });
    await this.app.register(USER2.name, USER2.email, { from: user2 });
    await this.app.addOffer(
      DEST1.destination, 
      DEST1.priceTransport, 
      DEST1.priceTravel, 
      DEST1.priceRestauration, 
      DEST1.priceActivity, 
      DEST1.priceTours, 
      { from: owner }
      );
    await this.app.addOffer(
      DEST2.destination, 
      DEST2.priceTransport, 
      DEST2.priceTravel, 
      DEST2.priceRestauration, 
      DEST2.priceActivity, 
      DEST2.priceTours, 
      { from: owner }
      );
    await this.app.chooseOffer(
      new BN(1), 
      RESERV1.isTransport, 
      RESERV1.isTravel, 
      RESERV1.isRestauration, 
      RESERV1.isActivity, 
      RESERV1.isTours, 
      { from: user1 }
      );
    await this.app.chooseOffer(
      new BN(2), 
      RESERV2.isTransport, 
      RESERV2.isTravel, 
      RESERV2.isRestauration, 
      RESERV2.isActivity, 
      RESERV2.isTours, 
      { from: user2 }
      );
    const _reserv1 = await this.app.getReservation(new BN(1), { from: user1 });
    const _reserv2 = await this.app.getReservation(new BN(2), { from: user2 });
    expect(isSameReservation(_reserv1, RESERV1)).to.be.true;
    expect(isSameReservation(_reserv2, RESERV2)).to.be.true;
    expect(_reserv1.priceinTokens == new BN(150)).to.be.true;
    expect(_reserv2.priceinTokens == new BN(270)).to.be.true;
  });
});
