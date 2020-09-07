pragma solidity 0.4.25;

/**
 * @title Authorization Action Roles.
 */
library AuthorizationActionRoles {
    string public constant VERSION = "1.1.0";

    enum Flag {
        BuySgr         ,
        SellSgr        ,
        SellSgn        ,
        ReceiveSgn     ,
        TransferSgn    ,
        TransferFromSgn
    }

    function isAuthorizedToBuySgr         (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.BuySgr         );}
    function isAuthorizedToSellSgr        (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.SellSgr        );}
    function isAuthorizedToSellSgn        (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.SellSgn        );}
    function isAuthorizedToReceiveSgn     (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.ReceiveSgn     );}
    function isAuthorizedToTransferSgn    (uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.TransferSgn    );}
    function isAuthorizedToTransferFromSgn(uint256 _flags) internal pure returns (bool) {return isAuthorized(_flags, Flag.TransferFromSgn);}
    function isAuthorized(uint256 _flags, Flag _flag) private pure returns (bool) {return ((_flags >> uint256(_flag)) & 1) == 1;}
}
