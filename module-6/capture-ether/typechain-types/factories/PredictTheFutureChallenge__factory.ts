/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  PredictTheFutureChallenge,
  PredictTheFutureChallengeInterface,
} from "../PredictTheFutureChallenge";

const _abi = [
  {
    constant: false,
    inputs: [],
    name: "settle",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "n",
        type: "uint8",
      },
    ],
    name: "lockInGuess",
    outputs: [],
    payable: true,
    stateMutability: "payable",
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
  {
    inputs: [],
    payable: true,
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "guesser",
        type: "address",
      },
      {
        indexed: false,
        name: "guess",
        type: "uint8",
      },
      {
        indexed: false,
        name: "settlementBlockNumber",
        type: "uint256",
      },
    ],
    name: "LockInGuess",
    type: "event",
  },
];

const _bytecode =
  "0x6060604052670de0b6b3a76400003414151561001a57600080fd5b6103cb806100296000396000f300606060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806311da60b41461005c5780632c0e005414610071578063b2fa1c9e1461008c575b600080fd5b341561006757600080fd5b61006f6100b9565b005b61008a600480803560ff1690602001909190505061020f565b005b341561009757600080fd5b61009f61037e565b604051808215151515815260200191505060405180910390f35b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561011657600080fd5b6001544311151561012657600080fd5b600a6001430340426040518083600019166000191681526020018281526020019250505060405180910390206001900460ff1681151561016257fe5b06905060008060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508060ff16600060149054906101000a900460ff1660ff16141561020c573373ffffffffffffffffffffffffffffffffffffffff166108fc671bc16d674ec800009081150290604051600060405180830381858888f19350505050151561020b57600080fd5b5b50565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614151561025557600080fd5b670de0b6b3a76400003414151561026b57600080fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600060146101000a81548160ff021916908360ff160217905550600143016001819055507fad13722a55012621b84d25b02b8e904b14df5c5f2783005b9888d4fd8e06857e6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600060149054906101000a900460ff16600154604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018360ff1660ff168152602001828152602001935050505060405180910390a150565b6000803073ffffffffffffffffffffffffffffffffffffffff1631149050905600a165627a7a723058200ede804cbed324b581422644a2e46e5ace2a4324ca799c93cd03be7da32ba3470029";

type PredictTheFutureChallengeConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PredictTheFutureChallengeConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PredictTheFutureChallenge__factory extends ContractFactory {
  constructor(...args: PredictTheFutureChallengeConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<PredictTheFutureChallenge> {
    return super.deploy(overrides || {}) as Promise<PredictTheFutureChallenge>;
  }
  override getDeployTransaction(
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PredictTheFutureChallenge {
    return super.attach(address) as PredictTheFutureChallenge;
  }
  override connect(signer: Signer): PredictTheFutureChallenge__factory {
    return super.connect(signer) as PredictTheFutureChallenge__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PredictTheFutureChallengeInterface {
    return new utils.Interface(_abi) as PredictTheFutureChallengeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PredictTheFutureChallenge {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as PredictTheFutureChallenge;
  }
}
