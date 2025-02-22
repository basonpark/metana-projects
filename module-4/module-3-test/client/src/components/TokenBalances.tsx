"use client";
import React from "react";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Props = {};

const TokenBalances = (props: Props) => {
  const balances = useTokenBalances();

  return (
    <Card className="w-[350px] shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 gap-x-8">
          {balances.map((balance, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-2 p-2 rounded-lg bg-secondary"
            >
              <span className="font-medium">Token {index}</span>
              <span className="font-bold">{balance.toString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center gap-2 p-2 rounded-lg bg-secondary filter brightness-90">
            <span className="font-medium">Total</span>
            <span className="font-bold">
              {balances.reduce((acc, balance) => acc + balance, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalances;
