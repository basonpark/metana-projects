/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IGuessTheNewNumber,
  IGuessTheNewNumberInterface,
} from "../../GuessTheNewNumberChallenge.sol/IGuessTheNewNumber";

const _abi = [
  {
    constant: false,
    inputs: [
      {
        name: "n",
        type: "uint8",
      },
    ],
    name: "guess",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
];

export class IGuessTheNewNumber__factory {
  static readonly abi = _abi;
  static createInterface(): IGuessTheNewNumberInterface {
    return new utils.Interface(_abi) as IGuessTheNewNumberInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IGuessTheNewNumber {
    return new Contract(address, _abi, signerOrProvider) as IGuessTheNewNumber;
  }
}
