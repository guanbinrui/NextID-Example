import fetch from 'node-fetch'
import { ProofClient } from "@nextdotid/sdk"
import { EthereumAddress } from "wallet.ts"
import { createKeyPiar, sign } from "./keypair"

const PRODUCTION_URL = new URL('https://proof-service.next.id')

async function main() {
    const persona = createKeyPiar()
    const wallet = createKeyPiar()
    const { address } = EthereumAddress.from(Buffer.from(wallet.publicKey))

    console.log('Wallet & Persona')
    console.log({
        walletAddress: address,
        personaPublicKey: `0x${persona.publicKey.toString('hex')}`,
    })
    
    // @ts-ignore
    const proofClient = new ProofClient(PRODUCTION_URL, fetch)

    // get payload 
    const payload = await proofClient.bindProof({
        action: 'create',
        identity: address,
        platform: 'ethereum',
        public_key: `0x${Buffer.from(persona.publicKey).toString('hex')}`,
    })

    // create proof
    const personaSign = await sign(payload.sign_payload, persona.privateKey)
    const walletSigned = await sign(payload.sign_payload, wallet.privateKey)

    await proofClient.createProofModification<undefined, {
        wallet_signature: string
        signature: string
    }>({
        action: 'create',
        identity: address,
        platform: 'ethereum',
        public_key: `0x${Buffer.from(persona.publicKey).toString('hex')}`,
        proof_location: undefined,
        extra: {
            signature: personaSign,
            wallet_signature: walletSigned,
        },
        uuid: payload.uuid,
        created_at: payload.created_at,
    })


    // query all bindings
    const bindings = await proofClient.queryExistedBinding({
        platform: 'ethereum',
        identity: [address],
    })

    console.log(JSON.stringify(bindings))
}

main()