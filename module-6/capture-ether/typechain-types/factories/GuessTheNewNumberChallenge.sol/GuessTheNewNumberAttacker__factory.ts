/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  GuessTheNewNumberAttacker,
  GuessTheNewNumberAttackerInterface,
} from "../../GuessTheNewNumberChallenge.sol/GuessTheNewNumberAttacker";

const _abi = [
  {
    constant: false,
    inputs: [
      {
        name: "challengeAddress",
        type: "address",
      },
    ],
    name: "attack",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
];

const _bytecode =
  "0x6060604052341561000f57600080fd5b6101768061001e6000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063d018db3e14610043575b005b61006f600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610071565b005b6000670de0b6b3a76400003414151561008957600080fd5b6001430340426040518083600019166000191681526020018281526020019250505060405180910390206001900490508173ffffffffffffffffffffffffffffffffffffffff16634ba4c16b670de0b6b3a7640000836040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808260ff1660ff1681526020019150506000604051808303818588803b151561013557600080fd5b5af1151561014257600080fd5b5050505050505600a165627a7a7230582070aa5024940d10ff274d5741b37174c5a44db317de427eb5e6ad0a38ab0553b40029";

type GuessTheNewNumberAttackerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GuessTheNewNumberAttackerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GuessTheNewNumberAttacker__factory extends ContractFactory {
  constructor(...args: GuessTheNewNumberAttackerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<GuessTheNewNumberAttacker> {
    return super.deploy(overrides || {}) as Promise<GuessTheNewNumberAttacker>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): GuessTheNewNumberAttacker {
    return super.attach(address) as GuessTheNewNumberAttacker;
  }
  override connect(signer: Signer): GuessTheNewNumberAttacker__factory {
    return super.connect(signer) as GuessTheNewNumberAttacker__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GuessTheNewNumberAttackerInterface {
    return new utils.Interface(_abi) as GuessTheNewNumberAttackerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GuessTheNewNumberAttacker {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as GuessTheNewNumberAttacker;
  }
}
