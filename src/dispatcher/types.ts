import { ipv4 } from '../utils/ipv4'

export type NodeStats = {
    id: number;
    requestCount: number;
}

export type FragmentData = {
    id: number;
    storingNodeId: number;
    stats: NodeStats[];
}

export type NodeData = {
    id: number;
    address: ipv4;
}
