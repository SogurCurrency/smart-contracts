pragma solidity 0.4.25;

import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * @title Adminable.
 */
contract Adminable is Claimable {
    address[] public adminArray;

    struct AdminInfo {
        bool valid;
        uint256 index;
    }

    mapping(address => AdminInfo) public adminTable;

    event AdminAccepted(address indexed _admin);
    event AdminRejected(address indexed _admin);

    /**
     * @dev Reverts if called by any account other than one of the administrators.
     */
    modifier onlyAdmin() {
        require(adminTable[msg.sender].valid, "caller is illegal");
        _;
    }

    /**
     * @dev Accept a new administrator.
     * @param _admin The administrator's address.
     */
    function accept(address _admin) external onlyOwner {
        require(_admin != address(0), "administrator is illegal");
        AdminInfo storage adminInfo = adminTable[_admin];
        require(!adminInfo.valid, "administrator is already accepted");
        adminInfo.valid = true;
        adminInfo.index = adminArray.length;
        adminArray.push(_admin);
        emit AdminAccepted(_admin);
    }

    /**
     * @dev Reject an existing administrator.
     * @param _admin The administrator's address.
     */
    function reject(address _admin) external onlyOwner {
        AdminInfo storage adminInfo = adminTable[_admin];
        require(adminArray.length > adminInfo.index, "administrator is already rejected");
        require(_admin == adminArray[adminInfo.index], "administrator is already rejected");
        // at this point we know that adminArray.length > adminInfo.index >= 0
        address lastAdmin = adminArray[adminArray.length - 1]; // will never underflow
        adminTable[lastAdmin].index = adminInfo.index;
        adminArray[adminInfo.index] = lastAdmin;
        adminArray.length -= 1; // will never underflow
        delete adminTable[_admin];
        emit AdminRejected(_admin);
    }

    /**
     * @dev Get an array of all the administrators.
     * @return An array of all the administrators.
     */
    function getAdminArray() external view returns (address[] memory) {
        return adminArray;
    }

    /**
     * @dev Get the total number of administrators.
     * @return The total number of administrators.
     */
    function getAdminCount() external view returns (uint256) {
        return adminArray.length;
    }
}
