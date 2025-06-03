"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface AuditFirm {
  name: string;
  logo: string;
  description: string;
  specialties: string[];
  website: string;
}

export function AuditFirmsSection() {
  const auditFirms: AuditFirm[] = [
    {
      name: "OpenZeppelin",
      logo: "/openzeppelin.png",
      description:
        "Industry-leading security firm specializing in smart contract audits and security research.",
      specialties: ["DeFi", "NFTs", "ERC Standards", "Governance"],
      website: "https://openzeppelin.com",
    },
    {
      name: "Trail of Bits",
      logo: "/trail-of-bits.png",
      description:
        "Elite security research and consulting firm with expertise in blockchain security.",
      specialties: [
        "Zero-Knowledge",
        "Layer 2",
        "Custom VMs",
        "Formal Verification",
      ],
      website: "https://trailofbits.com",
    },
    {
      name: "CertiK",
      logo: "/certik.png",
      description:
        "Blockchain security firm using formal verification technology to secure smart contracts.",
      specialties: ["DeFi", "Exchanges", "Cross-chain", "GameFi"],
      website: "https://certik.com",
    },
    {
      name: "ChainSecurity",
      logo: "/chainsecurity.png",
      description:
        "Academic spin-off providing formal verification and security audits for blockchain projects.",
      specialties: [
        "Formal Verification",
        "DeFi",
        "Consensus Protocols",
        "MEV Protection",
      ],
      website: "https://chainsecurity.com",
    },
    {
      name: "Consensys Diligence",
      logo: "/consensys-diligence.png",
      description:
        "Security services from the Ethereum ecosystem leader, focusing on smart contract audits.",
      specialties: ["Ethereum", "DeFi", "DAOs", "Layer 2 Solutions"],
      website: "https://consensys.net/diligence",
    },
    {
      name: "Quantstamp",
      logo: "/quantstamp.png",
      description:
        "Blockchain security company providing audits, security products, and advisory services.",
      specialties: ["DeFi", "Enterprise Blockchain", "Stablecoins", "Bridges"],
      website: "https://quantstamp.com",
    },
  ];

  return (
    <div className="container py-16">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 mb-4">
          Top Smart Contract Audit Firms
        </h2>
        <p className="body-md text-muted-foreground max-w-2xl mx-auto">
          While our AI-powered audits provide excellent security coverage, these
          professional audit firms offer comprehensive manual reviews for
          critical projects.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auditFirms.map((firm, index) => (
          <motion.div
            key={firm.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-white/5 glass h-full flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center overflow-hidden">
                    <img
                      src={firm.logo || "/placeholder.svg"}
                      alt={firm.name}
                      className="w-8 h-8 rounded-md"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{firm.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {firm.description}
                </p>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {firm.specialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="outline"
                        className="bg-black/20"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-white/5">
                <Link
                  href={firm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
