// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract VerifySignature {
  function getMessageHash(string memory _message) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(_message));
  }

  function getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
  }

  function verify(address _signer, string memory _message, bytes memory signature) public pure returns (bool) {
    bytes32 messageHash = getMessageHash(_message);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
    return recoverSigner(ethSignedMessageHash, signature) == _signer;
  }

  function getSlice(uint256 begin, uint256 end, string memory text) internal pure returns (string memory) {
    bytes memory a = new bytes(end-begin+1);
    for(uint i=0;i<=end-begin;i++){
        a[i] = bytes(text)[i+begin-1];
    }
    return string(a);    
  }

  // given command string, parse into parameters to call
  /*
  function operationParser(string memory _message, string memory _sig) public returns (bool) {
    Step 1. Check whether message string is in the correct format
    Step 2. Check for correct signature recover(_message, _sig) == msg.sender
    Step 3. Parse message into parameters
    Step 4. Select the correct external contract and functino to call on behalf of the user
  }
  */

  /*
  function executeOperationExample(int param1, address param2, int param3) internal returns (bool) {
    // call function in other contract
  }
  */

  function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

    return ecrecover(_ethSignedMessageHash, v, r, s);
  }

  function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
    require(sig.length == 65, "invalid signature length");

    assembly {
      /*
      First 32 bytes stores the length of the signature
      add(sig, 32) = pointer of sig + 32
      effectively, skips first 32 bytes of signature
      mload(p) loads next 32 bytes starting at the memory address p into memory
      */

      // first 32 bytes, after the length prefix
      r := mload(add(sig, 32))
      // second 32 bytes
      s := mload(add(sig, 64))
      // final byte (first byte of the next 32 bytes)
      v := byte(0, mload(add(sig, 96)))
    }
    // implicitly return (r, s, v)
  }
}