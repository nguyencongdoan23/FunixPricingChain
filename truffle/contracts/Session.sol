// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Main.sol";

// Interface of Main contract to call from Session contract
interface IMain {
    function addSession(address session) external;
}

contract Session {
    // Variable to hold Main Contract Address when create new Session Contract
    address internal mainContract;
    // Variable to hold Main Contract instance to call functions from Main
    Main MainContract;

    // TODO: Variables
    enum State {INIT, START, STOP, PRICING, CLOSE}

    struct IProduct {
        address session;
        string name;
        string description;
        string image;
        int proposedPrice;
        int finalPrice;
        State state;
    }

    // thong tin nguoi tham gia phien dau gia
    struct Participant {
        address account;
        int price;
        int deviation;
    }

    State public state;
    IProduct internal _iProducts;

    Participant[] internal _participants;
    // account => participant
    mapping (address => Participant) internal _mpParticipants;

    address internal admin;
    address internal session;
    uint private _timeout;
    uint private _startTime;

    event createProduct(string name, address session, string description, string image, State state);
    event updateProduct(string name, address session, string description, string image, State state);
    event updateStatePricingSession(address session, State state);
    event registerParticipant(address session, address account, int price);

    constructor(address _mainContract,
        // Other arguments
        string memory name, string memory description, string memory image
    ) {
        // Get Main Contract instance
        mainContract = _mainContract;
        MainContract = Main(_mainContract);

        // TODO: Init Session contract
        state = State.INIT;
        // Call Main Contract function to link current contract.
        session = address(this);
        MainContract.addSession(session);
        admin = MainContract.getAdmin();

        _iProducts.session = session;
        _iProducts.name = name;
        _iProducts.description = description;
        _iProducts.image = image;
        _iProducts.state = State.INIT;

        emit createProduct(name, session, description, image, State.INIT);
    }

    modifier onlyState(State stateRequired) {
        require(state == stateRequired, "Invalid state!");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not owner of session!");
        _;
    }

    modifier checkAccountHasExists(address account) {
        MainContract = Main(mainContract);
        require(MainContract.checkAccountHasExists(account, session), "Address hasn't exists!");
        _;
    }

    function getProduct() public view returns (IProduct memory) {
        return _iProducts;
    }

    function updateSession(string memory name, string memory description, string memory image) public onlyAdmin {
        _iProducts.name = name;
        _iProducts.description = description;
        _iProducts.image = image;

        emit updateProduct(name, session, description, image, _iProducts.state);
    }

    function startPricingSession() public onlyAdmin onlyState(State.INIT) {
        _startTime = block.timestamp;
        _updateStatePricingSession(State.START);
    }

    function stopPricingSession() public onlyAdmin onlyState(State.START) {
        _updateStatePricingSession(State.STOP);
    }

    function closePricingSession() onlyAdmin public onlyState(State.STOP) {
        _updateStatePricingSession(State.CLOSE);
    }

    function _updateStatePricingSession(State newState) internal {
        state = newState;
        _iProducts.state = state;

        emit updateStatePricingSession(session, state);
    }
    
    function setTimeout(uint timeout) public onlyAdmin {
        _timeout = timeout * 1 seconds;
    }

    function setProposedPrice(address account, int price) public onlyState(State.START) checkAccountHasExists(account) returns (bool) {
        if(_timeout > 0) {
            if(block.timestamp > (_startTime + _timeout)) {
                _updateStatePricingSession(State.STOP);
                return false;
            }
        }

        if(_mpParticipants[account].account == address(0))
            _registerSessionParticipant(account, price);
        else {
            uint index = _getIndexParticipantByAccount(account);
            _participants[index].price = price;
            _mpParticipants[account] = _participants[index];
        }
        _caculatorProposedPrice();
        return true;
    }

    function _getIndexParticipantByAccount(address account) internal view returns (uint) {
        for(uint i = 0; i < _participants.length; i++) {
            if(_participants[i].account == account)
                return i;
        }
        revert("Not found participant by account!");
    }

    function _registerSessionParticipant(address account, int price) internal {
        MainContract = Main(mainContract);
        int deviation = MainContract.getDeviationOfParticipant(account, session);

        Participant memory participant = Participant(account, price, deviation);
        _participants.push(participant);
        _mpParticipants[account] = participant;

        MainContract.updateNumberOfPricingSessionByAccount(account, session);

        emit registerParticipant(session, account, price);
    }

    function setFinalPrice(int finalPrice) public onlyAdmin onlyState(State.STOP) {
        _iProducts.finalPrice = finalPrice;
        closePricingSession();
        _caculatorDeviationOfParticipant();
    }

    function _caculatorProposedPrice() internal {
        int sPriceGivenByParticipant = _sumPriceGivenByParticipant();
        int sDeviationOfParticipant = _sumDeviationOfParticipant();
        uint n = _participants.length;

        int proposedPrice = 0;
        proposedPrice = sPriceGivenByParticipant / (100 * int(n) - sDeviationOfParticipant);

        _iProducts.proposedPrice = proposedPrice;
    }

    function _sumPriceGivenByParticipant() internal view returns (int) {
        int sum = 0;
        for (uint i = 0; i < _participants.length; i++) {
            sum += (_participants[i].price * (100 - _participants[i].deviation));
        }
        return sum;
    }

    function _sumDeviationOfParticipant() internal view returns (int) {
        int sum = 0;
        for (uint i = 0; i < _participants.length; i++) {
            sum += _participants[i].deviation;
        }
        return sum;
    }

    function _caculatorDeviationOfParticipant() internal {
        int finalPrice = _iProducts.finalPrice;
        for(uint i = 0; i < _participants.length; i++) {
            int deviation = (abs(finalPrice - _participants[i].price) * 100 / finalPrice);
            _participants[i].deviation = deviation;
            address curAccount = _participants[i].account;
            _mpParticipants[curAccount] = _participants[i];

            // tinh do lech tich luy
            MainContract = Main(mainContract);
            MainContract.caculatorAccumulatedDeviation(deviation, curAccount, session);
        }
    }

    function abs(int x) internal pure returns (int) {
        return x >= 0 ? x : -x;
    }

    function getAllParticipantsOfSession() public onlyAdmin view returns (Participant[] memory) {
        return _participants;
    }

    function getParticipantWinner() public onlyAdmin onlyState(State.CLOSE) view returns (Participant memory) {
        Participant memory _winner = _participants[0];
        for(uint i = 0; i < _participants.length; i++) {
            if(i > 0 && _winner.deviation > _participants[i].deviation) 
                _winner = _participants[i];
        }
        return _winner;
    }
}
