// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./TokenPaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockPool is Ownable, TokenPaymentSplitter {
    using SafeERC20 for IERC20;

    constructor(
        address[] memory _payees,
        uint256[] memory _shares,
        address _paymentToken
    ) TokenPaymentSplitter(_payees, _shares, _paymentToken) {}

    function drainTo(address _transferTo, address _token) public onlyOwner {
        require(
            _token != paymentToken,
            "MockPool: Token to drain is PaymentToken"
        );

        uint256 balance = IERC20(_token).balanceOf(address(this));
        require(balance > 0, "MockPool: Token to drain balance is 0");
        IERC20(_token).safeTransfer(_transferTo, balance);
    }
}
