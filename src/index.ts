import fetch from "node-fetch";
import { ProofClient, ProofService } from "@nextdotid/sdk";
import { EthereumAddress } from "wallet.ts";
import { createKeyPiar, sign } from "./keypair";

async function main() {
  const persona = createKeyPiar();
  const wallet = createKeyPiar();
  const { address } = EthereumAddress.from(Buffer.from(wallet.publicKey));

  console.log("Wallet & Persona");
  console.log({
    walletAddress: address,
    personaPublicKey: `0x${persona.publicKey.toString("hex")}`,
  });

  const proofService = new ProofService({
    platform: "ethereum",
    identity: address,
    public_key: `0x${persona.publicKey.toString("hex")}`,
    // @ts-ignore
    client: ProofClient.development(fetch),
  });

  const proof = await proofService.createProof({
    async onExtra(payload) {
      return {
        signature: await sign(payload, persona.privateKey),
        wallet_signature: await sign(payload, wallet.privateKey),
      };
    },
  });

  // verify proof
  await proof.verify();

  // query all bindings
  const bindings = await proofService.allExistedBinding();

  console.log(JSON.stringify(bindings, null, 2));
}

main();
