/// <reference path="./mvvm.d.ts" />
interface Window {
  dataloader: any
}

type TargetPosition = ({
  index: number;
  position: number;
  source: number | number[]
}) | undefined

type TargetSegment = ({
  index: number,
  segment: number | number[],
  prob: number
})
