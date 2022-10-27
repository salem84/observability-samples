using RabbitMQ.Client;

namespace PrimeCalculator.PrimeService.Messaging
{
    public interface IMQClient
    {
        IModel CreateChannel();
    }
}
