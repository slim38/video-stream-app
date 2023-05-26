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
            brokers: ['broker:29092'],
          },
          consumer: {
            groupId: 'streaming-service'
          }
        }
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
