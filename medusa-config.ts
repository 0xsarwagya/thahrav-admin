import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    vite: () => {
      return {
        optimizeDeps: {
          include: ["qs"],
        },
      };
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseName: "defaultdb",
    databaseSchema: "public",
    databaseDriverOptions: {
      connection: {
        ssl: {
          rejectUnauthorized: false,
          host: process.env.DATABASE_HOST,
          port: Number(process.env.DATABASE_PORT),
        },
      },
    },
    databaseLogging: true,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    redisUrl: process.env.REDIS_URL,
    redisPrefix: "medusa",
    redisOptions: {
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.NODE_ENV === "development" ? "http://localhost:10000/auth/google/callback" : "https://admin.thahrav.shop/auth/google/callback",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/analytics",
      options: {
        providers: [
          {
            resolve: "@medusajs/analytics-posthog",
            id: "posthog",
            options: {
              posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
              posthogHost: process.env.POSTHOG_HOST,
            },
          }
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "medusav2-file-supabase-storage/modules/file",
            options: {
              bucketName: process.env.BUCKET_NAME,
              supabaseUrl: process.env.SUPABASE_URL,
              apiKey: process.env.SUPABASE_KEY,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@devx-commerce/razorpay/providers/payment-razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_ID,
              key_secret: process.env.RAZORPAY_SECRET,
              razorpay_account: process.env.RAZORPAY_ACCOUNT,
              automatic_expiry_period: 30,
              manual_expiry_period: 20,
              refund_speed: "normal",
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
              auto_capture: true,
            },
          },
        ],
      },
    },
    {

      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          {
            resolve: "./src/modules/tax/providers",
            id: "indian-gst",
            options: {
              origin_province_code: "BR",
            },
          },
        ],
      },
    },
  ],
  plugins: [
    {
      resolve: "medusa-plugin-wishlist",
      options: {}
    },
    {
      resolve: "@rsc-labs/medusa-products-bought-together-v2",
      options: {}
    },
    {
      resolve: "@lumot-eu/medusa-plugin-nodemailer",
      options: {
        fromAddress: process.env.SMTP_FROM,
        transport: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        templatesDir: "email-templates",
        layoutsDir: "email-templates/_layouts",
        partialsDir: "email-templates/_partials",
        defaultLayout: "default.hbs",
        templateMap: {
          "order.placed": {
            name: "order.placed",
            subject: "Order confirmation",
          },
          "order.shipped": {
            name: "order.shipped",
            subject: "Order shipped",
          },
          "order.canceled": {
            name: "order.canceled",
            subject: "Order canceled",
          },
          "order.updated": {
            name: "order.updated",
            subject: "Order updated",
          },
          "return.requested": {
            name: "return.requested",
            subject: "Return requested",
          },
          "return.received": {
            name: "return.received",
            subject: "Return received",
          },
          "return.completed": {
            name: "return.completed",
            subject: "Return completed",
          },
          "customer.account_created": {
            name: "customer.account_created",
            subject: "Account created",
          },
          "customer.password_reset": {
            name: "customer.password_reset",
            subject: "Password reset",
          },
          "customer.order_updated": {
            name: "customer.order_updated",
            subject: "Order updated",
          },
          "gift_card.created": {
            name: "gift_card.created",
            subject: "Gift card created",
          },
          "gift_card.updated": {
            name: "gift_card.updated",
            subject: "Gift card updated",
          },
          "gift_card.deleted": {
            name: "gift_card.deleted",
            subject: "Gift card deleted",
          },
          "gift_card.expired": {
            name: "gift_card.expired",
            subject: "Gift card expired",
          },
        },
      },
    },
    {
      resolve: "@devx-commerce/product-reviews",
      options: {
        defaultReviewStatus: "approved",
      },
    },
    {
      resolve: "@tsc_tech/medusa-plugin-notification-template",
      options: {
      }
    },
    {
      resolve: "@nap-medusa/invoice",
      options: {
      }
    },
    {
      resolve: "@oak-digital/product-feed",
      options: {},
    },
  ]
})