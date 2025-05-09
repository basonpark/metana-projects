/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface PublicKeyChallengeInterface extends utils.Interface {
  functions: {
    "isComplete()": FunctionFragment;
    "authenticate(bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "isComplete" | "authenticate"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "isComplete",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "authenticate",
    values: [PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(functionFragment: "isComplete", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "authenticate",
    data: BytesLike
  ): Result;

  events: {};
}

export interface PublicKeyChallenge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PublicKeyChallengeInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    isComplete(overrides?: CallOverrides): Promise<[boolean]>;

    authenticate(
      publicKey: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  isComplete(overrides?: CallOverrides): Promise<boolean>;

  authenticate(
    publicKey: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    isComplete(overrides?: CallOverrides): Promise<boolean>;

    authenticate(
      publicKey: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    isComplete(overrides?: CallOverrides): Promise<BigNumber>;

    authenticate(
      publicKey: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    isComplete(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    authenticate(
      publicKey: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
