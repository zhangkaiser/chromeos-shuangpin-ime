
type MessageType = "string"

interface IMessageProps {
  extID?: string,
  cb?: (response: any) => void,
  data: {
    type: MessageType,
    value: any[]
  }
}