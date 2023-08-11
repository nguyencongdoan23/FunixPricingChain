// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Session.sol";

contract Main is IMain {
    // Structure to hold details of Bidder
    struct IParticipant {
        // TODO
        address account;
        string fullname;
        string email;
        int nSessions;
        int deviation;
    }

    address public admin;

    // TODO: Variables
    IParticipant[] internal _iParticipants;
    mapping (address => IParticipant) public _mpParticipants;

    address[] public sessions;
    uint public maxParticipant = 10;

    event RegisterParticipant(string fullname, string email, address account);
    event UpdateParticipant(string fullname, string email, address account, int nSessions, int deviation);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not owner!");
        _;
    }

    modifier onlySession(address session) {
        require(_checkSession(session),  "Not exists session!");
        _;
    }

    function _checkSession(address session) internal view returns (bool) {
        for(uint i = 0; i < sessions.length; i++) {
            if(sessions[i] == session)
                return true;
        }
        return false;
    }

    function getAdmin() public view returns(address) {
        return admin;
    }

    // TODO: Functions
    function register(string memory fullname, string memory email, address account) public {
        require(account != address(0), "Invalid address!");

        if(_mpParticipants[account].account != address(0)) {
            uint index = _getIndexParticipantByAccount(account);
            _iParticipants[index].fullname = fullname;
            _iParticipants[index].email = email;
            _mpParticipants[account] = _iParticipants[index];

            emit UpdateParticipant(fullname, email, account, _iParticipants[index].nSessions, _iParticipants[index].deviation);
            return;
        }
        require(_iParticipants.length < maxParticipant, "Invalid max participant!");
        IParticipant memory iParticipant = IParticipant(account, fullname, email, 0, 0);
        _iParticipants.push(iParticipant);
        _mpParticipants[account] = iParticipant;

        emit RegisterParticipant(fullname, email, account);
    }

    function updateMaxParticipant(uint _max) public onlyAdmin {
        maxParticipant = _max;
    }

    function participants(address addr) public view returns(string memory fullname, string memory email, address account, int nSessions, int deviation) {
        require(addr != address(0), "Invalid address!");
        return (
            _mpParticipants[addr].fullname,
            _mpParticipants[addr].email,
            _mpParticipants[addr].account,
            _mpParticipants[addr].nSessions,
            _mpParticipants[addr].deviation
        );
    }

    function getAllParticipants() public view onlyAdmin returns (IParticipant[] memory) {
        return _iParticipants;
    }

    function getDeviationOfParticipant(address account, address session) public view onlySession(session) returns (int) {
        return _mpParticipants[account].deviation;
    }

    function updateParticipantByIndex(uint index, string memory fullname, string memory email, address accountOld, address accountNew
    , int nSessions, int deviation) public onlyAdmin {
        if(accountNew != accountOld) {
            if(_checkAddressHasExists(accountNew) == false) 
                _iParticipants[index].account = accountNew;
            else
                revert("Account has been used!");
        }
        _iParticipants[index].fullname = fullname;
        _iParticipants[index].email = email;
        _iParticipants[index].nSessions = nSessions;
        _iParticipants[index].deviation = deviation;
        _mpParticipants[_iParticipants[index].account] = _iParticipants[index];

        emit UpdateParticipant(fullname, email, accountNew, nSessions, deviation);
    }

    function _checkAddressHasExists(address addr) internal view returns (bool) {
        if(_mpParticipants[addr].account == address(0))
            return false;
        return true;
    }

    function _getIndexParticipantByAccount(address account) internal view returns (uint) {
        for(uint i = 0; i < _iParticipants.length; i++) {
            if(_iParticipants[i].account == account)
                return i;
        }
        revert("Not found participant by account!");
    }

    function nParticipants() public onlyAdmin view returns (uint) {
        return _iParticipants.length;
    }

    function addSession(address session) external override {
        sessions.push(session);
    }

    function getNumberSession() public view returns (uint) {
        return sessions.length;
    }

    function updateNumberOfPricingSessionByAccount(address account, address session) public onlySession(session) {
        uint index = _getIndexParticipantByAccount(account);
        _iParticipants[index].nSessions += 1;
        _mpParticipants[account] = _iParticipants[index];
    }

    function caculatorAccumulatedDeviation(int newDeviation, address account, address session) public onlySession(session) {
        uint index = _getIndexParticipantByAccount(account);
        int currentDeviation = _iParticipants[index].deviation;
        int nParticipant = _iParticipants[index].nSessions;
        int deviation = ((currentDeviation * nParticipant + newDeviation) / (nParticipant + 1));
        
        _iParticipants[index].deviation = deviation;
        _mpParticipants[account] = _iParticipants[index];
    }

    function checkAccountHasExists(address account, address session) public view onlySession(session) returns (bool) {
        require(_iParticipants.length > 0, "No Participant!");
        for(uint i = 0; i < _iParticipants.length; i++) {
            if(_iParticipants[i].account == account)
                return true;
        }
        return false;
    }
}
