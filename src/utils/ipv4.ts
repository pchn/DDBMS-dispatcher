import { Address4 } from 'ip-address'
import { logger } from '../index'

export class ipv4 {
  public address: Address4 = undefined
  public port: number = undefined

  /**
     * @returns string containing IPv4 address.
     */
  toString () {
    if (this.port != undefined) {
      return this.address.correctForm() + ':' + this.port.toString()
    } else {
      return this.address.correctForm()
    }
  }

  /**
     * @param otherAddress IPv4 address to check equality with.
     * @returns `true` if addresses are equal, `false` otherwise.
     */
  equals (otherAddress: ipv4) : boolean {
    return (
      (this.address.toHex() === otherAddress.address.toHex()) &&
            (this.port == otherAddress.port)
    )
  }

  constructor (address: string) {
    const addressAndPort = address.split(':')
    logger.debug(addressAndPort)
    if (addressAndPort.length < 1 || addressAndPort.length > 2) {
      logger.error()
      throw new Error('Invalid address provided: ' + address)
    }
    this.address = new Address4(addressAndPort[0])
    if (addressAndPort.length == 2) {
      this.port = parseInt(addressAndPort[1])
      if (this.port < 0 || this.port > 65535) {
        logger.error()
        throw new Error('Invalid port provided' + this.port.toString())
      }
    }
  }
}
