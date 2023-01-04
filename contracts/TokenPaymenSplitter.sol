// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract TokenPaymentSplitter {
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);

    using SafeERC20 for IERC20;

    address internal paymentToken; // Token that we'll use for payments
    uint256 internal _totalShares; // Provides the addition of shares for all payess
    uint256 internal _totalTokenReleased; // Total amount of payment token that has been paid out to all payees
    address[] internal _payees; // Provides an array of all current payees addresses

    mapping(address => uint256) internal _shares; // is a mapping of a payee’s address to the number of shares assigned to them.
    mapping(address => uint256) internal _tokenReleased; // is a mapping of a payee’s address to the amount of payment token that has been paid out to them.

    constructor(
        address[] memory payees, // an array of the payees that we want to initialize with the contract deployment
        uint256[] memory shares_, // an array of the shares per payee
        address _paymentToken // the address for the ERC20 token that will be used for payments.
    ) {
        require(
            payees.length == shares_.length,
            "TokenPaymentSplitter: payees and shares length mismatch"
        );
        require(payees.length > 0, "TokenPaymentSplitter: no payees");

        for (uint256 i = 0; i < payees.length; i++) {
            _addPayee(payees[i], shares_[i]);
        } // assigns each payee and their shares to the variables we created above.
    }

    // Call & get the contract variables
    function totalShares() public view returns (uint256) {
        return _totalShares;
    }

    function shares(address account) public view returns (uint256) {
        return _shares[account];
    }

    function payee(uint256 index) public view returns (address) {
        return _payees[index];
    }

    function _addPayee(address account, uint256 shares_) internal {
        require(
            account != address(0),
            "TokenPaymentSplitter: account is the zero address"
        );
        require(shares_ > 0, "TokenPaymentSplitter: shares are 0");
        require(
            _shares[account] == 0,
            "TokenPaymentSplitter: account already has shares"
        );

        _payees.push(account);
        _shares[account] = shares_;

        emit PayeeAdded(account, shares_);
    }

    function release(address account) public virtual {
        require(
            _shares[account] > 0,
            "TokenPaymentSplitter: account has no shares"
        );

        uint256 tokenTotalReceived = IERC20(paymentToken).balanceOf(
            address(this)
        ) + _totalTokenReleased;

        uint256 payment = (tokenTotalReceived * _shares[account]) /
            _totalShares -
            _tokenReleased[account];

        require(
            payment != 0,
            "TokenPaymentSplitter: account is not due payment"
        );
        _tokenReleased[account] = _tokenReleased[account] + payment;
        _totalTokenReleased = _totalTokenReleased + payment;
        IERC20(paymentToken).safeTransfer(account, payment);

        emit PaymentReleased(account, payment);
    }
}
