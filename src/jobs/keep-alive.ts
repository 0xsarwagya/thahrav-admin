import { MedusaContainer } from "@medusajs/framework/types"

export default async function greetingJob(container: MedusaContainer) {
    const response = await fetch("https://admin.thahrav.shop/api/keep-alive")
    const data = await response.text()

    const logger = container.resolve("logger")
    logger.info("Keep-alive!")
}

export const config = {
    name: "keep-alive-every-minute",
    schedule: "* * * * *",
}