import { logger } from '../index'
import { newFragmentResponseDto } from '../dto/newFragment'
import { newNodeResponseDto } from '../dto/newNode'
import { FragmentData, NodeData } from './types'
import { ipv4 } from '../utils/ipv4'

/**
 * Represents dispatcher server of the distributed DBMS.
 */
export class Dispatcher {
  // TODO: Tree structure could be used to store node data if the system size grows severely
  // TODO: Hash of node's ip could be used as index (so binary tree could work just fine)
  // TODO: Local DB should be used to store dispather table if the DB`s data fragments amount grows severely
  // TODO: Node authorization is required for production version to avoid access vulnerabilities

  /**
     * Table storing data on node's requests to data fragments of the DB.
     * `dispatcherTable[i]`'s `id` is not necessarily equal to `i` as fragments are added asynchronously.
     */
  public dispatcherTable: FragmentData[]

  /**
     * Array storing system's nodes' data (such as id, ipv4 address, etc.)
     * `NodeData[i]`'s `id` is not necessarily equal to `i` as fragments are added asynchronously.
     */
  public nodes: NodeData[]

  /**
     * Array is used to store only one value in order to have an ability to call {@link Atomics.add}
     */
  private fragmentsCount: Uint32Array

  /**
     * Array is used to store only one value in order to have an ability to call {@link Atomics.add}
     */
  private nodesCount: Uint32Array

  getFragmentsCount () : number {
    return this.fragmentsCount[0]
  }

  getNodesCount () : number {
    return this.nodesCount[0]
  }

  /**
     * Returns the id of node with corresponding {@link ip}. Returns -1 if the node doesn't exist.
     * @param ip ipv4 address of the node
     * @returns id of the node or -1 if the node doesn't exist
     */
  public nodeId (ip: ipv4) : number {
    for (const node of this.nodes) {
      if (node.address.equals(ip)) {
        return node.id
      }
    }
    return -1
  }

  /**
     * Registers new system's node. Node is only added if doesn't exist already, existing node's id is returned otherwise.
     * @param ip ipv4 address of the node
     * @returns id of the node (newly added or already existed)
     */
  addNode = async (ip: ipv4) : Promise<newNodeResponseDto> => {
    logger.debug(ip)

    let nodeId = this.nodeId(ip)

    if (nodeId == -1) {
      nodeId = Atomics.add(this.nodesCount, 0, 1)

      for (const fragmentData of this.dispatcherTable) {
        fragmentData.stats.push({ id: nodeId, requestCount: 0 })
      }

      this.nodes.push({ id: nodeId, address: ip })
    }

    logger.debug(this.dispatcherTable)

    return { nodeId }
  }

  /**
     * Registers new fragment in DB.
     * @param storingNodeId id of the node that data is stored into.
     * @returns id of the newly added fragment.
     * @throws @link
     */
  addFragment = async (storingNodeId: number) : Promise<newFragmentResponseDto> => {
    logger.debug(this.fragmentsCount)

    if (storingNodeId >= this.nodesCount[0]) {
      logger.error()
      throw new RangeError('Id ' + storingNodeId.toString() + ' is invalid as there are ' + this.nodesCount[0].toString() + ' ids (starting from 0)')
    }

    const fragmentId = Atomics.add(this.fragmentsCount, 0, 1)

    const newFragmentData: FragmentData = {
      id: fragmentId,
      storingNodeId,
      stats: []
    }

    for (let i = 0; i < this.nodesCount[0]; i++) {
      newFragmentData.stats.push({ id: i, requestCount: 0 })
    }

    this.dispatcherTable.push(newFragmentData)

    logger.debug(this.dispatcherTable)

    return { fragmentId }
  }

  constructor () {
    this.dispatcherTable = []
    this.nodes = []

    this.nodesCount = new Uint32Array(
      new SharedArrayBuffer(
        Uint32Array.BYTES_PER_ELEMENT * 1
      )
    )
    this.nodesCount[0] = 0

    this.fragmentsCount = new Uint32Array(
      new SharedArrayBuffer(
        Uint32Array.BYTES_PER_ELEMENT * 1
      )
    )
    this.fragmentsCount[0] = 0
  }
}
