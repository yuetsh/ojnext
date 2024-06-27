import { Icon } from "@iconify/vue"
import { NFlex } from "naive-ui"

export function renderTableTitle(title: string, icon: string): any {
  return h(NFlex, { align: "center", size: 4 }, () => [
    h(Icon, { icon: icon, width: 20, height: 20 }),
    title,
  ])
}
