// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error TxNotExists(uint txIndex);
error TxAlreadyApproved(uint txIndex);
error TxAlreadySent(uint txIndex);

contract MultiSigWallet {
    event Deposit(
        address indexed sender, uint amount, uint balance
    );
    event CreateWithdrawTx(
        address indexed owner,
        uint indexed transactionIndex,
        address indexed to,
        uint amount
    );
    event ApprovedWithdrawTx(
        address indexed owner,
        uint indexed transactionIndex
    );
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public quorumRequired;
    struct WithdrawTx{
        address to;
        uint amount;
        uint approvals;
        bool sent;
    }
    mapping(uint => mapping(address => bool)) public isApproved;
    WithdrawTx[] public transactions;

    constructor(address[] memory _owners, uint _qourum){
        require(_owners.length >=1, "owners required");
        require(_qourum > 0 && _qourum <= _owners.length, "invalid no. of reqd. qourums");
        for (uint i =0; i< _owners.length; i++){
            require(_owners[i] != address(0), "Invalid Owner");
            require(!isOwner[_owners[i]], "Owner not Unique");

            owners.push(_owners[i]);
            isOwner[_owners[i]] = true;
        }  
        quorumRequired = _qourum;
    }
    // TODO: Declare a function modifier called "onlyOwner" that ensures that the function caller is one of the owners of the wallet
    modifier onlyOwner(){
        require(isOwner[msg.sender], "not owner");
        _;
    }
    // TODO: Declare a function modifier called "transactionExists" that ensures that transaction exists in the list of withdraw transactions
    modifier transactionExists(uint _txId){
        if (_txId > transactions.length){
            revert TxNotExists(_txId);
        }
        _;
    }
    // TODO: Declare a function modifier called "transactionNotApproved" that ensures that transaction has not yet been approved
    modifier transactionNotApproved(uint _txId){
        if(isApproved[_txId][msg.sender]){
            revert TxAlreadyApproved(_txId);
        }
        _;
    }
    // TODO: Declare a function modifier called "transactionNotSent" that ensures that transaction has not yet been sent
    modifier transactionNotSent(uint _txId){
        if(transactions[_txId].sent){
            revert TxAlreadySent(_txId);
        }
        _;
    }

    function createWithdrawTx(address _to, uint _amount ) public onlyOwner{
        uint txId = transactions.length;
        transactions.push(
            WithdrawTx({ to: _to, amount: _amount, approvals: 0, sent: false})
        );
        emit CreateWithdrawTx(msg.sender, txId, _to, _amount);
    }
    
    function approveWithdrawTx(uint _txId) public payable onlyOwner transactionExists(_txId) transactionNotApproved(_txId) transactionNotSent(_txId){
        WithdrawTx storage withdrawTx = transactions[_txId];
        withdrawTx.approvals += 1;
        isApproved[_txId][msg.sender] = true;

        if (withdrawTx.approvals >= quorumRequired){
            withdrawTx.sent = true;
            (bool success, ) = withdrawTx.to.call{value: withdrawTx.amount}("");
            require(success, "Tx failed");
            emit ApprovedWithdrawTx(msg.sender, _txId);
        }
    }

    function deposit() payable public {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    receive() external payable{
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function getOwners() external view returns(address[] memory){
        return owners;
    }

    function getWithdrawTxCount() public view returns(uint){
        return transactions.length;
    }

    function getWithdrawTxes() public view returns(WithdrawTx[] memory){
        return transactions;
    }

    function getWithdrawTx(uint _txId) public view returns(WithdrawTx memory){
        return transactions[_txId];
    }

    // TODO: Create a function called "balanceOf" that gets the current amount of ETH in the multisig wallet
    function balanceOf() public view returns(uint){
        return address(this).balance;
    }

}
