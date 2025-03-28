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

export interface RetirementFundChallengeInterface extends utils.Interface {
  functions: {
    "collectPenalty()": FunctionFragment;
    "withdraw()": FunctionFragment;
    "isComplete()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "collectPenalty" | "withdraw" | "isComplete"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "collectPenalty",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "withdraw", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isComplete",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "collectPenalty",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isComplete", data: BytesLike): Result;

  events: {};
}

export interface RetirementFundChallenge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RetirementFundChallengeInterface;

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
    collectPenalty(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isComplete(overrides?: CallOverrides): Promise<[boolean]>;
  };

  collectPenalty(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isComplete(overrides?: CallOverrides): Promise<boolean>;

  callStatic: {
    collectPenalty(overrides?: CallOverrides): Promise<void>;

    withdraw(overrides?: CallOverrides): Promise<void>;

    isComplete(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    collectPenalty(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdraw(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isComplete(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    collectPenalty(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isComplete(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
