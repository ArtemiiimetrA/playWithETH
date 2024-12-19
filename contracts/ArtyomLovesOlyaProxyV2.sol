// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ArtyomLovesOlyaProxy.sol";

contract ArtyomLovesOlyaProxyV2 is ArtyomLovesOlya {
    // Добавляем новую функциональность
    function version() public pure returns (string memory) {
        return "v2.0.0";
    }
    
    // Можно добавить новые функции или изменить существующие
} 