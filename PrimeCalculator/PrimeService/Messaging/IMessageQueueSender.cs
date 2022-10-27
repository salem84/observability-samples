namespace PrimeCalculator.PrimeService.Messaging
{
    public interface IMessageQueueSender
    {
        public void Send(string queueName, string message);
    }
}
