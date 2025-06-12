import { MedusaContainer } from "@medusajs/framework/types"

export default async function keepAliveJob(container: MedusaContainer) {
    const response = await fetch("https://admin.thahrav.shop/")
    const logger = container.resolve('logger')
    logger.info("Keep-alive!")
}

export const config = {
    name: "keep-alive-every-minute",
    schedule: "* * * * *",
}