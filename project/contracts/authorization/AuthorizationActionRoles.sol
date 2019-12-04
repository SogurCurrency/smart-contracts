pragma solidity 0.4.25;

/**
 * @title Authorization Action Roles.
 */
library AuthorizationActionRoles {
    string public constant VERSION = "1.0.0";

    enum Flag {
        BuySga         ,
        SellSga        ,
        SellSgn        ,
        ReceiveSga     ,
        ReceiveSgn     ,
        TransferSga    ,
        TransferSgn    ,
        TransferFromSga,
        TransferFromSgn
    }

    function isAuthorizedToBuySga         (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.BuySga         );}
    function isAuthorizedToSellSga        (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.SellSga        );}
    function isAuthorizedToSellSgn        (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.SellSgn        );}
    function isAuthorizedToReceiveSga     (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.ReceiveSga     );}
    function isAuthorizedToReceiveSgn     (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.ReceiveSgn     );}
    function isAuthorizedToTransferSga    (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.TransferSga    );}
    function isAuthorizedToTransferSgn    (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.TransferSgn    );}
    function isAuthorizedToTransferFromSga(uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.TransferFromSga);}
    function isAuthorizedToTransferFromSgn(uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.TransferFromSgn);}
    function isAuthorized(uint256 _flags, Flag _flag) private pure returns (bool) {return ((_flags >> uint256(_flag)) & 1) == 1;}
}
