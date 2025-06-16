import {
    ItemTaxCalculationLine,
    ShippingTaxCalculationLine,
    ItemTaxLineDTO,
    ShippingTaxLineDTO,
    TaxCalculationContext,
    TaxRateDTO,
} from "@medusajs/framework/types"

import { ITaxProvider } from "@medusajs/framework/types"

type ConstructorProps = {
    origin_province_code: string // e.g., "MH"
}

export default class IndianGstTaxProvider implements ITaxProvider {
    static identifier = "indian-gst"
    private readonly originProvince: string

    constructor({ origin_province_code }: ConstructorProps) {
        this.originProvince = origin_province_code.toUpperCase()
    }

    getIdentifier(): string {
        return IndianGstTaxProvider.identifier
    }

    async getTaxLines(
        itemLines: ItemTaxCalculationLine[],
        shippingLines: ShippingTaxCalculationLine[],
        context: TaxCalculationContext
    ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
        const shippingProvince = context.address.province_code?.toUpperCase() || "BR"
        const shippingCountry = context.address.country_code?.toUpperCase() || "IN"

        const isDomestic = shippingCountry === "IN"
        const isIntraState = isDomestic && shippingProvince === this.originProvince

        const result: (ItemTaxLineDTO | ShippingTaxLineDTO)[] = []

        const createItemTaxLines = (
            id: string,
            base: number,
            rates: TaxRateDTO[],
            isShipping: boolean = false
        ): (ItemTaxLineDTO | ShippingTaxLineDTO)[] => {
            const totalRate = rates.reduce((acc, r) => acc + (r.rate ?? 0), 0)

            return rates.map((rate) => {
                const baseTaxLine = {
                    rate: rate.rate ?? 0,
                    name: rate.name,
                    code: rate.code ?? "",
                    provider_id: this.getIdentifier(),
                }

                if (isShipping) {
                    return {
                        ...baseTaxLine,
                        shipping_line_id: id,
                    } as ShippingTaxLineDTO
                } else {
                    return {
                        ...baseTaxLine,
                        item_id: id,
                        line_item_id: id,
                    } as ItemTaxLineDTO
                }
            })
        }

        for (const itemLine of itemLines) {
            const baseAmount = Number(itemLine.line_item.unit_price || 0) * Number(itemLine.line_item.quantity || 1)
            const itemRates: TaxRateDTO[] = []

            if (isIntraState) {
                itemRates.push(...itemLine.rates.filter(r => r.code === "CGST" || r.code === "SGST"))
            } else {
                itemRates.push(...itemLine.rates.filter(r => r.code === "IGST"))
            }

            const taxLines = createItemTaxLines(itemLine.line_item.id, baseAmount, itemRates, false)
            result.push(...taxLines)
        }

        for (const shippingLine of shippingLines) {
            const baseAmount = Number(shippingLine.shipping_line.unit_price || 0)
            const shippingRates: TaxRateDTO[] = []

            if (isIntraState) {
                shippingRates.push(...shippingLine.rates.filter(r => r.code === "CGST" || r.code === "SGST"))
            } else {
                shippingRates.push(...shippingLine.rates.filter(r => r.code === "IGST"))
            }

            const taxLines = createItemTaxLines(shippingLine.shipping_line.id, baseAmount, shippingRates, true)
            result.push(...taxLines)
        }

        return result
    }
}  