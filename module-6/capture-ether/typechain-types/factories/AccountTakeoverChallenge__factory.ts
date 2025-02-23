/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  AccountTakeoverChallenge,
  AccountTakeoverChallengeInterface,
} from "../AccountTakeoverChallenge";

const _abi = [
  {
    constant: false,
    inputs: [],
    name: "authenticate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isComplete",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6060604052736b477781b0e68031109f21887e6b5afeaaeb002b6000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550341561006357600080fd5b61014a806100726000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063380c7a6714610051578063b2fa1c9e14610066575b600080fd5b341561005c57600080fd5b610064610093565b005b341561007157600080fd5b61007961010b565b604051808215151515815260200191505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156100ee57600080fd5b6001600060146101000a81548160ff021916908315150217905550565b600060149054906101000a900460ff16815600a165627a7a72305820c7b6d522433e5a06254dab0cef0ef429edbdc0ae7136939347bd857300b641d20029";

type AccountTakeoverChallengeConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AccountTakeoverChallengeConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AccountTakeoverChallenge__factory extends ContractFactory {
  constructor(...args: AccountTakeoverChallengeConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<AccountTakeoverChallenge> {
    return super.deploy(overrides || {}) as Promise<AccountTakeoverChallenge>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): AccountTakeoverChallenge {
    return super.attach(address) as AccountTakeoverChallenge;
  }
  override connect(signer: Signer): AccountTakeoverChallenge__factory {
    return super.connect(signer) as AccountTakeoverChallenge__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AccountTakeoverChallengeInterface {
    return new utils.Interface(_abi) as AccountTakeoverChallengeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AccountTakeoverChallenge {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AccountTakeoverChallenge;
  }
}
