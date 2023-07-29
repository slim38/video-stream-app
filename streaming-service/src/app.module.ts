import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'PUBLISHER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'streaming-service',
            brokers: [`${process.env.KAFKA_BROKER}`],
          },
          consumer: {
            groupId: 'streaming-service-mod'
          }
        }
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
