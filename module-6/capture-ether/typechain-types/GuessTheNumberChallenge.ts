/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
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

export interface GuessTheNumberChallengeInterface extends utils.Interface {
  functions: {
    "guess(uint8)": FunctionFragment;
    "isComplete()": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "guess" | "isComplete"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "guess",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "isComplete",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "guess", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isComplete", data: BytesLike): Result;

  events: {};
}

export interface GuessTheNumberChallenge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: GuessTheNumberChallengeInterface;

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
    guess(
      n: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isComplete(overrides?: CallOverrides): Promise<[boolean]>;
  };

  guess(
    n: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isComplete(overrides?: CallOverrides): Promise<boolean>;

  callStatic: {
    guess(
      n: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    isComplete(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    guess(
      n: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isComplete(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    guess(
      n: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isComplete(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
