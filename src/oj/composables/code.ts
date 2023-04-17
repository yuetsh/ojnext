import { STORAGE_KEY } from "~/utils/constants"
import storage from "~/utils/storage"
import { Code } from "~/utils/types"

export const code = reactive<Code>({
  value: "",
  language: storage.get(STORAGE_KEY.LANGUAGE) || "C",
})
