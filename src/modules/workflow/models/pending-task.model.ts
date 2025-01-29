import { Serializable } from '../../base/commons/serializable'
import { ObjectTask } from './object-task.model'

export class PendingTask extends Serializable {
  id: string = undefined
  objectId: string = undefined
  objectName: string = undefined
  objectGroup: string = undefined
  dateCreated: Date = undefined
  dateUpdated: Date = undefined
  comment: string = undefined
  taskType: string = undefined
  taskAction: string = undefined
  taskStatus: string = undefined
  workflowName: string = undefined
  workflowTemplate: string = undefined
  remark: string = undefined
  instanceId: string = undefined
  workflowId: string = undefined
  objectTaskId: string = undefined
  assignee: any[] = undefined
  flowId: string = undefined
  lastUpdated?: Date = undefined
  pendingTaskHistory: any[]

  objectTask: ObjectTask = undefined;
  [key: string]: any

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
