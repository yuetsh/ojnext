import { getWebsiteConfig } from "~/oj/api"
import { WebsiteConfig } from "~/utils/types"

export const useConfigStore = defineStore("config", () => {
  const config = ref<WebsiteConfig>()
  async function getConfig() {
    const res = await getWebsiteConfig()
    config.value = res.data
    document.title = res.data.website_name
  }
  return {
    config,
    getConfig,
  }
})
