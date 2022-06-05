import { JsonController, Body, Post, Get } from 'routing-controllers'
import { nodeIdRequestDto } from '../dto/nodeId'
import { Dispatcher } from '../dispatcher/dispatcher'
import { newFragmentRequestDto, newFragmentResponseDto } from '../dto/newFragment'
import { newNodeRequestDto, newNodeResponseDto } from '../dto/newNode'
import { ipv4 } from '../utils/ipv4'

@JsonController()
export class Rest {
  static dispatcher: Dispatcher

    @Post('/api/newNode')
  newNode (@Body() json: newNodeRequestDto) : Promise<newNodeResponseDto> {
    return Rest.dispatcher.addNode(new ipv4(json.ip)).then(it => it)
  }

    @Post('/api/newFragment')
    newFragment (@Body() json: newFragmentRequestDto) : Promise<newFragmentResponseDto> {
      return Rest.dispatcher.addFragment(json.storingNodeId).then(it => it)
    }

    @Get('/api/nodeId')
    nodeId (@Body() json: nodeIdRequestDto) : number {
      return Rest.dispatcher.nodeId(new ipv4(json.ip))
    }

    @Get('/api/nodesCount')
    nodesCount () : number {
      return Rest.dispatcher.getNodesCount()
    }

    @Get('/api/fragmentsCount')
    fragmentsCount (): number {
      return Rest.dispatcher.getFragmentsCount()
    }

    static init (dispatcher: Dispatcher) {
      this.dispatcher = dispatcher
    }
}
