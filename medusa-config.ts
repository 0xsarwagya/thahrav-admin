import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const BACKEND_URL = process.env.BACKEND_URL || "localhost:9000"
const ADMIN_URL = process.env.ADMIN_URL || "localhost:7000"
const STORE_URL = process.env.STORE_URL || "localhost:8000"

module.exports = defineConfig({
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
  },
  modules: [
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
      resolve: "medusa-plugin-auth-v2",
      options: {
        // JWT settings
        jwt: {
          secret: process.env.JWT_SECRET,
          expiresIn: "7d"
        },
        // Cookie settings
        cookie: {
          name: "medusa-auth",
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        },
        // OAuth provider configurations
        google: {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          // Strategy options
          strategyOptions: {
            scope: ["profile", "email"]
          }
        }
      }
    }
  ],
})
