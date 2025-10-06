import { getWebsiteConfig } from "oj/api"
import { WebsiteConfig } from "utils/types"

export const useConfigStore = defineStore("config", () => {
  const config = ref<WebsiteConfig>({
    website_base_url: "",
    website_name: "",
    website_name_shortcut: "",
    website_footer: "",
    submission_list_show_all: true,
    allow_register: false,
    class_list: [],
  })
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
