import { logger } from "./index";
import { newFragmentResponseDto } from "./dto/newFragment";
import { newNodeResponseDto } from "./dto/newNode";

type NodeStats = {
    id: number;
    requestCount: number;
}

type FragmentData = {
    id: number;
    storingNodeId: number;
    stats: NodeStats[];
}

type NodeData = {
    id: number;
    ip: string;
}

export class Dispatcher {
    
    public dispatcherTable: FragmentData[]
    public nodes: NodeData[]
    fragmentsCount: Uint32Array
    nodesCount: Uint32Array

    getFragmentsCount() : number {
        return this.fragmentsCount.at(0)
    }

    getNodesCount() : number {
        return this.nodesCount.at(0)
    }
    
    addNode = async (ip: string) : Promise<newNodeResponseDto> => {
        logger.debug(this.nodesCount)

        let nodeId = Atomics.add(this.nodesCount, 0, 1)

        for(let fragmentData of this.dispatcherTable) {
            fragmentData.stats.push({ id: nodeId, requestCount: 0})
        }

        this.nodes.push({id: nodeId, ip: ip})

        logger.debug(this.dispatcherTable)

        return { nodeId: nodeId }
    }

    addFragment = async (storingNodeId: number) : Promise<newFragmentResponseDto> => {
        logger.debug(this.fragmentsCount)
        
        let fragmentId = Atomics.add(this.fragmentsCount, 0, 1)

        let newFragmentData: FragmentData = {
            id: fragmentId,
            storingNodeId: storingNodeId,
            stats: []
        }

        for(let i = 0; i < this.nodesCount.at(0); i++) {
            newFragmentData.stats.push({id: i, requestCount: 0})
        }

        this.dispatcherTable.push(newFragmentData)

        logger.debug(this.dispatcherTable)

        return { fragmentId: fragmentId }
    }

    constructor() {
        this.dispatcherTable = []
        this.nodes = []

        var nodesCount = new SharedArrayBuffer(4);
        this.nodesCount = new Uint32Array(nodesCount)
        this.nodesCount[0] = 0

        var fragmentsCount = new SharedArrayBuffer(4);
        this.fragmentsCount = new Uint32Array(fragmentsCount)
        this.fragmentsCount[0] = 0
    }

}