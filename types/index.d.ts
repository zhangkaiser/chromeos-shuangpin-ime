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


interface UserStorageConfig {
  chos_init_punc_selection: boolean,
  chos_next_page_selection: boolean,
  chos_prev_page_selection: boolean,
  chos_init_sbc_selection: boolean,
  chos_init_vertical_selection: boolean,
  chos_init_enable_traditional: boolean,
  solution: string
}