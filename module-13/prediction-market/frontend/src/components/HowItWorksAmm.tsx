"use client";
// frontend/src/components/HowItWorksAmm.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Code,
  Sigma,
  Divide,
  Minus,
  Plus,
  Percent,
  Equal,
  Wallet,
} from "lucide-react"; // More icons

// Simple Code Block component typed for TypeScript
interface CodeBlockProps {
  children: React.ReactNode;
}
const CodeBlock: React.FC<CodeBlockProps> = ({ children }) => (
  <pre className="mt-2 mb-4 rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto">
    <code>{children}</code>
  </pre>
);

export const HowItWorksAmm: React.FC = () => {
  return (
    <Card className="w-full my-8 bg-card/80 backdrop-blur-sm border border-border/20 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl font-bold flex items-center justify-center">
          <Sigma className="w-7 h-7 mr-3 text-primary" /> The Magic Inside: Our
          AMM
        </CardTitle>
        <CardDescription className="text-lg">
          Let's dive into how you can trade instantly without waiting for a
          match!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-muted-foreground text-base md:text-lg leading-relaxed">
          Ever wonder how prediction markets let you buy or sell YES/NO shares
          anytime? Unlike traditional order books that need a buyer for every
          seller, we use an **Automated Market Maker (AMM)**. Think of it as a
          friendly robot trader, always ready to take the other side of your
          trade, using math to set the price based on supply and demand. We
          specifically use a popular model called the **Constant Product Market
          Maker (CPMM)**. Ready for a peek under the hood?
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* --- Core Concept --- */}
          <AccordionItem
            value="item-1"
            className="border border-border/20 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/50">
              The Heart of the AMM: Virtual Reserves
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 text-base text-muted-foreground leading-relaxed">
              Okay, picture this: inside each market contract, the AMM keeps
              track of two virtual piles of shares:
              <ul className="list-disc list-inside my-4 space-y-2 pl-4">
                <li>
                  <strong className="text-foreground">
                    `ammYesShares` (or {`\(R_{Yes}\)`}):
                  </strong>{" "}
                  The AMM's virtual reserve of YES shares.
                </li>
                <li>
                  <strong className="text-foreground">
                    `ammNoShares` (or {`\(R_{No}\)`}):
                  </strong>{" "}
                  The AMM's virtual reserve of NO shares.
                </li>
              </ul>
              These aren't *your* shares, but rather the AMM's internal
              accounting figures used for pricing. The magic rule is the
              **Constant Product** formula:
              <Alert
                variant="default"
                className="my-4 bg-background/70 border-primary/20 shadow-sm"
              >
                <Sigma className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold">
                  The Golden Rule
                </AlertTitle>
                <AlertDescription>
                  <p className="text-center text-lg font-mono my-2">
                    {`\[ R_{Yes} \times R_{No} = k \]`}
                  </p>
                  Where {`\(k\)`} is the "constant product". The AMM tries to
                  keep this product {`\(k\)`} the same (or roughly the same,
                  considering fees) before and after each trade. This simple
                  rule is what makes the prices move!
                </AlertDescription>
              </Alert>
              When the market starts, we usually initialize {`\(R_{Yes}\)`} and{" "}
              {`\(R_{No}\)`} to the same value (like 1 ether each, using 18
              decimals), implying a 50/50 starting price.
            </AccordionContent>
          </AccordionItem>

          {/* --- Price Determination --- */}
          <AccordionItem
            value="item-2"
            className="border border-border/20 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/50">
              What's the Price? It's All Relative!
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 text-base text-muted-foreground leading-relaxed">
              The price of a share isn't fixed; it directly reflects the
              *implied probability* of that outcome based on the current state
              of the AMM's reserves. More demand for YES shares pushes its price
              up, while more demand for NO pushes the YES price down.
              <br />
              <br />
              Here's how the instantaneous (marginal) price is calculated:
              <Alert
                variant="default"
                className="my-4 bg-background/70 border-primary/20 shadow-sm"
              >
                <Divide className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold">
                  Calculating Implied Probability (Price)
                </AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                    <div className="text-center font-mono text-base">
                      <p className="mb-1 font-medium">Price (YES) =</p>
                      {`\[ \frac{R_{No}}{R_{Yes} + R_{No}} \]`}
                    </div>
                    <div className="text-center font-mono text-base">
                      <p className="mb-1 font-medium">Price (NO) =</p>
                      {`\[ \frac{R_{Yes}}{R_{Yes} + R_{No}} \]`}
                    </div>
                  </div>
                  <p className="mt-3">
                    Think about it: if {`\(R_{No}\)`} (the reserve of NO shares)
                    is high relative to {`\(R_{Yes}\)`}, it means people have
                    been buying YES shares (decreasing {`\(R_{Yes}\)`} and
                    increasing {`\(R_{No}\)`}). This makes the Price(YES)
                    higher, as expected!
                  </p>
                  <p className="mt-2 text-sm">
                    *(In the contract, we multiply by {`\(10^{18}\)`} for
                    fixed-point math, so prices range from 0 to {`\(10^{18}\)`}
                    .)*
                  </p>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          {/* --- Buying Shares --- */}
          <AccordionItem
            value="item-3"
            className="border border-border/20 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/50">
              Buying Shares: Swapping Collateral for Belief
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 text-base text-muted-foreground leading-relaxed">
              So, you want to buy some shares? You send collateral (like ETH) to
              the `buyShares` function. Here's the simplified flow:
              <ol className="list-decimal list-inside my-4 space-y-3 pl-4">
                <li>
                  <strong className="text-foreground">
                    Fee Time <Percent className="inline h-4 w-4" />:
                  </strong>{" "}
                  First, a small platform fee and the market creator's fee are
                  calculated based on the collateral you sent (
                  {`\(Collateral_{In}\)`}).
                  <CodeBlock>{`PlatformFee = CollateralIn * platformFeeBps / 10000
CreatorFee = CollateralIn * creatorFeeBps / 10000
NetCollateral = CollateralIn - PlatformFee - CreatorFee`}</CodeBlock>
                </li>
                <li>
                  <strong className="text-foreground">
                    AMM Magic <Sigma className="inline h-4 w-4" />:
                  </strong>{" "}
                  The contract calculates how many shares ({`\(Shares_{Out}\)`})
                  you get for your {`\(NetCollateral\)`}. It uses the constant
                  product rule to figure this out. The calculation ensures that
                  after you get your shares and the AMM gets your collateral
                  (conceptually added to the *opposite* reserve value), the
                  product {`\(R_{Yes} \times R_{No}\)`} remains constant.
                  <Alert
                    variant="default"
                    className="my-3 bg-background/70 border-primary/20 shadow-sm"
                  >
                    <AlertTitle className="font-semibold flex items-center">
                      <Divide className="h-4 w-4 mr-2" /> Shares Received
                      Formula
                    </AlertTitle>
                    <AlertDescription>
                      <p>If buying YES shares ({`\(Shares_{Yes, Out}\)`}):</p>
                      {`\[ Shares_{Yes, Out} = \frac{R_{Yes} \times NetCollateral}{R_{No} + NetCollateral} \]`}
                      <p className="mt-2">
                        If buying NO shares ({`\(Shares_{No, Out}\)`}):
                      </p>
                      {`\[ Shares_{No, Out} = \frac{R_{No} \times NetCollateral}{R_{Yes} + NetCollateral} \]`}
                      <p className="text-sm mt-2">
                        *(This formula maintains the constant product after
                        adjusting reserves)*
                      </p>
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm italic">
                    Note: The more you buy relative to the pool size, the less
                    favorable the rate becomes (this is called slippage!).
                  </p>
                </li>
                <li>
                  <strong className="text-foreground">
                    State Update <Equal className="inline h-4 w-4" />:
                  </strong>{" "}
                  The AMM's reserves ({`\(R_{Yes}\)`}, {`\(R_{No}\)`}) are
                  updated, your {`\(NetCollateral\)`} is added to the market's
                  actual `collateralPool`, the fees are sent off, and your shiny
                  new shares appear in your balance (`outcomeShares`)!
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* --- Selling Shares --- */}
          <AccordionItem
            value="item-4"
            className="border border-border/20 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/50">
              Selling Shares: Cashing Out Your Position
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 text-base text-muted-foreground leading-relaxed">
              Changed your mind or want to lock in profits/cut losses before the
              market ends? You can sell your shares back to the AMM using the
              `sellShares` function. It's like buying, but in reverse:
              <ol className="list-decimal list-inside my-4 space-y-3 pl-4">
                <li>
                  <strong className="text-foreground">
                    AMM Calculation <Sigma className="inline h-4 w-4" />:
                  </strong>{" "}
                  You specify how many shares you want to sell (
                  {`\(Shares_{In}\)`}). The AMM calculates how much collateral (
                  {`\(Collateral_{Gross, Out}\)`}) you should get back, again
                  using the constant product rule.
                  <Alert
                    variant="default"
                    className="my-3 bg-background/70 border-primary/20 shadow-sm"
                  >
                    <AlertTitle className="font-semibold flex items-center">
                      <Divide className="h-4 w-4 mr-2" /> Collateral Received
                      Formula (Gross)
                    </AlertTitle>
                    <AlertDescription>
                      <p>If selling YES shares ({`\(Shares_{Yes, In}\)`}):</p>
                      {`\[ Collateral_{Gross, Out} = \frac{R_{No} \times Shares_{Yes, In}}{R_{Yes} + Shares_{Yes, In}} \]`}
                      <p className="mt-2">
                        If selling NO shares ({`\(Shares_{No, In}\)`}):
                      </p>
                      {`\[ Collateral_{Gross, Out} = \frac{R_{Yes} \times Shares_{No, In}}{R_{No} + Shares_{No, In}} \]`}
                    </AlertDescription>
                  </Alert>
                </li>
                <li>
                  <strong className="text-foreground">
                    Fee Time Again <Percent className="inline h-4 w-4" />:
                  </strong>{" "}
                  The platform and creator fees are calculated based on the{" "}
                  {`\(Collateral_{Gross, Out}\)`} *before* it's sent to you.
                  <CodeBlock>{`PlatformFee = CollateralGrossOut * platformFeeBps / 10000
CreatorFee = CollateralGrossOut * creatorFeeBps / 10000
NetCollateralOut = CollateralGrossOut - PlatformFee - CreatorFee`}</CodeBlock>
                </li>
                <li>
                  <strong className="text-foreground">
                    State Update & Payout <Wallet className="inline h-4 w-4" />:
                  </strong>{" "}
                  The AMM's reserves are updated (it gains back the shares you
                  sold and loses the collateral value), your shares are burned,
                  the fees are sent off, the `collateralPool` decreases, and the{" "}
                  {`\(NetCollateralOut\)`} is transferred to your wallet!
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* --- Settlement --- */}
          <AccordionItem
            value="item-5"
            className="border border-border/20 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/50">
              The Grand Finale: Settlement & Redemption
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 text-base text-muted-foreground leading-relaxed">
              When the market's time is up and the real-world outcome is
              determined (usually via a trusted Oracle like Chainlink), the
              market settles.
              <br />
              <br />
              Let's say the outcome is **YES**:
              <ul className="list-disc list-inside my-4 space-y-2 pl-4">
                <li>
                  <strong className="text-foreground">YES Shares:</strong>{" "}
                  Become winners! Each YES share you hold can now be redeemed
                  for exactly 1 unit of the collateral (e.g., 1 wei of ETH per 1
                  wei of share).
                </li>
                <li>
                  <strong className="text-foreground">NO Shares:</strong>{" "}
                  Unfortunately become worthless.
                </li>
              </ul>
              If the outcome was **NO**, the reverse happens.
              <br />
              <br />
              You use the `redeemWinnings` function. It checks your balance of
              the *winning* shares, burns them, and sends you the corresponding
              amount of collateral straight from the `collateralPool`.
            </AccordionContent>
          </AccordionItem>

          {/* --- Fees --- */}
          <AccordionItem
            value="item-6"
            className="border border-border/20 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:bg-muted/50">
              A Quick Word on Fees
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 text-base text-muted-foreground leading-relaxed">
              Fees keep the lights on and reward market creators!
              <ul className="list-disc list-inside my-4 space-y-2 pl-4">
                <li>
                  <strong className="text-foreground">Platform Fee:</strong> A
                  small cut (e.g., 0.5% - 1%) set by us, taken on each trade
                  (buy & sell). Helps maintain the platform.
                </li>
                <li>
                  <strong className="text-foreground">Creator Fee:</strong> An
                  additional small cut set by the person who created the
                  specific market (max 1%). Rewards them for finding interesting
                  questions.
                </li>
              </ul>
              These are automatically handled during the `buyShares` and
              `sellShares` transactions, so you don't need to worry about
              calculating them separately. They come out of the collateral
              involved in the trade.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
