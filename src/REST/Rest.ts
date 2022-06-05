import { JsonController, Body, Post } from 'routing-controllers';
import { Dispatcher } from '../dispatcher';
import { newFragmentRequestDto } from '../dto/newFragment';
import { newNodeRequestDto } from '../dto/newNode';

@JsonController()
export class Rest {

    static dispatcher: Dispatcher

    @Post('/api/newNode')
    newNode(@Body() json: newNodeRequestDto) {
        return Rest.dispatcher.addNode(json.ip).then(it => it)
    }

    @Post('/api/newFragment')
    newFragment(@Body() json: newFragmentRequestDto) {
        return Rest.dispatcher.addFragment(json.storingNodeId).then(it => it)
    }

    static init(dispatcher: Dispatcher) {
        this.dispatcher = dispatcher
    }
}
