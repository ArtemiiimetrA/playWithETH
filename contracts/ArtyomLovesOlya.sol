// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract ArtyomLovesOlya is ERC20, Ownable, Pausable {
    string private constant TOKEN_NAME = "ArtyomLovesOlya";
    string private constant TOKEN_SYMBOL = "ALO";
    uint8 private constant DECIMALS = 18;
    
    uint256 private _maxSupply;
    mapping(address => bool) private _blacklist;
    
    event Blacklisted(address indexed account);
    event RemovedFromBlacklist(address indexed account);
    
    constructor(uint256 initialSupply, uint256 maxSupply_) 
        ERC20(TOKEN_NAME, TOKEN_SYMBOL) 
        Ownable(msg.sender) 
    {
        require(maxSupply_ >= initialSupply, "Max supply must be >= initial supply");
        _maxSupply = maxSupply_;
        _mint(msg.sender, initialSupply);
    }

    // Базовые функции управления токеном
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= _maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    // Функции паузы (для чрезвычайных ситуаций)
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Переопределение transfer и transferFrom для учета паузы и черного списка
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(!_blacklist[msg.sender] && !_blacklist[to], "Address is blacklisted");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(!_blacklist[from] && !_blacklist[to], "Address is blacklisted");
        return super.transferFrom(from, to, amount);
    }

    // Функции черного списка
    function addToBlacklist(address account) public onlyOwner {
        _blacklist[account] = true;
        emit Blacklisted(account);
    }

    function removeFromBlacklist(address account) public onlyOwner {
        _blacklist[account] = false;
        emit RemovedFromBlacklist(account);
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    // Информационные функции
    function getMaxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function getRemainingSupply() public view returns (uint256) {
        if (totalSupply() >= _maxSupply) {
            return 0;
        }
        return _maxSupply - totalSupply();
    }

    function getTokenInfo() public pure returns (string memory name, string memory symbol, uint8 decimals_) {
        return (TOKEN_NAME, TOKEN_SYMBOL, DECIMALS);
    }

    // Batch функции
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) public whenNotPaused returns (bool) {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(transfer(recipients[i], amounts[i]), "Transfer failed");
        }
        return true;
    }

    // Функция для аварийного вывода случайно отправленных токенов
    function rescueERC20(address tokenAddress, uint256 amount) public onlyOwner {
        require(tokenAddress != address(this), "Cannot rescue native token");
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    // Переопределение необходимых функций
    function _update(address from, address to, uint256 amount) internal virtual override whenNotPaused {
        super._update(from, to, amount);
    }
}