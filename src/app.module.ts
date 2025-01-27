import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { join } from 'path'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ServeStaticModule } from '@nestjs/serve-static'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { CookieParserMiddleware } from './middleware/cookie-parser.middleware'
import { GraphQLFormattedError } from 'graphql'

const pubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000)
    }
  }
})

@Module({
  // imports: [
  //   // GraphQLモジュール
  //   GraphQLModule.forRoot<ApolloDriverConfig>({
  //     driver: ApolloDriver,
  //     // "Code First" 開発の場合は自動で schema.gql を生成
  //     autoSchemaFile: true,
  //     // Subscription (WebSocket) を有効化
  //     subscriptions: {
  //       'graphql-ws': true, // graphql-ws用
  //       'subscriptions-transport-ws': true // subscriptions-transport-ws用(必要に応じて)
  //     },
  //     // GraphQL PlaygroundをON(開発用)
  //     playground: true
  //   })
  // ],
  // providers: []
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/'
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule, AppModule, UserModule, AuthModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: async () => {
        return {
          playground: true,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          installSubscriptionHandlers: true,
          formatError: (error: GraphQLFormattedError) => {
            console.error('formatErrorからのGraphQL Error:', error)
            return error
          },
          subscriptions: {
            'graphql-ws': true,
            'subscriptions-transport-ws': true
          },
          // cors: {
          //   origin: 'http://localhost:5173',
          //   credentials: true,
          // },
          // onConnect: (connectionParams) => {
          //   const token = tokenService.extractToken(connectionParams)
          //   if (!token) {
          //     throw new Error('トークンを取得できませんでした。')
          //   }
          //   const user = tokenService.validateToken(token)
          //   if (!user) {
          //     throw new Error('不正なトークンです。')
          //   }
          //   return { user }
          // },
          context: (req, res, connection) => {
            if (connection) {
              // WebSocket サブスクリプションの場合
              return {
                req: connection.context.req || null,
                res: connection.context.res || null,
                pubSub,
                // 必要に応じて追加の情報を設定
                user: connection.context.user || null
              }
            }
            // 通常のHTTPリクエストの場合
            console.log('=======================================')
            console.log('HTTPリクエストのreq:', req.req.headers['cookie'])
            console.log('=======================================')
            return { req: req.req, res, pubSub }
          }
        }
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CookieParserMiddleware) // ミドルウェアを適用
      .forRoutes('*') // 全ルートで有効化
  }
}
