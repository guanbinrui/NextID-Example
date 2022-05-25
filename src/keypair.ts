import { randomBytes } from 'crypto'
import { HDKey } from 'wallet.ts'
import { ecsign, toRpcSig, keccakFromString } from 'ethereumjs-util'

export function createKeyPiar() {
    const seed = randomBytes(66)
    return HDKey.parseMasterSeed(seed).derive('')
}

export async function sign(message: string, privateKey: Buffer | null) {
    if (privateKey === null) throw new Error('Failed to sign.')
    const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${message.length}${message}`, 256)
    const signature = await ecsign(messageHash, privateKey)
    return Buffer.from(toRpcSig(signature.v, signature.r, signature.s).slice(2), 'hex').toString('base64')
}
